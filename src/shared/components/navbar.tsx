// Componentes
import { useState } from "react";
import { Link } from "react-router-dom";

// Imagen
import logo from "../../assets/logo.png";

// Estilos
import "../styles/navbar.css";

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const closeDrawer = () => {
    setDrawerOpen(false);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={closeDrawer}>
          <img src={logo} alt="Logo Nubi" draggable={false} />
        </Link>

        {/* Menú hamburguesa (solo visible en móvil) */}
        <button className="navbar-hamburger" onClick={toggleDrawer}>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        {/* Links de navegación para escritorio */}
        <ul className="navbar-links desktop-links">
          <li>
            <Link to="/">Página principal</Link>
          </li>
          <li>
            <Link to="/chat">Chat con la IA</Link>
          </li>
          <li>
            <Link to="/minijuegos">Minijuegos</Link>
          </li>
          <li>
            <Link to="/acerca">Acerca de</Link>
          </li>
        </ul>
      </div>

      {/* Drawer (panel lateral) para móvil */}
      <div className={`navbar-drawer ${drawerOpen ? "open" : ""}`}>
        <div className="drawer-header">
          <span className="drawer-close" onClick={closeDrawer}>&times;</span>
        </div>
        <ul className="drawer-links">
          <li>
            <Link to="/" onClick={closeDrawer}>Página principal</Link>
          </li>
          <li>
            <Link to="/chat" onClick={closeDrawer}>Chat con la IA</Link>
          </li>
          <li>
            <Link to="/minijuegos" onClick={closeDrawer}>Minijuegos</Link>
          </li>
          <li>
            <Link to="/acerca" onClick={closeDrawer}>Acerca de</Link>
          </li>
        </ul>
      </div>

      {/* Overlay oscuro cuando el drawer está abierto */}
      {drawerOpen && <div className="drawer-overlay" onClick={closeDrawer}></div>}
    </nav>
  );
}