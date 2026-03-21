import line from '../assets/line.png';
import '../styles/footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            <img src={line} alt="Linea" className='line' />
            <p className="footer-text">© 2026 NUBI - Todos los derechos reservados</p>
        </footer>
    );
}