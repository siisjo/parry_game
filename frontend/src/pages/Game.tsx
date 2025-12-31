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

  const startGame = () => {
    setScore(0);
    setState("PLAYING");
    setShowRankModal(false);
  };

  const gameOver = () => {
    setState("GAME_OVER");
    setShowRankModal(true); // 종료 시 모달 띄우기
  };

  const handleRankSubmit = async () => {
    if (!nickname || !password) {
      alert("닉네임과 비밀번호를 모두 입력해주세요.");
      return;
    }

    // TODO: 백엔드 API 호출 (나중에 연결할 부분)
    console.log("등록 시도:", { nickname, password, score });
    
    // 성공 가정 시
    alert("랭킹 등록이 완료되었습니다!");
    setShowRankModal(false);
    nav("/ranking");
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
            <h3 style={{ color: "#ffd700", marginBottom: "20px" }}>랭킹 등록</h3>
            <p style={{ fontSize: "0.9rem", color: "#ccc" }}>기존 유저는 동일한 비밀번호 입력 시 점수가 갱신됩니다.</p>
            
            <input 
              type="text" placeholder="닉네임" value={nickname} 
              onChange={(e) => setNickname(e.target.value)} style={inputStyle} 
            />
            <input 
              type="password" placeholder="비밀번호" value={password} 
              onChange={(e) => setPassword(e.target.value)} style={inputStyle} 
            />

            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              <button style={modalBtnStyle} onClick={handleRankSubmit}>등록 확인</button>
              <button style={{ ...modalBtnStyle, backgroundColor: "#555" }} onClick={() => setShowRankModal(false)}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// 스타일들 (편의상 하단에 배치)
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
  border: "1px solid #444", display: "flex", flexDirection: "column", alignItems: "center", width: "300px"
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "12px", margin: "8px 0", backgroundColor: "#333", 
  border: "1px solid #555", borderRadius: "5px", color: "white"
};

const modalBtnStyle: React.CSSProperties = {
  flex: 1, padding: "12px", backgroundColor: "#ffd700", border: "none", 
  borderRadius: "5px", fontWeight: "bold", cursor: "pointer"
};