import { useNavigate } from "react-router-dom";

export default function Home() {
  const nav = useNavigate();

  const containerStyle: React.CSSProperties = {
    width: "100vw", height: "100vh", backgroundColor: "#111", color: "white",
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
  };

  const btnStyle: React.CSSProperties = {
    width: "200px", padding: "15px", marginBottom: "15px", fontSize: "1.1rem",
    backgroundColor: "#333", color: "white", border: "1px solid #555",
    borderRadius: "8px", cursor: "pointer", fontWeight: "bold"
  };

  return (
    <div style={containerStyle}>
      <h1 style={{ fontSize: "3rem", marginBottom: "40px", color: "#ffd700" }}>Parry Game</h1>

      <button style={{ ...btnStyle, backgroundColor: "#ffd700", color: "#000" }} onClick={() => nav("/game")}>
        게임 시작
      </button>
      <button style={btnStyle} onClick={() => nav("/guide")}>
        게임 방법
      </button>
      <button style={btnStyle} onClick={() => nav("/ranking")}>
        랭킹
      </button>
    </div>
  );
}