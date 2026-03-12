import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Chatbot from "./pages/chatbot/chatbot";
import MiniGames from "./pages/minigames/minigames";
import WordSearch from "./pages/minigames/word-search/word-search";
import About from "./pages/about/about";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/minijuegos" element={<MiniGames />} />
        <Route path="/minijuegos/sopa-de-letras" element={<WordSearch />} />
        <Route path="/acerca" element={<About />} />
      </Routes>
    </div>
  );
}