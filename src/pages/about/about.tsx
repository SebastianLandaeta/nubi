import "./about.css";
import creador from "./assets/creador.png";
import personajeTop from "./assets/personaje-top.png";
import personajeBottom from "./assets/personaje-bottom.png";
import NavBar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";

export default function About() {
    return (
        <div className="about">
            <NavBar />

            <h1>Acerca de NUBI</h1>

            {/* Sección "¿Qué es NUBI?" con imagen a la derecha */}
            <div className="que">
                <div className="que-text">
                    <h2>¿Qué es NUBI?</h2>
                    <p>
                        NUBI es un agente inteligente para la enseñanza en niños, el cual puede conversar con ellos, y posee minijuegos para hacer del aprendizaje una experiencia divertida.
                    </p>
                </div>
                <img src={personajeTop} alt="Personaje Superior" className="personaje-top" />
            </div>

            <div className="row">
                <div className="quien">
                    <h2>¿Quién creó a NUBI?</h2>
                    <p>
                        NUBI fue creado por Sebastián Landaeta, estudiante de Ingeniería Informática de la UNEG, como su proyecto de grado.
                    </p>
                    <img src={creador} alt="Sebastián Landaeta" className="creador" />
                </div>

                <div className="objetivo">
                    <h2>¿Cuál es el objetivo de NUBI?</h2>
                    <p>
                        Hacer uso de la inteligencia artificial y la gamificación para facilitar el aprendizaje en niños, y así contribuir a la educación de una manera innovadora y atractiva.
                    </p>
                    <img src={personajeBottom} alt="Personaje Inferior" className="personaje-bottom" />
                </div>
            </div>

            <Footer />
        </div>
    );
}