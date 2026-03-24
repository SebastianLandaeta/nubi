import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { MenuScene } from './scenes/menu-scene';
import { GameScene } from './scenes/game-scene';
import Navbar from '../../../shared/components/navbar';
import Footer from '../../../shared/components/footer';
import './number-match.css';

export default function NumberMatch() {
  const gameRef = useRef<HTMLDivElement>(null);
  const gameInstance = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (!gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: gameRef.current,
      scene: [MenuScene, GameScene],
      backgroundColor: '#2d2d2d',
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameInstance.current = new Phaser.Game(config);

    return () => {
      gameInstance.current?.destroy(true);
      gameInstance.current = null;
    };
  }, []);

  return (
    <div className="number-match">
      <Navbar />

      <div className="juego-container">
        <div className="juego" ref={gameRef} />
      </div>

      <Footer />
    </div>
  );
}
