// pages/Home.tsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h1>Parry Game</h1>

      <button onClick={() => nav("/game")}>게임 시작</button><br /><br />
      <button onClick={() => nav("/ranking")}>랭킹</button><br /><br />
    </div>
  );
}
