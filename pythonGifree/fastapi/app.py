from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse

import pandas as pd

#gpt랑 통신
from langchain_core.messages import AIMessage, SystemMessage, HumanMessage
from langchain_openai import ChatOpenAI
from langchain_experimental.agents import create_pandas_dataframe_agent
from langchain.agents.agent_types import AgentType

#그래프를 그리는
import matplotlib.pyplot as plt


#폰트 '한글 폰트' 적용할 때 필요
import matplotlib.font_manager as fm
import os, io, subprocess, sys
import db, base64

from dotenv import load_dotenv

from image import router as image_router

app = FastAPI()
# 새롭게 파일을 받았을 경우 현 파일 내에 있는 @@@ReadMe.txt@@@ 를 읽어보세요.
# 읽고 했는데도 모르겠다 싶으면 터미널 실행하는 위치가 정확한지 확인해 보시고
# 그래도 모르겠다 싶으면 말 걸어주세요(이용석)

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")
# --- CORS 설정 ---
# 프론트엔드 포트가 5173일 경우를 대비해 추가 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(image_router)#이미지분석

# --- API 엔드포인트 정의 ---
@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.post('/chat')
async def chat(request: Request):
    data = await request.json()
    user_message = data.get('message')
    # 통합된 메인 챗봇 함수를 호출합니다.
    response = main_chatbot_logic(user_message)
    return {'response': response.content}

