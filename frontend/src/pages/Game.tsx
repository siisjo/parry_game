import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayingScreen from "../components/PlayingScreen";

type GameState = "PLAYING" | "GAME_OVER";

export default function Game() {
  const nav = useNavigate();
  // 바로 시작하기 위해 초기값을 PLAYING으로 설정
  const [state, setState] = useState<GameState>("PLAYING");
  const [score, setScore] = useState(0);

  const startGame = () => {
    setScore(0);
    setState("PLAYING");
  };

  const gameOver = () => {
    setState("GAME_OVER");
  };

  if (state === "GAME_OVER") {
    return (
      <div style={{ 
        width: "100vw", height: "100vh", backgroundColor: "#111", color: "white",
        display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" 
      }}>
        <h2 style={{ fontSize: "2.5rem", color: "#ff4d4d" }}>GAME OVER</h2>
        <p style={{ fontSize: "1.5rem", margin: "20px 0" }}>Final Score: {score}</p>

        <button style={{ width: "200px", padding: "15px", margin: "10px", backgroundColor: "#ffd700", border: "none", borderRadius: "8px", fontWeight: "bold" }} onClick={startGame}>
          재도전
        </button>
        <button style={{ width: "200px", padding: "15px", margin: "10px", backgroundColor: "#333", color: "white", border: "1px solid #555", borderRadius: "8px" }} onClick={() => nav("/ranking")}>
          랭킹 등록
        </button>
        <button style={{ marginTop: "20px", color: "#888", background: "none", border: "none" }} onClick={() => nav("/")}>
          홈으로
        </button>
      </div>
    );
  }

  return (
    <PlayingScreen
      score={score}
      setScore={setScore}
      onGameOver={gameOver}
    />
  );
}