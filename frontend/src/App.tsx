import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Ranking from "./pages/Ranking";
import Game from "./pages/Game";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