def main_chatbot_logic(input_text: str) -> AIMessage:
    """
    (최종 완성 버전) 데이터 소스별 역할과 책임을 명확히 하여 라우터의 정확도를 높인 최종 로직
    """
    print(f"\n--- 챗봇 로직 시작 (질문: {input_text}) ---")

    try:
        router_model = ChatOpenAI(temperature=0, request_timeout=15) # 판단은 일관되어야 하므로 temperature=0
        
        # --- 1. 데이터 소스 목록 및 역할(R&R) 매우 상세하게 정의 여기를 통해 각 응답이 나눠지도록---
        db_tables = db.search_db()
        csv_source_name = 'lifestyle_data'
        donation_summary_source_name = 'donation_summary'

       
        all_data_sources_description = f"""
        - **DB Tables ({db_tables})**:
        - **역할**: 데이터베이스에 저장된 **'데이터 목록'** 이나 **'개별 정보'** 를 직접 조회할 때 사용합니다.
        - **포함된 정보의 예**: `tbl_product`는 상품 목록과 가격, `member`는 회원 목록, `gifticons`는 등록된 기프티콘 이름과 가격 정보 등을 담고 있습니다.
        - **질문 유형**: "스타벅스 기프티콘 가격 얼마야?", "회원 목록 보여줘", "어떤 상품들이 있어?" 와 같이 **'~는 뭐야?', '~ 목록 보여줘'** 형태의 질문에 적합합니다.
        - **주의**: '방법', '정책', '규칙', '기준', '이유' '절차' 등을 묻는 질문에는 답변할 수 없습니다.

        - **CSV File (이름: {csv_source_name})**:
        - **역할**: 회사의 **'정책, 규칙, 방법, 절차, 이벤트, 가이드'** 등이 상세히 설명된 텍스트 문서입니다.
        - **포함된 정보의 예**: "기프티콘 판매 절차", "판매 수수료 정책", "**유효기간 기준**", "회원가입 방법", "신규 가입 이벤트 내용" 등.
        - **질문 유형**: "**~하려면 어떻게 해?**", "**~에 대한 기준/규칙이 뭐야?**", "**~하는 방법 알려줘**", "**~이벤트 내용은?**" 과 같이, **'방법(How)'이나 '규칙(Rule)'** 에 대한 질문에 적합합니다.

        - **Donation Summary (이름: {donation_summary_source_name})**:
        - **역할**: 사용자별 기부 **'통계'** 또는 **'요약'** 정보에 답변할 때 사용합니다.
        - **질문 유형**: "가장 많이 기부한 사람은?", "총 기부 횟수 알려줘"
        """

        # --- 2. AI 라우터에게 '사고 과정'을 거쳐 판단하도록 지시 ---
        system_prompt_for_router = f'''
        당신은 사용자의 질문 의도를 정확히 분석하여 가장 적합한 데이터 소스를 추천하는 '데이터 라우팅 전문가'입니다.

        # 당신의 임무:
        1. 사용자의 질문을 읽고, 질문의 핵심 의도가 **'데이터 조회'** 인지, 아니면 **'방법/규칙/정책에 대한 설명'** 인지, 아니면**'기부'** 인지 먼저 파악합니다.
        2. 아래 [데이터 소스 상세 설명]을 정독하고, 파악된 의도에 가장 적합한 데이터 소스의 이름을 '하나만' 골라냅니다.
        3. 다른 설명 없이 오직 선택된 데이터 소스의 이름만 정확하게 반환합니다. (예: tbl_product, lifestyle_data)

        # [데이터 소스 상세 설명]
        {all_data_sources_description}

        ---
        # 예시 사고 과정
        - 질문: "기프티콘 유효기간 기준에 대해 알려줘"
        - 분석: 사용자는 '기프티콘 목록'이 아니라 '유효기간의 기준(규칙)'을 묻고 있다. '규칙'에 대한 설명은 CSV 파일에 있다.
        - 선택: lifestyle_data

        - 질문: "교촌치킨 허니콤보 가격이 얼마야?"
        - 분석: 사용자는 '교촌치킨'이라는 특정 데이터의 '가격' 정보를 묻고 있다. 이는 DB에서 조회해야 한다.
        - 선택: gifticons 또는 tbl_product
        ---
        '''

        print("[1/3] AI 라우터 호출...")
        router_messages = [
            SystemMessage(content=system_prompt_for_router),
            HumanMessage(content=input_text)
        ]
        ai_response = router_model.invoke(router_messages)
        chosen_source = ai_response.content.strip()
        print(f"[2/3] AI 라우터 선택: {chosen_source}")

        # --- 3. 선택된 소스에 따라 답변 생성 (이후 코드는 기존과 거의 동일) ---
        answer_model = ChatOpenAI(temperature=0, model="gpt-4o-mini", request_timeout=15)
        
        if chosen_source == donation_summary_source_name:
            print(f"--- [분기] 기부 요약('{chosen_source}') 경로 처리 시작 ---")
            try:
                # 1. db.py에 만들어 둔 요약 함수 호출
                summary_df = db.get_donation_summary()
                if summary_df.empty:
                    return AIMessage(content="기부 데이터를 찾을 수 없습니다.")

                # 2. 1등 데이터 추출 (SQL에서 이미 정렬했으므로 첫 번째 행이 1등)
                top_donor = summary_df.iloc[0]
                donor_name = top_donor['기부자']
                donation_count = top_donor['총기부횟수']
                donation_amount = top_donor['총기부금액']

                # 3. LLM을 사용하여 자연스러운 답변 생성 (이 부분 수정)
                donation_context = f"최다 기부자: {donor_name}, 총 기부 횟수: {donation_count}회, 총 기부 금액: {int(donation_amount)}원"
                
                # 기존 DB/CSV 프롬프트와 동일한 스타일 가이드를 적용
                final_prompt = f'''
                당신은 중고 기프티콘 거래 플랫폼 '기프리(Gifree)'의 공식 AI 챗봇, '기프리봇'입니다. 
                당신의 역할은 사용자의 질문에 대해 친절하고 명확하게 답변하여 도움을 주는 것입니다.

                # 당신이 따라야 할 답변 스타일 가이드:
                - 항상 전문적이고 신뢰감 있는 톤을 유지하세요.
                - '기프리에서는', '저희 기프리 서비스를 이용하시면' 등의 표현을 문맥에 맞게 자연스럽게 사용하여 '기프리'의 공식 챗봇임을 드러내세요.
                - 하지만 모든 답변을 '기프리'라는 단어로 시작할 필요는 전혀 없습니다. 가장 중요한 것은 사용자의 질문에 자연스럽고 직접적으로 답변하는 것입니다.
                - 답변은 항상 완전한 문장으로 예의 바르게 마무리해주세요.
                - 사용자가 질문한 내용에 대한 답변을 명확하게 포함하고, 필요한 경우 공감과 감사의 메시지를 추가합니다.

                # 좋은 답변 예시:
                - 사용자 질문: 판매 수수료 알려줘.
                - 좋은 답변: 네, 저희 기프리의 판매 수수료는 판매 금액의 5~10%이며, 브랜드나 프로모션에 따라 달라질 수 있습니다.
                - 사용자 질문: 가장 많이 기부한 사람은?
                - 좋은 답변: 네, 저희 기프리에서 현재까지 가장 많이 기부해주신 분은 홍길동님으로, 총 10회에 걸쳐 100,000원을 기부해주셨습니다. 소중한 나눔에 진심으로 감사드립니다!

                # 나쁜 답변 예시:
                - 사용자 질문: 판매 수수료 알려줘.
                - 나쁜 답변: 기프리입니다. 판매 수수료는 5~10%입니다.
                
                [참고 데이터]를 바탕으로 [사용자 질문]에 대해 답변해주세요.
                # 답변 생성 규칙:
                - 답변은 반드시 마크다운(Markdown) 형식을 사용해서 가독성을 높여야 해.
                - 중요한 키워드나 제목은 **볼드체**로 표시해.
                - 설명할 항목이 여러 개이면, 글머리 기호(bullet point, '-')나 번호 목록을 사용해서 목록으로 만들어줘.
                - 문단과 문단 사이에는 반드시 줄바꿈을 넣어줘.
                만약 데이터에 관련 정보가 없다면 '데이터에 관련 정보가 없습니다.'라고 답변해주세요.

                # [참고 데이터]
                {donation_context}

                # [사용자 질문]
                {input_text}
                '''
                
                final_response = answer_model.invoke(final_prompt)
                return final_response

            except Exception as e: 
                print(f"기부 요약 처리 중 오류 발생: {e}")
                return AIMessage(content="기부 정보를 조회하는 중 오류가 발생했습니다.")



        elif chosen_source in db_tables:
            print(f"--- [분기] DB 테이블('{chosen_source}') 경로 처리 시작 ---")
            data_context = db.show_data(chosen_source).to_string()
            # ✅✅✅ 프롬프트 수정 ✅✅✅
            final_prompt = f'''
                당신은 중고 기프티콘 거래 플랫폼 '기프리(Gifree)'의 공식 AI 챗봇, '기프리봇'입니다. 
                당신의 역할은 사용자의 질문에 대해 친절하고 명확하게 답변하여 도움을 주는 것입니다.

                # 당신이 따라야 할 답변 스타일 가이드:
                - 항상 전문적이고 신뢰감 있는 톤을 유지하세요.
                - '기프리에서는', '저희 기프리 서비스를 이용하시면' 등의 표현을 문맥에 맞게 자연스럽게 사용하여 '기프리'의 공식 챗봇임을 드러내세요.
                - 하지만 모든 답변을 '기프리'라는 단어로 시작할 필요는 전혀 없습니다. 가장 중요한 것은 사용자의 질문에 자연스럽고 직접적으로 답변하는 것입니다.
                - 답변은 항상 완전한 문장으로 예의 바르게 마무리해주세요.

                # 좋은 답변 예시:
                - 사용자 질문: 판매 수수료 알려줘.
                - 좋은 답변: 네, 저희 기프리의 판매 수수료는 판매 금액의 5~10%이며, 브랜드나 프로모션에 따라 달라질 수 있습니다.

                # 나쁜 답변 예시:
                - 사용자 질문: 판매 수수료 알려줘.
                - 나쁜 답변: 기프리입니다. 판매 수수료는 5~10%입니다.
                
                [참고 데이터]를 바탕으로 [사용자 질문]에 대해 답변해주세요.
                # 답변 생성 규칙:
                - 답변은 반드시 마크다운(Markdown) 형식을 사용해서 가독성을 높여야 해.
                - 중요한 키워드나 제목은 **볼드체**로 표시해.
                - 설명할 항목이 여러 개이면, 글머리 기호(bullet point, '-')나 번호 목록을 사용해서 목록으로 만들어줘.
                - 문단과 문단 사이에는 반드시 줄바꿈을 넣어줘.
                만약 데이터에 관련 정보가 없다면 '데이터에 관련 정보가 없습니다.'라고 답변해주세요.

                # [참고 데이터]
                {data_context}

                # [사용자 질문]
                {input_text}
            '''
            final_response = answer_model.invoke(final_prompt)
            return final_response
        
        elif chosen_source == csv_source_name: 
            print(f"--- [분기] CSV 파일('{csv_source_name}') 경로 처리 시작 ---")
        try:
            with open('lifestyle_data.csv', 'r', encoding='utf-8') as f:
                csv_content = f.read()
                # ✅✅✅ 프롬프트 수정 ✅✅✅
                final_prompt = f"""
                당신은 중고 기프티콘 거래 플랫폼 '기프리(Gifree)'의 공식 AI 챗봇, '기프리봇'입니다. 
                당신의 역할은 사용자의 질문에 대해 친절하고 명확하게 답변하여 도움을 주는 것입니다.

                # 당신이 따라야 할 답변 스타일 가이드:
                - 항상 전문적이고 신뢰감 있는 톤을 유지하세요.
                - '기프리에서는', '저희 기프리 서비스를 이용하시면' 등의 표현을 문맥에 맞게 자연스럽게 사용하여 '기프리'의 공식 챗봇임을 드러내세요.
                - 하지만 모든 답변을 '기프리'라는 단어로 시작할 필요는 전혀 없습니다. 가장 중요한 것은 사용자의 질문에 자연스럽고 직접적으로 답변하는 것입니다.
                - 답변은 항상 완전한 문장으로 예의 바르게 마무리해주세요.

                # 좋은 답변 예시:
                - 사용자 질문: 판매 수수료 알려줘.
                - 좋은 답변: 네, 저희 기프리의 판매 수수료는 판매 금액의 5~10%이며, 브랜드나 프로모션에 따라 달라질 수 있습니다.

                # 나쁜 답변 예시:
                - 사용자 질문: 판매 수수료 알려줘.
                - 나쁜 답변: 기프리입니다. 판매 수수료는 5~10%입니다.

            # 사용자 질문:
            {input_text}
            """
            print("[3/3] 일반 답변 AI 호출 시작...")
            final_response = answer_model.invoke(final_prompt)
            print("--- 최종 답변 생성 완료! ---")
            return final_response
        except FileNotFoundError:
                error_message = f"오류: '{csv_source_name}.csv' 파일을 찾을 수 없습니다."
                print(error_message)
                return AIMessage(content=error_message)
        else: # 라우터가 예상 외의 답변을 한 경우 (예: 인사말 등)
            print(f"--- [분기] 일반 답변 경로 처리 시작 ---")
            final_prompt = f"다음 질문에 대해 친절한 챗봇처럼 답변해줘: {input_text}"
            final_response = answer_model.invoke(final_prompt)
            return final_response
            
    except Exception as e:
        import traceback
        traceback.print_exc()
        return AIMessage(content="죄송합니다, 답변 처리 중 오류가 발생했습니다.")


