import NavBar from '../shared/components/navbar';
import { Link } from 'react-router-dom';
import hero from '../assets/hero.png';
import footer from '../assets/footer.png';
import chatBtn from '../assets/chat-btn.png';
import juegosBtn from '../assets/juegos-btn.png';
import acercaBtn from '../assets/acerca-btn.png';
import './styles/home.css';

export default function Home() {
  return (
    <div className="home">
      <NavBar />

      <div className="hero-container">
        <img src={hero} alt="Hero" className="hero-image" draggable={false} />

        {/* TEXTO ENCIMA DEL HERO */}
        <div className="hero-overlay-text">
          <h1>La Inteligencia Artificial Educativa</h1>
          <h2>Diviértete con NUBI, tu robot amigo para aprender.</h2>
        </div>
      </div>

      <div className="info-container">
        <h1>¿Qué es Nubi?</h1>
        <h2>Es una plataforma educativa creada para acompañar a los niños al aprender.</h2>
      </div>
      
      <div className="footer-container">
        <img src={footer} alt="Footer" className="footer-image" draggable={false} />

        {/* BOTONES SOBRE EL FOOTER */}
        <div className="footer-buttons">
          <Link to="/chat" aria-label="Chat IA">
            <img src={chatBtn} className="home-button" alt="Chat IA" />
          </Link>
          <Link to="/juegos" aria-label="Minijuegos">
            <img src={juegosBtn} className="home-button" alt="Minijuegos" />
          </Link>
          <Link to="/acerca" aria-label="Acerca de Nubi">
            <img src={acercaBtn} className="home-button" alt="Acerca de Nubi" />
          </Link>
        </div>

        <p className="footer-text">© 2025 NUBI - Todos los derechos reservados</p>
      </div>
    </div>
  );
}
