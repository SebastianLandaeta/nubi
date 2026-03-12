// menu-scene.ts
import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Fondo de la escena
    this.cameras.main.setBackgroundColor('#578abd');

    // Título
    this.add.text(400, 150, 'SOPA DE LETRAS', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Botón Fácil (5x5, letras)
    const easyButton = this.add.rectangle(400, 300, 200, 60, 0xe2e0e0)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('GameScene', { size: 5, difficulty: 'easy' });
      });

    this.add.text(400, 300, 'Letras', {
      fontSize: '32px',
      color: '#000000',
    }).setOrigin(0.5);

    // Botón Medio (5x5, palabras)
    const mediumButton = this.add.rectangle(400, 400, 200, 60, 0xe2e0e0)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('GameScene', { size: 5, difficulty: 'medium' });
      });

    this.add.text(400, 400, 'Palabras', {
      fontSize: '32px',
      color: '#000000',
    }).setOrigin(0.5);
  }
}