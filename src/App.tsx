import { Routes, Route } from "react-router-dom";
import Home from "./home/home";

function About() { return <h1>About</h1>; }

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </div>
  );
}