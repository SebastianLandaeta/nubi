// Componentes
import Navbar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";
import { Link } from "react-router-dom";
import { useState } from "react";

// Imágenes
import cloudsBottom from "./assets/clouds-bottom.png";
import cloudsTop from "./assets/clouds-top.png";
import wsLogo from "./assets/word-search-logo.png";
import sbcLogo from "./assets/sort-by-color-logo.png";
import nmLogo from "./assets/number-match-logo.png";

// Estilos
import "./minigames.css";

export default function MiniGames() {
  const [index, setIndex] = useState(0);

  const totalGames = 3;

  const next = () => {
    setIndex((prev) => (prev < totalGames - 1 ? prev + 1 : prev));
  };

  const prev = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  return (
    <div className="minijuegos">
      <Navbar />

      <img
        src={cloudsTop}
        alt="Nubes arriba"
        draggable={false}
        className="clouds-top"
      />

      <h1>Minijuegos</h1>

      <div className="minigames-container">
        <button className="arrow left" onClick={prev}>
          ‹
        </button>

        <div
          className="minigames-track"
          style={{ transform: `translateX(-${index * 100}%)` }}
        >
          <Link to="/minijuegos/sopa-de-letras">
            <button className="minigame-button">
              <img src={wsLogo} alt="Sopa de Letras" />
            </button>
          </Link>

          <Link to="/minijuegos/ordenar-por-color">
            <button className="minigame-button">
              <img src={sbcLogo} alt="Ordenar por Color" />
            </button>
          </Link>

          <Link to="/minijuegos/asociar-numeros">
            <button className="minigame-button">
              <img src={nmLogo} alt="Asociar Números" />
            </button>
          </Link>
        </div>

        <button className="arrow right" onClick={next}>
          ›
        </button>
      </div>

      <img
        src={cloudsBottom}
        alt="Nubes abajo"
        draggable={false}
        className="clouds-bottom"
      />

      <Footer />
    </div>
  );
}