@app.post('/voice')
async def voice(request: Request):
    data = await request.json()
    user_message = data.get('message')

    # 메시지가 비어있는 경우, 여기서 처리를 중단하고 에러 메시지 반환
    if not user_message:      
        return {'response': '음성 메시지가 비어있습니다. 다시 시도해주세요.'}

    response = main_chatbot_logic(user_message)
    return {'response': response.content}


#한글 폰트 등록
fe = fm.FontEntry(
    fname=r'C:/Users/EZEN/Desktop/pythonGifree/fastapi/NanumGothic.ttf', name='NanumGothic')

fm.fontManager.ttflist.insert(0, fe)
plt.rcParams.update({'font.size':13, 'font.family':'NanumGothic'})


#DB로부터 필터링을 수행하는 기능
@app.post('/filter')
async def filtering(request: Request):
    data = await request.json()
    user_message = data.get('message')  # ✅ 이 줄이 반드시 있어야 함
    table = 'tbl_product'  # 또는 data.get('table')

    df = db.show_data(table)

    llm = ChatOpenAI()
    agent = create_pandas_dataframe_agent(
        ChatOpenAI(temperature=0, model='gpt-4o-mini'),
        df,
        verbose=True,
        agent_type="openai-tools", 
        allow_dangerous_code=True
    )

    response = agent.invoke({'input': user_message})  # ✅ user_message 정의되었어야 함
    print(response)
    return {'response': response['output']}


