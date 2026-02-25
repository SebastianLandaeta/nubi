import { Routes, Route } from "react-router-dom";
import Home from "./pages/home/home";
import Chatbot from "./pages/chatbot/chatbot";

function About() { return <h1>About</h1>; }

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chatbot />} />
        <Route path="/acerca" element={<About />} />
      </Routes>
    </div>
  );
}