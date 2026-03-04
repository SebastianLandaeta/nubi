// scenes/MenuScene.ts
import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Título: usamos color en lugar de fill
    this.add.text(400, 150, 'SOPA DE LETRAS', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Botón Fácil (7x7)
    const easyButton = this.add.rectangle(400, 300, 200, 60, 0x4caf50)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('GameScene', { size: 7, difficulty: 'easy' });
      });

    // Texto del botón fácil
    this.add.text(400, 300, 'Fácil', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);

    // Botón Medio (11x11)
    const mediumButton = this.add.rectangle(400, 400, 200, 60, 0xff9800)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('GameScene', { size: 11, difficulty: 'medium' });
      });

    // Texto del botón medio
    this.add.text(400, 400, 'Medio', {
      fontSize: '32px',
      color: '#ffffff',
    }).setOrigin(0.5);
  }
}