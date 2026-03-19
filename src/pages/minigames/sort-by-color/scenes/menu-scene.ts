import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#578abd');

    this.add.text(400, 150, 'CLASIFICAR COLORES', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.createButton(400, 320, 'Jugar', () => {
      this.scene.start('GameScene');
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void) {
    const width = 220;
    const height = 70;

    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRoundedRect(x - width / 2, y - height / 2, width, height, 20);

    const zone = this.add.zone(x, y, width, height).setInteractive();
    zone.on('pointerdown', callback);

    this.add.text(x, y, text, {
      fontSize: '30px',
      color: '#000000'
    }).setOrigin(0.5);
  }
}
