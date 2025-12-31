import { useNavigate } from "react-router-dom";

export default function Guide() {
  const nav = useNavigate();

  const containerStyle: React.CSSProperties = {
    width: "100vw", height: "100vh", backgroundColor: "#111", color: "white",
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px", textAlign: "center"
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: "#ffd700" }}>HOW TO PLAY</h2>
      <div style={{ margin: "30px 0", lineHeight: "1.8", fontSize: "1.1rem", color: "#ccc" }}>
        <p><b>패링:</b> 노란 전조 방향을(좌/우) 클릭/터치 하세요!</p>
        <p><b>페이크:</b> 초록 전조가 보이면 클릭하지 말고 기다리세요.</p>
        <p><b>연속 패링:</b> 2~3회 들어오는 공격을 맞춰 클릭하세요.</p>
        <p><b>스타 캐치:</b> 별이 노란 영역에 왔을 때 타이밍 맞춰 클릭!</p>
      </div>

      <button 
        style={{ width: "200px", padding: "15px", backgroundColor: "#ffd700", border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}
        onClick={() => nav("/game")}
      >
        이해했어! 시작하기
      </button>
      <button style={{ marginTop: "20px", color: "#888", background: "none", border: "none", cursor: "pointer" }} onClick={() => nav("/")}>
        뒤로가기
      </button>
    </div>
  );
}