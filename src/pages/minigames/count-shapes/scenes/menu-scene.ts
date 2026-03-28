import Phaser from 'phaser';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#578abd');

    this.add.text(400, 120, 'CONTAR FIGURAS', {
      fontSize: '42px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.createButton(400, 250, '3 Rondas', () => {
      this.scene.start('GameScene', { rounds: 3 });
    });

    this.createButton(400, 340, '5 Rondas', () => {
      this.scene.start('GameScene', { rounds: 5 });
    });

    this.createButton(400, 430, '10 Rondas', () => {
      this.scene.start('GameScene', { rounds: 10 });
    });
  }

  private createButton(x: number, y: number, text: string, callback: () => void) {
    const width = 260;
    const height = 70;

    const g = this.add.graphics();
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(x - width / 2, y - height / 2, width, height, 20);

    const zone = this.add.zone(x, y, width, height).setInteractive();
    zone.on('pointerdown', callback);

    this.add.text(x, y, text, {
      fontSize: '26px',
      color: '#000'
    }).setOrigin(0.5);
  }
}
