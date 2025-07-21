import mariadb
import pandas as pd
import datetime


print("DB 연결 시작")

# 데이터베이스 연결 정보
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",  # 실제 사용자명으로 변경 필요
    "password": "1234",
    "database": "real_db",
    "local_infile": True
}

def get_connection():
    """데이터베이스 연결 객체를 반환하는 공통 함수"""
    try:
        # DB_CONFIG 정보를 사용하여 DB에 연결하고 그 연결 객체를 반환합니다.
        conn = mariadb.connect(**DB_CONFIG)
        return conn
    except mariadb.Error as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return None

def test_connection():
    """데이터베이스 연결 테스트"""
    try:
        conn = mariadb.connect(**DB_CONFIG)
        print("✅ 데이터베이스 연결 성공!")
        conn.close()
        return True
    except mariadb.Error as e:
        print(f"❌ 데이터베이스 연결 실패: {e}")
        return False

def load_csv_with_infile(csv_file, table, create_table_sql=None):
    """CSV 파일을 데이터베이스에 로드"""
    conn = None
    cur = None
    
    try:
        # 데이터베이스 연결
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # CSV 파일 읽기
        df = pd.read_csv(csv_file, encoding='cp949', delimiter='\t')
        print("DataFrame 정보:")
        print(df.head())
        print(f"컬럼: {list(df.columns)}")
        print(f"행 수: {len(df)}")
        
        # 테이블 생성 (필요한 경우)
        if create_table_sql:
            try:
                cur.execute(f"DROP TABLE IF EXISTS {table}")
                cur.execute(create_table_sql)
                print(f"✅ 테이블 {table} 생성 완료")
            except mariadb.Error as e:
                print(f"⚠️ 테이블 생성 중 오류: {e}")
        
        # 동적으로 INSERT 문 생성
        column_names = ', '.join([f'`{col}`' for col in df.columns])  # 백틱으로 컬럼명 감싸기
        placeholders = ', '.join(['?' for _ in df.columns])
        insert_sql = f"INSERT INTO {table} ({column_names}) VALUES ({placeholders})"
        
        print(f"실행할 SQL: {insert_sql}")
        
        # 데이터 삽입
        success_count = 0
        for index, row in df.iterrows():
            try:
                # NaN 값을 None으로 변환
                row_data = [None if pd.isna(x) else x for x in row]
                cur.execute(insert_sql, tuple(row_data))
                success_count += 1
            except mariadb.Error as e:
                print(f"❌ {index+1}번째 행 삽입 실패: {e}")
                print(f"데이터: {tuple(row)}")
        
        conn.commit()
        print(f"✅ 데이터 삽입 완료! (성공: {success_count}/{len(df)})")
        
    except mariadb.Error as e:
        print(f"❌ 데이터베이스 오류: {e}")
    except FileNotFoundError:
        print(f"❌ CSV 파일을 찾을 수 없습니다: {csv_file}")
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}")
        import traceback
        traceback.print_exc()
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()
            
def get_all_brands():
    """tbl_product에서 중복을 제외한 모든 브랜드 이름을 가져옵니다."""
    # 1. 위에서 만든 공통 함수로 DB 연결을 시도합니다.
    conn = get_connection()
    # 2. 만약 연결에 실패하면 빈 리스트를 반환하고 함수를 종료합니다.
    if not conn:
        return []
    
    try:
        query = "SELECT DISTINCT brand_name FROM tbl_product"
        df = pd.read_sql(query, conn)
        return df['brand_name'].tolist()
    except Exception as e:
        print(f"브랜드 목록 조회 중 오류 발생: {e}")
        return []
    finally:
        # 3. 작업이 끝나면 연결을 반드시 닫아줍니다.
        if conn:
            conn.close()

def show_data(table):
    """데이터베이스에서 데이터 조회 후 DataFrame으로 반환"""
    conn = None
    cur = None
    
    try:
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()

        # 데이터 조회
        cur.execute(f"SELECT * FROM {table}")
        columns = [desc[0] for desc in cur.description]
        rows = cur.fetchall()
        
        print(f"조회된 행 수: {len(rows)}")
        print(f"컬럼: {columns}")
        
        if not rows:
            print("조회된 데이터가 없습니다.")
            return pd.DataFrame()
        
        # 데이터 처리
        processed_data = []
        
        for i, row in enumerate(rows):
            processed_row = []
            
            for j, value in enumerate(row):
                # datetime 객체 처리
                if isinstance(value, (datetime.date, datetime.datetime)):
                    processed_row.append(value.strftime("%Y-%m-%d"))
                # None 값 처리
                elif value is None:
                    processed_row.append(None)
                else:
                    processed_row.append(value)
            
            processed_data.append(processed_row)
        
        # DataFrame 생성
        df = pd.DataFrame(processed_data, columns=columns)
        print(f"✅ {table} 테이블 데이터 조회 완료 (행 수: {len(df)})")
        print(df)
        
        return df

    except mariadb.Error as e:
        print(f"❌ 데이터 조회 실패: {e}")
        return None
    except Exception as e:
        print(f"❌ 예상치 못한 오류: {e}")
        import traceback
        traceback.print_exc()
        return None
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def create_sample_table():
    """샘플 테이블 생성"""
    create_sql = """
    CREATE TABLE IF NOT EXISTS stock (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(10) NOT NULL,
        name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2),
        volume INT,
        market_cap BIGINT,
        sector VARCHAR(50),
        industry VARCHAR(100),
        listing_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """
    return create_sql

