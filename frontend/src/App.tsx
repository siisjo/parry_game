import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Ranking from "./pages/Ranking";
import Game from "./pages/Game";
import Guide from "./pages/Guide"; // 추가

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/game" element={<Game />} />
        <Route path="/guide" element={<Guide />} /> {/* 추가 */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;