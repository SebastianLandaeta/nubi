import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MenuScene } from './scenes/menu-scene';
import { GameScene } from './scenes/game-scene';
import Navbar from '../../../shared/components/navbar';
import Footer from '../../../shared/components/footer';
import './word-search.css';

export default function WordSearch() {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,

      // Resolución base del juego
      width: 800,
      height: 600,

      parent: gameRef.current,

      scene: [MenuScene, GameScene],
      physics: { default: 'arcade' },
      backgroundColor: '#2d2d2d',

      scale: {
        mode: Phaser.Scale.FIT,              // 🔥 Hace el juego responsive
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameInstance.current = new Phaser.Game(config);

    return () => {
      if (gameInstance.current) {
        gameInstance.current.destroy(true);
        gameInstance.current = null;
      }
    };
  }, []);

  return (
    <div className="word-search">
      <Navbar />

      <div className="juego-container">
        <div className="juego" ref={gameRef} />
      </div>

      <Footer />
    </div>
  );
}
