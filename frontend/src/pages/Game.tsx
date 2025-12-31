// src/pages/Game.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayingScreen from "../components/PlayingScreen";

type GameState = "PLAYING" | "GAME_OVER";

export default function Game() {
  const nav = useNavigate();
  const [state, setState] = useState<GameState>("PLAYING");
  const [score, setScore] = useState(0);

  // 랭킹 등록 관련 상태
  const [showRankModal, setShowRankModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState(""); // 💡 에러 메시지 상태 추가

  const startGame = () => {
    setScore(0);
    setState("PLAYING");
    setShowRankModal(false);
    setErrorMsg(""); // 초기화
    setNickname("");
    setPassword("");
  };

  const gameOver = () => {
    setState("GAME_OVER");
    setShowRankModal(true); // 종료 시 모달 띄우기
  };

  const handleRankSubmit = async () => {
    setErrorMsg(""); // 시도할 때마다 이전 에러 초기화

    if (!nickname || !password) {
      setErrorMsg("닉네임과 비밀번호를 모두 입력해주세요.");
      return;
    }

    // 💡 세션 ID 가져오기 (schemas.py의 필수값 대응)
    const currentSessionId = `session_${localStorage.getItem('current_game_index') || '1'}`;

    try {
      const response = await fetch("http://localhost:8000/api/ranking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: currentSessionId,
          nickname: nickname,
          password: password,
          score: score,
        }),
      });

      if (response.ok) {
        alert("랭킹 등록이 완료되었습니다!");
        setShowRankModal(false);
        nav("/ranking");
      } else {
        const errData = await response.json();
        // 💡 백엔드의 HTTPException(detail="...") 메시지를 화면에 표시
        // 예: "이미 존재하는 닉네임입니다. 비밀번호를 확인해주세요."
        setErrorMsg(errData.detail || "등록 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Ranking submit error:", error);
      setErrorMsg("서버와 통신 중 오류가 발생했습니다.");
    }
  };

  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", backgroundColor: "#111" }}>
      {state === "PLAYING" ? (
        <PlayingScreen score={score} setScore={setScore} onGameOver={gameOver} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100%", color: "white" }}>
          <h2 style={{ fontSize: "3rem", color: "#ff4d4d" }}>GAME OVER</h2>
          <p style={{ fontSize: "1.5rem" }}>최종 점수: {score}</p>
          <button style={btnStyle} onClick={startGame}>다시 시작</button>
          <button style={{ ...btnStyle, backgroundColor: "#333" }} onClick={() => nav("/")}>홈으로</button>
        </div>
      )}

      {/* 랭킹 등록 모달 */}
      {showRankModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ color: "#ffd700", marginBottom: "15px" }}>랭킹 등록</h3>
            
            {/* 💡 에러 메시지 표시 영역 */}
            {errorMsg && (
              <div style={{ 
                width: "100%", 
                backgroundColor: "rgba(255, 77, 77, 0.1)", 
                border: "1px solid #ff4d4d", 
                borderRadius: "5px", 
                padding: "10px", 
                marginBottom: "15px",
                color: "#ff4d4d",
                fontSize: "0.85rem",
                textAlign: "center"
              }}>
                ⚠️ {errorMsg}
              </div>
            )}
            
            <p style={{ fontSize: "0.8rem", color: "#888", marginBottom: "10px", textAlign: "center" }}>
              기존 유저는 동일한 비밀번호 입력 시 점수가 갱신됩니다.
            </p>
            
            <input 
              type="text" placeholder="닉네임" value={nickname} 
              onChange={(e) => setNickname(e.target.value)} style={inputStyle} 
            />
            <input 
              type="password" placeholder="비밀번호" value={password} 
              onChange={(e) => setPassword(e.target.value)} style={inputStyle} 
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "15px", width: "100%" }}>
              <button style={modalBtnStyle} onClick={handleRankSubmit}>등록 확인</button>
              <button style={{ ...modalBtnStyle, backgroundColor: "#555" }} onClick={() => {
                setShowRankModal(false);
                setErrorMsg("");
              }}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 스타일들
const btnStyle: React.CSSProperties = {
  width: "200px", padding: "15px", margin: "10px", backgroundColor: "#ffd700", 
  border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer"
};

const modalOverlayStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, width: "100%", height: "100%", 
  backgroundColor: "rgba(0,0,0,0.85)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 100
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: "#222", padding: "30px", borderRadius: "15px", 
  border: "1px solid #444", display: "flex", flexDirection: "column", alignItems: "center", width: "320px"
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px", margin: "8px 0", backgroundColor: "#333", 
  border: "1px solid #555", borderRadius: "5px", color: "white", outline: "none"
};

const modalBtnStyle: React.CSSProperties = {
  flex: 1, padding: "12px", backgroundColor: "#ffd700", border: "none", 
  borderRadius: "5px", fontWeight: "bold", cursor: "pointer"
};