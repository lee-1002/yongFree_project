import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";

const ChatbotUI = () => {
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "bot",
      text: `안녕하세요! 기프리봇입니다. 
 안녕하세요! 기프리봇입니다. 
 - 저는 기프티콘 관련 궁금증을 해결해 드리는 AI 챗봇이에요. 
 - 예를 들어, 다음과 같은 질문을 할 수 있습니다!
 - 기프티콘 정보 확인: 스타벅스 기프티콘 가격 얼마야?, 어떤 상품들이 있어?
 - 서비스 이용 방법 안내: 기프티콘 판매 절차 알려줘, 유효기간 기준이 뭐야?
 궁금한 점이 있다면 언제든지 편하게 질문해주세요!`,
    },
  ]);

  const chatBodyRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [chatMessages]);

  const handleChatInputChange = (e) => setChatInput(e.target.value);

  // 메시지 및 이미지 전송 함수
  const handleSend = async () => {
    const textToSend = chatInput.trim();
    if (!textToSend) return;

    setChatMessages((prev) => [...prev, { sender: "user", text: textToSend }]);
    setChatInput("");

    try {
      const res = await fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.response },
      ]);
    } catch (err) {
      console.error("메시지 전송 에러:", err);
      setChatMessages((prev) => [
        ...prev,
        { sender: "bot", text: "오류가 발생했습니다." },
      ]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  return (
    <div className="w-full h-screen bg-white flex flex-col">
      <div className="bg-blue-600 text-white p-3 text-lg font-semibold rounded-t-lg text-center">
        기프리 챗봇
      </div>
      <div
        ref={chatBodyRef}
        className="flex-grow p-3 overflow-y-auto bg-gray-50 text-sm"
      >
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            className={`w-full flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            } mb-2`}
          >
            <div
              className={`max-w-[80%] p-2 rounded-lg ${
                msg.sender === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {msg.text && <span>{msg.text}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="flex p-3 border-t">
        <input
          type="text"
          placeholder="메시지를 입력하세요"
          value={chatInput}
          onChange={handleChatInputChange}
          onKeyPress={handleKeyPress}
          className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleSend}
          className="px-4 py-2 bg-blue-500 text-white rounded-r-lg hover:bg-blue-600"
        >
          전송
        </button>
      </div>
    </div>
  );
};

export default ChatbotUI;
