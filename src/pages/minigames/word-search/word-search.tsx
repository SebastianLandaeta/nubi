import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { WordSearchGame } from './word-search-game';
import Navbar from '../../../shared/components/navbar';
import Footer from '../../../shared/components/footer';
import './word-search.css';

export default function WordSearch() {
  const gameRef = useRef<HTMLDivElement>(null);          // Referencia al contenedor DOM
  const gameInstance = useRef<Phaser.Game | null>(null); // Ahora puede ser Game o null

  useEffect(() => {
    if (!gameRef.current) return; // Asegurar que el contenedor existe

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,      // El div donde se montará el canvas
      scene: WordSearchGame,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 200 },
        }
      },
      backgroundColor: '#000000'
    };

    gameInstance.current = new Phaser.Game(config);

    // Limpiar al desmontar el componente
    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null; // Opcional: restablecer a null
      }
    };
  }, []); // Solo se ejecuta una vez al montar

  return (
    <div className="word-search">
      <Navbar />
      
      <div className='juego' ref={gameRef} />

      <Footer />
    </div>
  ); 
};