import "./minigames.css"
import { Link } from "react-router-dom";
import Navbar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";
import nubesAbajo from "./assets/nubes-abajo.png";
import nubesArriba from "./assets/nubes-arriba.png";

export default function MiniGames() {
    return (
        <div className="minijuegos">
            <Navbar />
            <img src={nubesArriba} alt="Nubes arriba" draggable={false} />
            
            <h1>Minijuegos</h1>
            <Link to="/minijuegos/sopa-de-letras" aria-label="Sopa de Letras">
                <button>Sopa de Letras</button>
            </Link>

            <img src={nubesAbajo} alt="Nubes abajo" draggable={false} />

            <Footer />
        </div>
    );
}