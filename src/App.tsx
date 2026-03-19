import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Chatbot from "./pages/chatbot/chatbot";
import MiniGames from "./pages/minigames/minigames";
import WordSearch from "./pages/minigames/word-search/word-search";
import SortByColor from "./pages/minigames/sort-by-color/sort-by-color";
import About from "./pages/about/about";

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/minijuegos" element={<MiniGames />} />
        <Route path="/minijuegos/sopa-de-letras" element={<WordSearch />} />
        <Route path="/minijuegos/ordenar-por-color" element={<SortByColor />} />
        <Route path="/acerca" element={<About />} />
      </Routes>
    </div>
  );
}