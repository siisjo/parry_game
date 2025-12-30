// pages/Ranking.tsx
import { useNavigate } from "react-router-dom";

const mock = [
  { name: "noname", score: 4210 },
  { name: "AAA", score: 3000 },
  { name: "BBB", score: 1500 }
];

export default function Ranking() {
  const nav = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <h2>Ranking</h2>

      <ul>
        {mock.map((r, i) => (
          <li key={i}>
            {i + 1}. {r.name} - {r.score}
          </li>
        ))}
      </ul>

      <br />
      <button onClick={() => nav("/")}>홈으로</button>
      <br /><br />
      <button onClick={() => nav("/game")}>재도전</button>
    </div>
  );
}
