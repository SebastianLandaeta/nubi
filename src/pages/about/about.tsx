import "./about.css";
import NavBar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";

export default function About() {
    return (
        <div className="about">
            <NavBar />

            <h1>Acerca de NUBI</h1>

            <div className="que">
                <h2>¿Qué es NUBI?</h2>
                <p>
                    NUBI es un agente inteligente para la enseñanza en niños, el cual puede conversar con ellos, y posee minijuegos para hacer del aprendizaje una experiencia divertida.
                </p>
            </div>

            <div className="row">
                <div className="quien">
                    <h2>¿Quién creó a NUBI?</h2>
                    <p>
                        NUBI fue creado por Sebastián Landaeta, estudiante de Ingeniería Informática de la UNEG, como su proyecto de grado.
                    </p>
                </div>

                <div className="objetivo">
                    <h2>¿Cuál es el objetivo de NUBI?</h2>
                    <p>
                        Hacer uso de la inteligencia artificial y la gamificación para facilitar el aprendizaje en niños, y así contribuir a la educación de una manera innovadora y atractiva.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
}