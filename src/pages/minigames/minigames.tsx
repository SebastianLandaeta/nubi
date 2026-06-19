// Componentes
import Navbar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

// Imágenes
import cloudsBottom from "./assets/clouds-bottom.png";
import cloudsTop from "./assets/clouds-top.png";
import wsLogo from "./assets/word-search-logo.png";
import sbcLogo from "./assets/sort-by-color-logo.png";
import csLogo from "./assets/count-shapes-logo.png";

// Estilos
import "./minigames.css";

export default function MiniGames() {
  const [index, setIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const totalGames = 3;

  const next = () => {
    setIndex((prev) => (prev < totalGames - 1 ? prev + 1 : prev));
  };

  const prev = () => {
    setIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  useEffect(() => {
    const media = window.matchMedia("(max-width: 768px)");

    const updateState = (event: MediaQueryListEvent | MediaQueryList) => {
      const mobile = event.matches;
      setIsMobile(mobile);
      if (!mobile) {
        setIndex(0);
      }
    };

    updateState(media);
    media.addEventListener("change", updateState);

    return () => {
      media.removeEventListener("change", updateState);
    };
  }, []);

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
          style={isMobile ? { transform: `translateX(-${index * 100}%)` } : undefined}
        >
          <div className="minigame-slide">
            <Link to="/minijuegos/sopa-de-letras" className="minigame-button">
              <img src={wsLogo} alt="Sopa de Letras" draggable={false} />
            </Link>
          </div>

          <div className="minigame-slide">
            <Link to="/minijuegos/ordenar-por-color" className="minigame-button">
              <img src={sbcLogo} alt="Ordenar por Color" draggable={false} />
            </Link>
          </div>

          <div className="minigame-slide">
            <Link to="/minijuegos/contar-figuras" className="minigame-button">
              <img src={csLogo} alt="Asociar Números" draggable={false} />
            </Link>
          </div>
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
