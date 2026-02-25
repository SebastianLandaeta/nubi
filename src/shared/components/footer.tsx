import linea from '../assets/linea.png';
import '../styles/footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <img src={linea} alt="Linea" className='linea' />
            <p className="footer-text">© 2026 NUBI - Todos los derechos reservados</p>
        </footer>
    );
}