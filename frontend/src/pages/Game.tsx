// src/pages/Game.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayingScreen from "../components/PlayingScreen";

declare global {
  interface Window {
    gtag: (command: string, action: string, params?: object) => void;
  }
}

type GameState = "PLAYING" | "GAME_OVER";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Game() {
  const nav = useNavigate();
  const [state, setState] = useState<GameState>("PLAYING");
  const [score, setScore] = useState(0);

  // 랭킹 등록 관련 상태
  const [showRankModal, setShowRankModal] = useState(false);
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const startGame = () => {
    setScore(0);
    setState("PLAYING");
    setShowRankModal(false);
    setErrorMsg("");
    setNickname("");
    setPassword("");
  };

  const gameOver = () => {
    setState("GAME_OVER");
    setShowRankModal(true); 
  };

  // ✨ 공유하기 로직 (Referral 지표 수집용 UTM 포함)
  const handleShare = async () => {
    const shareData = {
      title: 'Parry Game',
      text: `[Parry Game] 내 점수는 ${score}점! 이 속도를 버틸 수 있겠어? 🔥`,
      url: `https://parrygame.xyz/?utm_source=share&utm_medium=game_over&utm_campaign=score_${score}`,
    };

    // ✨ GA4 이벤트 전송
    if (window.gtag) {
      window.gtag('event', 'share_click', {
        'score': score,
        // navigator.share가 함수로 존재하는지 확실히 체크
        'method': typeof navigator.share === 'function' ? 'system_share' : 'copy_link'
      });
    }

    try {
      // ✨ 수정된 조건문: typeof를 사용하여 실행 가능한 함수인지 확인
      if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
      } else {
        // PC 등 지원하지 않는 환경: 클립보드 복사
        await navigator.clipboard.writeText(`${shareData.text}\n플레이하기: ${shareData.url}`);
        alert("점수와 게임 링크가 클립보드에 복사되었습니다! 📢");
      }
    } catch (error) {
      // 유저가 공유 취소를 누른 경우 등 예외 처리
      console.error("공유 실패 또는 취소됨:", error);
    }
  };

  const handleRankSubmit = async () => {
    setErrorMsg("");

    if (!nickname || !password) {
      setErrorMsg("닉네임과 비밀번호를 모두 입력해주세요.");
      return;
    }

    const currentSessionId = `session_${localStorage.getItem('current_game_index') || '1'}`;

    try {
      const response = await fetch(`${API_BASE_URL}/api/ranking`, {
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
          <h2 style={{ fontSize: "3.5rem", color: "#ff4d4d", marginBottom: "5px", textShadow: "0 0 20px rgba(255, 77, 77, 0.5)" }}>GAME OVER</h2>
          <p style={{ fontSize: "1.8rem", marginBottom: "30px", fontWeight: "bold" }}>최종 점수: {score}</p>
          
          {/* 주요 버튼 영역 */}
          <button style={btnStyle} onClick={startGame}>다시 시작</button>
          
          <button 
            style={{ ...btnStyle, backgroundColor: "transparent", border: "2px solid #ffd700", color: "#ffd700" }} 
            onClick={handleShare}
          >
            📢 친구에게 공유하기
          </button>

          <button style={{ ...btnStyle, backgroundColor: "#333", color: "white" }} onClick={() => nav("/")}>홈으로</button>
        </div>
      )}

      {/* 랭킹 등록 모달 */}
      {showRankModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ color: "#ffd700", marginBottom: "15px", fontSize: "1.5rem" }}>랭킹 등록</h3>
            
            {errorMsg && (
              <div style={{ 
                width: "100%", backgroundColor: "rgba(255, 77, 77, 0.1)", border: "1px solid #ff4d4d", 
                borderRadius: "5px", padding: "10px", marginBottom: "15px", color: "#ff4d4d", fontSize: "0.85rem", textAlign: "center"
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
  width: "220px", padding: "15px", margin: "8px", backgroundColor: "#ffd700", 
  border: "none", borderRadius: "10px", fontWeight: "bold", fontSize: "1.1rem", cursor: "pointer",
  transition: "transform 0.1s"
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