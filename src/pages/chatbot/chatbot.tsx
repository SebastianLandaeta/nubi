import NavBar from "../../shared/components/navbar";
import Footer from "../../shared/components/footer";
import nubesArriba from "./assets/nubes-arriba.png";
import nubesAbajo from "./assets/nubes-abajo.png";
import "./chatbot.css";

export default function Chatbot() {
  return (
    <div className="chat">
      <NavBar />
      <img src={nubesArriba} alt="Nubes arriba" draggable={false} />
      <img src={nubesAbajo} alt="Nubes abajo" draggable={false} />
      <Footer />
    </div>
  );
}