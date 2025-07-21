import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [pw, setPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isEmailValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = (pw) =>
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+~`{}[\]:;"'<>,.?/\\|-]).{8,20}$/.test(
      pw
    );

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isEmailValid(email)) {
      setError("유효한 이메일 형식을 입력해주세요.");
      return;
    }

    if (!isPasswordValid(pw)) {
      setError("비밀번호는 영문, 숫자, 특수문자를 포함해 8~20자여야 합니다.");
      return;
    }

    if (pw !== confirmPw) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8080/api/member/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pw, nickname }),
      });

      if (!res.ok) {
        const msg = await res.text();
        setError(msg || "회원가입 실패");
        return;
      }

      alert("회원가입 성공! 로그인 페이지로 이동합니다.");
      navigate("/member/login");
    } catch (err) {
      setError("서버와의 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="join-container">
      <style>
        {`
        .join-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f4fdf4;
          font-family: sans-serif;
        }
        .join-form {
          background: #fff;
          padding: 40px;
          border-radius: 12px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          max-width: 500px;
          width: 100%;
        }
        .join-form h2 {
          color: #4caf50;
          margin-bottom: 20px;
          text-align: center;
        }
        .join-form input {
          width: 100%;
          padding: 12px;
          margin-bottom: 20px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 1em;
        }
        .join-form button {
          width: 100%;
          padding: 12px;
          background-color: #4caf50;
          color: #fff;
          border: none;
          font-size: 1.1em;
          border-radius: 6px;
          cursor: pointer;
        }
        .join-form button:hover {
          background-color: #388e3c;
        }
        .join-form .error {
          color: #e53935;
          font-weight: bold;
          text-align: center;
        }
        `}
      </style>
      <form className="join-form" onSubmit={handleSubmit}>
        <h2>회원가입</h2>

        <input
          type="text"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="닉네임"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="비밀번호 확인"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          required
        />

        {error && <p className="error">{error}</p>}

        <button type="submit">가입하기</button>
      </form>
    </div>
  );
};

export default JoinPage;
