import { useNavigate } from "react-router-dom";

const mock = [
  { name: "Legend", score: 99900 },
  { name: "AAA", score: 3500 },
  { name: "BBB", score: 1200 }
];

export default function Ranking() {
  const nav = useNavigate();

  const containerStyle: React.CSSProperties = {
    width: "100vw", height: "100vh", backgroundColor: "#111", color: "white",
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: "#ffd700", fontSize: "2rem" }}>RANKING</h2>

      <div style={{ width: "300px", margin: "30px 0", borderTop: "1px solid #333" }}>
        {mock.map((r, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "15px 10px", borderBottom: "1px solid #333" }}>
            <span>{i + 1}. {r.name}</span>
            <span style={{ color: "#ffd700" }}>{r.score}</span>
          </div>
        ))}
      </div>

      <button style={{ width: "200px", padding: "15px", backgroundColor: "#ffd700", border: "none", borderRadius: "8px", fontWeight: "bold", marginBottom: "10px" }} onClick={() => nav("/game")}>
        재도전하기
      </button>
      <button style={{ color: "#888", background: "none", border: "none" }} onClick={() => nav("/")}>
        메인으로 돌아가기
      </button>
    </div>
  );
}