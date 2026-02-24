import "../styles/navbar.css";
import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">

        {/* Logo que lleva al inicio */}
        <Link to="/" className="navbar-logo">
          <img src={logo} alt="Logo Nubi" draggable={false} />
        </Link>

        {/* Links de navegación */}
        <ul className="navbar-links">
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
    </nav>
  );
};

export default Navbar;
