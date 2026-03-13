import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    // Fondo
    this.cameras.main.setBackgroundColor('#578abd');

    // Título
    this.add.text(400, 150, 'SOPA DE LETRAS', {
      fontSize: '48px',
      color: '#ffffff',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Botón "Letras" (fácil)
    this.createRoundedButton(400, 300, 'Letras', () => {
      this.scene.start('GameScene', { size: 5, difficulty: 'easy' });
    });

    // Botón "Palabras" (medio)
    this.createRoundedButton(400, 400, 'Palabras', () => {
      this.scene.start('GameScene', { size: 5, difficulty: 'medium' });
    });
  }

  /**
   * Crea un botón con fondo redondeado y texto centrado.
   * @param x Centro X
   * @param y Centro Y
   * @param text Texto del botón
   * @param callback Función al hacer clic
   */
  private createRoundedButton(x: number, y: number, text: string, callback: () => void) {
    const width = 200;
    const height = 60;
    const radius = 15; // Radio de las esquinas

    // Dibujar rectángulo redondeado
    const graphics = this.add.graphics();
    graphics.fillStyle(0xe2e0e0, 1);
    // fillRoundedRect(x, y, width, height, radius) recibe la esquina superior izquierda
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);

    // Zona interactiva (detecta clics en el área rectangular)
    const zone = this.add.zone(x, y, width, height).setInteractive();
    zone.on('pointerdown', callback);

    // Texto del botón
    this.add.text(x, y, text, {
      fontSize: '32px',
      color: '#000000',
    }).setOrigin(0.5);
  }
}