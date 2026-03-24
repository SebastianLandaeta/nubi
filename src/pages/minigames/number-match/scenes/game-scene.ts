import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {

  private leftTexts: Phaser.GameObjects.Text[] = [];
  private rightTexts: Phaser.GameObjects.Text[] = [];

  private selectedLeft: Phaser.GameObjects.Text | null = null;

  private lines!: Phaser.GameObjects.Graphics;

  private matches: Map<string, boolean> = new Map();

  private totalMatches = 10;
  private correctMatches = 0;

  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    this.cameras.main.setBackgroundColor('#578abd');

    this.correctMatches = 0;
    this.matches.clear();

    this.lines = this.add.graphics();

    this.createPairs();
  }

  // 📊 Crear números
  private createPairs() {
    const numbers = [
      { num: '0', text: 'cero' },
      { num: '1', text: 'uno' },
      { num: '2', text: 'dos' },
      { num: '3', text: 'tres' },
      { num: '4', text: 'cuatro' },
      { num: '5', text: 'cinco' },
      { num: '6', text: 'seis' },
      { num: '7', text: 'siete' },
      { num: '8', text: 'ocho' },
      { num: '9', text: 'nueve' }
    ];

    const left = Phaser.Utils.Array.Shuffle([...numbers]);
    const right = Phaser.Utils.Array.Shuffle([...numbers]);

    // IZQUIERDA (palabras)
    left.forEach((item, i) => {
      const t = this.add.text(150, 80 + i * 45, item.text, {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#333'
      }).setPadding(5).setInteractive();

      t.setData('value', item.num);

      t.on('pointerdown', () => this.selectLeft(t));

      this.leftTexts.push(t);
    });

    // DERECHA (números)
    right.forEach((item, i) => {
      const t = this.add.text(600, 80 + i * 45, item.num, {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#333'
      }).setPadding(5).setInteractive();

      t.setData('value', item.num);

      t.on('pointerdown', () => this.tryMatch(t));

      this.rightTexts.push(t);
    });
  }

  // 🖱️ seleccionar izquierda
  private selectLeft(text: Phaser.GameObjects.Text) {
    if (this.matches.get(text.getData('value'))) return;

    this.selectedLeft = text;

    this.leftTexts.forEach(t => t.setStyle({ backgroundColor: '#333' }));
    text.setStyle({ backgroundColor: '#00aa00' });
  }

  // 🔗 intentar conexión
  private tryMatch(right: Phaser.GameObjects.Text) {
    if (!this.selectedLeft) return;

    const leftVal = this.selectedLeft.getData('value');
    const rightVal = right.getData('value');

    const startX = this.selectedLeft.x + 100;
    const startY = this.selectedLeft.y + 15;

    const endX = right.x;
    const endY = right.y + 15;

    if (leftVal === rightVal && !this.matches.get(leftVal)) {
      // ✅ correcto
      this.lines.lineStyle(3, 0x00ff00);
      this.lines.strokeLineShape(new Phaser.Geom.Line(startX, startY, endX, endY));

      this.matches.set(leftVal, true);

      this.selectedLeft.setStyle({ backgroundColor: '#00ff00' });
      right.setStyle({ backgroundColor: '#00ff00' });

      this.selectedLeft.disableInteractive();
      right.disableInteractive();

      this.correctMatches++;

      if (this.correctMatches === this.totalMatches) {
        this.showVictory();
      }

    } else {
      // ❌ incorrecto
      const tempLine = this.add.graphics();
      tempLine.lineStyle(3, 0xff0000);
      tempLine.strokeLineShape(new Phaser.Geom.Line(startX, startY, endX, endY));

      this.time.delayedCall(500, () => {
        tempLine.destroy();
      });
    }

    this.selectedLeft.setStyle({ backgroundColor: '#333' });
    this.selectedLeft = null;
  }

  // 🏆 victoria
  private showVictory() {
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    this.add.text(400, 200, '¡VICTORIA!', {
      fontSize: '60px',
      color: '#ffff00'
    }).setOrigin(0.5);

    const retry = this.add.rectangle(400, 350, 220, 60, 0x4caf50)
      .setInteractive()
      .on('pointerdown', () => this.scene.restart());

    this.add.text(400, 350, 'Reintentar', {
      fontSize: '28px',
      color: '#fff'
    }).setOrigin(0.5);

    const menu = this.add.rectangle(400, 430, 220, 60, 0x2196f3)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('MenuScene'));

    this.add.text(400, 430, 'Menú', {
      fontSize: '28px',
      color: '#fff'
    }).setOrigin(0.5);
  }
}
