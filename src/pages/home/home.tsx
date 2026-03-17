import NavBar from '../../shared/components/navbar';
import Footer from '../../shared/components/footer';
import { Link } from 'react-router-dom';
import hero from './assets/hero.png';
import heroResponsive from './assets/hero-responsive.png';
import cloudsBottom from './assets/clouds-bottom.png';
import chatBtn from './assets/chat-btn.png';
import minigamesBtn from './assets/minigames-btn.png';
import aboutBtn from './assets/about-btn.png';
import './home.css';

export default function Home() {
  return (
    <div className="home">
      <NavBar />

      <div className="hero-container">
        <picture>
          <source media="(max-width: 768px)" srcSet={heroResponsive} />
          <img src={hero} alt="Hero" className="hero-image" draggable={false} />
        </picture>
      </div>

      <div className="info-container">
        <h1>¿Qué es Nubi?</h1>
        <h2>Es una plataforma educativa creada para acompañar a los niños al aprender.</h2>
      </div>
      
      <div className="footer-container">
      
        <div className="footer-buttons">
          <Link to="/chat" aria-label="Chat IA">
            <img src={chatBtn} className="home-button" alt="Chat IA" />
          </Link>
          <Link to="/minijuegos" aria-label="Minijuegos">
            <img src={minigamesBtn} className="home-button" alt="Minijuegos" />
          </Link>
          <Link to="/acerca" aria-label="Acerca de Nubi">
            <img src={aboutBtn} className="home-button" alt="Acerca de Nubi" />
          </Link>
        </div>

        <img src={cloudsBottom} alt="Nubes-abajo" className="clouds-bottom-image" draggable={false} />
      </div>

      <Footer />
    </div>
  );
}
