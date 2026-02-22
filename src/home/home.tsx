import NavBar from '../shared/components/navbar';
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
        <img src={hero} alt="Hero" className="hero-image" />

        {/* TEXTO ENCIMA DEL HERO */}
        <div className="hero-overlay-text">
          <h1>La Inteligencia</h1>
          <h1>Artificial Educativa</h1>
          <h2>Diviértete con NUBI, tu robot amigo para</h2>
          <h2>aprender.</h2>
        </div>
      </div>

      {/* ESTE TEXTO SE QUEDA DEBAJO COMO YA LO TENÍAS */}
      <h1>¿Qué es Nubi?</h1>
      <h2>Es una plataforma educativa creada para acompañar a los niños al aprender.</h2>

      <div className="footer-container">
        <img src={footer} alt="Footer" className="footer-image" />

        {/* BOTONES SOBRE EL FOOTER */}
        <div className="footer-buttons">
          <img src={chatBtn} className="home-button" alt="Chat IA" />
          <img src={juegosBtn} className="home-button" alt="Minijuegos" />
          <img src={acercaBtn} className="home-button" alt="Acerca de Nubi" />
        </div>

        <p className="footer-text">© 2025 NUBI - Todos los derechos reservados</p>
      </div>
    </div>
  );
}