@app.post("/analyze")
async def analyze_data(request: Request):
    data = await request.json()
    question = data.get('message', "")
    print(f"--- 1. API 요청 받음: '{question}' ---") # 체크포인트 1

    # --- 1. DB에서 데이터 조회 (한 번만 수행) ---
    try:
        summary_df = db.get_donation_summary()
        if summary_df is None or summary_df.empty:
            return JSONResponse(status_code=404, content={"error": "분석할 데이터가 없습니다."})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": f"DB 조회 중 오류: {e}"})
    
    print("--- 2. DB 조회 성공 ---") # 체크포인트 2

    # --- 2. AI로 질문 의도 파악 (한 번만 수행) ---
    analysis_model = ChatOpenAI(temperature=0, model="gpt-4o-mini")
    analysis_prompt = f"사용자 질문 '{question}'은 '횟수'와 '금액' 중 무엇에 대한 순위를 묻는 건가요? 다른 말 없이 '횟수' 또는 '금액'으로만 답해주세요."
    
    print("--- 3. 의도 파악 AI 호출 시작 ---") # 체크포인트 3
    analysis_result = analysis_model.invoke(analysis_prompt).content.strip()
    print(f"--- 4. 의도 파악 AI 응답 받음: '{analysis_result}' ---") # 체크포인트 4
    
    # 3. 분석 결과에 따라 데이터 정렬 및 가공
    y_axis_label = '' # y축 라벨 변수 초기화
    if analysis_result == '금액' and '총기부금액' in summary_df.columns:
        sort_by_column = '총기부금액'
        y_axis_label = '총 기부 금액 (원)'
    else: # 기본값 또는 '횟수'일 경우
        sort_by_column = '총기부횟수'
        y_axis_label = '총 기부 횟수'
    summary_df = summary_df.sort_values(by=sort_by_column, ascending=False)
    
    top_3_df = summary_df.head(3)
    if len(top_3_df) == 3:
        processed_df = top_3_df.iloc[[1, 0, 2]]
        colors = ['silver', 'gold', '#CD7F32']
    else:
        processed_df = top_3_df
        colors = ['skyblue'] * len(processed_df)

    # 4. Matplotlib 그래프 생성 및 최종 데이터 반환
    try:
        # ▼▼▼ 이 안의 모든 작업은 '시도'하는 위험 관리 구역입니다 ▼▼▼
        plt.figure(figsize=(8, 6))
        bars = plt.bar(
            processed_df['기부자'],
            processed_df[sort_by_column],
            color=colors,
            edgecolor='gray',
            width=0.8
        )
        for bar in bars:
            yval = bar.get_height()
            label_text = f'{int(yval):,}원' if analysis_result == '금액' else f'{int(yval)}회'
            plt.text(bar.get_x() + bar.get_width()/2.0, yval, label_text, va='bottom', ha='center', fontsize=16)

        plt.title(f'기부왕 TOP 3 ({analysis_result} 기준)', fontsize=16, pad=20)
        # plt.ylabel(y_axis_label, fontsize=16) # y축 라벨 사용
       # x축의 이름(라벨) 폰트 크기를 14로 설정합니다.
        plt.tick_params(axis='x', length=0, labelsize=14)

        # y축은 현재 보이지 않으므로 그대로 둡니다.
        plt.tick_params(axis='y', length=0)
        
        ax = plt.gca()
        ax.spines['top'].set_visible(False)
        ax.spines['right'].set_visible(False)
        ax.spines['left'].set_visible(False)
        ax.get_yaxis().set_ticks([])
        plt.tight_layout()

        # 이미지를 메모리에 저장
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        graph_image_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()

        # 표(리스트) 데이터 생성 (순위, 이름만 포함)
        top_10_df = summary_df.head(10).copy() # SettingWithCopyWarning 방지를 위해 .copy() 추가

        # 1. '순위' 컬럼을 맨 앞에 새로 추가합니다. (1위부터 10위까지)
        top_10_df.insert(0, '순위', range(1, len(top_10_df) + 1))

        # 2. 우리가 원하는 '순위'와 '기부자' 컬럼만 선택합니다.
        final_list_df = top_10_df[['순위', '기부자']]

        # 3. 프론트엔드 표에 보일 컬럼 이름을 '기부자명'으로 변경합니다. (선택 사항)
        final_list_df = final_list_df.rename(columns={'기부자': '기부자명'})

        # 4. 최종적으로 가공된 데이터를 JSON으로 변환합니다.
        list_data = final_list_df.to_dict(orient='records')

        print("--- 5. 그래프 및 리스트 데이터 생성 완료 ---")
        
        # 최종 결과 반환
        return JSONResponse(content={
            "graphImage": graph_image_base64,
            "listData": list_data
        })

    except Exception as e:
        print(f"--- 6. 에러 발생 --- \n{e}")
        # ▼▼▼ try 안에서 에러가 나면 이 부분이 실행됩니다 ▼▼▼
        import traceback
        traceback.print_exc()
        return JSONResponse(status_code=500, content={"error": f"데이터 처리 및 그래프 생성 중 오류 발생: {e}"})
