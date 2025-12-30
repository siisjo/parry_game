import axios from "axios";

function App() {
  const pingBackend = async () => {
    try {
      const res = await axios.get("http://localhost:8000/");
      console.log("BACKEND RESPONSE:", res.data);
      alert(JSON.stringify(res.data));
    } catch (err) {
      console.error(err);
      alert("백엔드 연결 실패");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Parry Game</h1>

      <button
        onClick={pingBackend}
        style={{
          padding: "12px 20px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        백엔드 ping 보내기
      </button>
    </div>
  );
}

export default App;
