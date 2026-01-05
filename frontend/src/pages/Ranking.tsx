import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// 데이터 타입 정의
interface RankEntry {
  nickname: string;
  best_score: number;
}

export default function Ranking() {
  const nav = useNavigate();
  const [rankList, setRankList] = useState<RankEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 💡 백엔드에서 랭킹 데이터 가져오기
    const fetchRankings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/ranking`);
        if (response.ok) {
          const data = await response.json();
          setRankList(data);
        }
      } catch (error) {
        console.error("Failed to fetch rankings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  const containerStyle: React.CSSProperties = {
    width: "100vw", height: "100vh", backgroundColor: "#111", color: "white",
    display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center"
  };

  return (
    <div style={containerStyle}>
      <h2 style={{ color: "#ffd700", fontSize: "2rem" }}>RANKING TOP 10</h2>

      <div style={{ width: "300px", margin: "30px 0", borderTop: "1px solid #333" }}>
        {loading ? (
          <p style={{ textAlign: "center", padding: "20px" }}>Loading...</p>
        ) : rankList.length > 0 ? (
          rankList.map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "15px 10px", borderBottom: "1px solid #333" }}>
              <span>{i + 1}. {r.nickname}</span>
              <span style={{ color: "#ffd700" }}>{r.best_score.toLocaleString()}</span>
            </div>
          ))
        ) : (
          <p style={{ textAlign: "center", padding: "20px", color: "#666" }}>등록된 랭킹이 없습니다.</p>
        )}
      </div>

      <button style={{ width: "200px", padding: "15px", backgroundColor: "#ffd700", border: "none", borderRadius: "8px", fontWeight: "bold", marginBottom: "10px", cursor: "pointer" }} onClick={() => nav("/game")}>
        재도전하기
      </button>
      <button style={{ color: "#888", background: "none", border: "none", cursor: "pointer" }} onClick={() => nav("/")}>
        메인으로 돌아가기
      </button>
    </div>
  );
}