def show_tables():
    """모든 테이블 목록 조회"""
    conn = None
    cur = None
    
    try:
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        cur.execute("SHOW TABLES")
        tables = cur.fetchall()
        
        print("=== 데이터베이스 테이블 목록 ===")
        for table in tables:
            print(f"- {table[0]}")
            
    except mariadb.Error as e:
        print(f"❌ 테이블 조회 실패: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def describe_table(table_name):
    """테이블 구조 조회"""
    conn = None
    cur = None
    
    try:
        conn = mariadb.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        cur.execute(f"DESCRIBE {table_name}")
        structure = cur.fetchall()
        
        print(f"=== {table_name} 테이블 구조 ===")
        for field in structure:
            print(f"컬럼: {field[0]}, 타입: {field[1]}, NULL: {field[2]}, 키: {field[3]}, 기본값: {field[4]}")
            
    except mariadb.Error as e:
        print(f"❌ 테이블 구조 조회 실패: {e}")
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close()

def search_db():
    """지정된 데이터베이스의 테이블 목록을 반환"""
    try:
        conn = mariadb.connect(**DB_CONFIG)
        cursor = conn.cursor()

        cursor.execute("SHOW TABLES;")
        tables = [table[0] for table in cursor.fetchall()]

        print(f"✅ 데이터베이스 '{DB_CONFIG['database']}'의 테이블 목록:")
        for table in tables:
            print(" -", table)

        cursor.close()
        conn.close()

        return tables
    except mariadb.Error as e:
        print(f"❌ 오류 발생: {e}")
        return []
        
def get_donation_summary():
    """사용자별 기부 요약 정보를 MariaDB에서 조회합니다."""
    conn = None
    try:
        # MariaDB에 연결
        conn = mariadb.connect(**DB_CONFIG) # **DB_CONFIG로 한번에 전달
        
        query = """
        SELECT 
            donor_username AS '기부자',
            COUNT(donation_id) AS '총기부횟수',
            SUM(price) AS '총기부금액'
        FROM 
            donations
        GROUP BY 
            donor_username
        ORDER BY 
            총기부금액 DESC;
        """
        df = pd.read_sql(query, conn)
        return df
    except mariadb.Error as e:
        print(f"❌ 데이터 조회 실패: {e}")
        return pd.DataFrame() # 에러 발생 시 빈 데이터프레임 반환
    finally:
        if conn:
            conn.close()

# 메인 실행 부분
if __name__ == '__main__':
    print("=== MariaDB 연결 및 데이터 처리 시작 ===")

    show_data('finance')
    
    # 1. 연결 테스트
    if test_connection():
        print("\n1. 연결 테스트 통과!")
        
        # 2. 테이블 목록 조회
        print("\n2. 기존 테이블 목록:")
        show_tables()
        
    #     # 3. 샘플 테이블 생성 (필요시)
    #     # print("\n3. 샘플 테이블 생성:")
    #     # create_sql = create_sample_table()
    #     # load_csv_with_infile('dummy.csv', 'stock', create_sql)  # 더미 파일명
        
        # 4. CSV 파일 로드 (실제 사용 및 업데이트 될 때 마다 업로드 해줘야함)
        # csv_file = 'C:\Users\EZEN\Desktop\pythonGifree\fastapi\lifestyle_data.csv'
        # table_name = 'stock'
        # create_sql = create_sample_table()
        # load_csv_with_infile(csv_file, table_name, create_sql)
        
        # 5. 데이터 조회 (실제 사용시)
        print("\n5. 데이터 조회:")
        df = show_data('tbl_product')
        if df is not None and not df.empty:
             print("조회 결과:")
             print(df.head())
             print(f"\n총 {len(df)}개 행이 조회되었습니다.")

             
        
    else:
        print("❌ 데이터베이스 연결에 실패했습니다.")
        print("다음 사항들을 확인해주세요:")
        print("1. MariaDB가 실행 중인지 확인")
        print("2. 사용자명과 비밀번호가 올바른지 확인") 
        print("3. 데이터베이스 'webdb'가 존재하는지 확인")
        

