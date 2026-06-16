// Componentes reutilizables
import NavBar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";

// Imágenes
import developer from "./assets/developer.png";
import characterTop from "./assets/character-top.png";
import characterBottom from "./assets/character-bottom.png";

// Estilos
import "./about.css";

export default function About() {
    return (
        <div className="about">
            <NavBar />

            <h1>Acerca de NUBI</h1>

            <div className="what">
                <div className="what-text">
                    <h2>¿Qué es NUBI?</h2>
                    <p>
                        NUBI es un agente inteligente para la enseñanza en niños, el cual puede conversar con ellos, y posee minijuegos para hacer del aprendizaje una experiencia divertida.
                    </p>
                </div>
                <img src={characterTop} alt="Personaje Superior" className="character-top" draggable={false} />
            </div>

            <div className="row">
                <div className="who">
                    <h2>¿Quién creó a NUBI?</h2>
                    <p>
                        NUBI fue creado por Sebastián Landaeta, estudiante de Ingeniería Informática de la UNEG, como su proyecto de grado.
                    </p>
                    <img src={developer} alt="Sebastián Landaeta" className="developer" draggable={false} />
                </div>

                <div className="objective">
                    <h2>¿Cuál es el objetivo de NUBI?</h2>
                    <p>
                        Hacer uso de la inteligencia artificial y la gamificación para facilitar el aprendizaje en niños, y así contribuir a la educación de una manera innovadora y atractiva.
                    </p>
                    <img src={characterBottom} alt="Personaje Inferior" className="character-bottom" draggable={false} />
                </div>
            </div>

            <Footer />
        </div>
    );
}