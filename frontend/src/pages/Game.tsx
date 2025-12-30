// pages/Game.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayingScreen from "../components/PlayingScreen";

type GameState = "READY" | "PLAYING" | "GAME_OVER";

export default function Game() {
  const nav = useNavigate();
  const [state, setState] = useState<GameState>("READY");
  const [score, setScore] = useState(0);

  // 게임 시작
  const startGame = () => {
    setScore(0);
    setState("PLAYING");
  };

  // 게임 종료
  const gameOver = () => {
    setState("GAME_OVER");
  };

  // === 화면 분기 ===
  if (state === "READY") {
    return (
      <div style={{ padding: 40 }}>
        <h2>무한모드</h2>
        <button onClick={startGame}>시작</button>
        <br /><br />
        <button onClick={() => nav("/")}>홈으로</button>
      </div>
    );
  }

  if (state === "GAME_OVER") {
    return (
      <div style={{ padding: 40 }}>
        <h2>게임 종료</h2>
        <p>점수: {score}</p>

        <button onClick={() => nav("/ranking")}>
          랭킹 등록
        </button>
        <br /><br />
        <button onClick={startGame}>
          재도전
        </button>
      </div>
    );
  }

  // PLAYING
  return (
    <PlayingScreen
      score={score}
      setScore={setScore}
      onGameOver={gameOver}
    />
  );
}
