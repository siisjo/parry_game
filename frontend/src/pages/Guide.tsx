import { useNavigate } from "react-router-dom";

export default function Guide() {
  const nav = useNavigate();

  // 1. 최상위 컨테이너: 화면 전체를 검은색으로 채우고 모든 내용을 정중앙으로 보냄
  const containerStyle: React.CSSProperties = {
    width: "100vw",
    minHeight: "100vh",
    backgroundColor: "#111",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center", // 세로 중앙 정렬
    alignItems: "center",     // 가로 중앙 정렬 (이게 왼쪽 쏠림 방지 핵심)
    padding: "20px",
    boxSizing: "border-box",
    margin: 0,
  };

  // 2. 가이드 레이아웃: 이미지와 버튼이 들어갈 적당한 폭의 박스
  const contentWrapperStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "500px",        // PC에서 너무 커지지 않게 제한
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  return (
    <div style={containerStyle}>
      <div style={contentWrapperStyle}>
        
        <h2 style={{ color: "#ffd700", marginBottom: "20px", textAlign: "center" }}>
          HOW TO PLAY
        </h2>

        {/* 3. 이미지: 박스 너비에 맞춰 자동 조절 (가로 스크롤 방지) */}
        <img 
          src="/guide.png" 
          alt="Guide" 
          style={{ 
            width: "100%", 
            height: "auto", 
            borderRadius: "12px",
            marginBottom: "30px",
            display: "block"
          }} 
        />

        <button 
          style={{ 
            width: "100%", 
            maxWidth: "250px", 
            padding: "15px", 
            backgroundColor: "#ffd700", 
            border: "none", 
            borderRadius: "8px", 
            fontWeight: "bold", 
            cursor: "pointer" 
          }}
          onClick={() => nav("/")}
        >
          뒤로가기
        </button>
        
      </div>
    </div>
  );
}