import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Home() {
  const nav = useNavigate();
  const [showEvent, setShowEvent] = useState(true); // 이벤트 표시 상태

  const containerStyle: React.CSSProperties = {
    width: "100vw", height: "100vh", backgroundColor: "#111", color: "white",
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center",
    position: "relative" // 배너 배치를 위해 추가
  };

  const btnStyle: React.CSSProperties = {
    width: "200px", padding: "15px", marginBottom: "15px", fontSize: "1.1rem",
    backgroundColor: "#333", color: "white", border: "1px solid #555",
    borderRadius: "8px", cursor: "pointer", fontWeight: "bold",
    transition: "transform 0.1s"
  };

  return (
    <div style={containerStyle}>
      <h1
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
          color: "#000" // 검정색 (요청대로)
        }}
      >
        패링게임 반응속도 테스트
      </h1>
      <h1 style={{ fontSize: "3rem", marginBottom: "40px", color: "#ffd700", textShadow: "0 0 10px rgba(255,215,0,0.3)" }}>Parry Game</h1>

      <button style={{ ...btnStyle, backgroundColor: "#ffd700", color: "#000" }} onClick={() => nav("/game")}>
        게임 시작
      </button>
      <button style={btnStyle} onClick={() => nav("/guide")}>
        게임 방법
      </button>
      <button style={btnStyle} onClick={() => nav("/ranking")}>
        랭킹
      </button>

      {/* 이벤트 안내 배너 */}
      {showEvent && (
        <div style={{
          position: "absolute",
          bottom: "30px",
          width: "90%",
          maxWidth: "400px",
          backgroundColor: "rgba(255, 215, 0, 0.1)",
          border: "1px solid #ffd700",
          borderRadius: "12px",
          padding: "15px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          animation: "fadeInUp 0.5s ease-out"
        }}>
          <div style={{ fontSize: "0.9rem", color: "#ffd700", lineHeight: "1.5" }}>
            {/* 메인 타이틀 */}
            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
              📢 EVENT: 랭킹 1위를 달성하시면 소정의 선물을 드려요
              <span style={{ fontSize: "0.8rem", fontWeight: "normal", marginLeft: "8px" }}>
                (~1/18 11:59 기준)
              </span>
            </div>

            {/* 상세 안내 및 링크 */}
            <div style={{ color: "rgba(255, 255, 255, 0.7)", fontSize: "0.75rem", fontWeight: "normal" }}>
              • 비정상적인 방법으로 점수 획득 시 순위에서 제외될 수 있습니다.<br />
              • 1위 인증: 카카오톡 1:1 오픈채팅{' '}
              <a 
                href="https://open.kakao.com/me/parrygame" // 👈 여기에 실제 오픈채팅 링크를 넣으세요!
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: "#fff", 
                  textDecoration: "underline", 
                  fontWeight: "bold",
                  cursor: "pointer"
                }}
              >
                '패링게임마스터'
              </a>
              로 문의주세요.
            </div>
          </div>
          <button 
            onClick={() => setShowEvent(false)}
            style={{ 
              backgroundColor: "transparent", 
              border: "none", 
              color: "#ffd700", 
              cursor: "pointer", 
              fontSize: "1rem",      // 1.2rem -> 1rem으로 축소
              padding: "0 4px",      // 클릭하기 편하게 좌우 여백 살짝 추가
              lineHeight: "1",       // 버튼 높이가 튀지 않게 조정
              opacity: "0.8",        // 살짝 투명하게 해서 텍스트보다 덜 튀게 함
              transition: "opacity 0.2s" 
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = "1"}
            onMouseLeave={(e) => e.currentTarget.style.opacity = "0.8"}
          >
            ×
          </button>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}