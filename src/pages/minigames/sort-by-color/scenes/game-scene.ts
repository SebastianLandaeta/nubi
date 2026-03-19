import Phaser from 'phaser';
import success from '../../../../shared/assets/success.mp3';
import victory from '../../../../shared/assets/victory.mp3';

type ColorType = 'red' | 'blue' | 'yellow' | 'green';

export class GameScene extends Phaser.Scene {
  private successSound!: Phaser.Sound.BaseSound;
  private victorySound!: Phaser.Sound.BaseSound;

  private boxes!: { color: ColorType; zone: Phaser.GameObjects.Rectangle }[];
  private shapes!: Phaser.GameObjects.Shape[];

  private matchedCount = 0;
  private totalShapes = 20;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.audio('success', success);
    this.load.audio('victory', victory);
  }

  create() {
    this.successSound = this.sound.add('success');
    this.victorySound = this.sound.add('victory');

    this.cameras.main.setBackgroundColor('#578abd');

    this.matchedCount = 0;
    this.input.removeAllListeners();

    this.createBoxes();
    this.createShapes();
    this.setupDrag();
  }

  // 🎨 COLORES
  private getColorHex(color: ColorType): number {
    switch (color) {
      case 'red': return 0xff0000;
      case 'blue': return 0x0000ff;
      case 'yellow': return 0xffff00;
      case 'green': return 0x00ff00;
    }
  }

  // 📦 CAJAS
  private createBoxes() {
    const colors: ColorType[] = ['red', 'blue', 'yellow', 'green'];
    this.boxes = [];

    colors.forEach((color, index) => {
      const y = 150 + index * 100;

      const box = this.add.rectangle(150, y, 120, 80, this.getColorHex(color))
        .setStrokeStyle(3, 0xffffff);

      this.boxes.push({ color, zone: box });
    });
  }

  // 🔺 FIGURAS
  private createShapes() {
    const colors: ColorType[] = ['red', 'blue', 'yellow', 'green'];
    const temp: { color: ColorType; shape: string }[] = [];

    colors.forEach(color => {
      for (let i = 0; i < 5; i++) {
        temp.push({
          color,
          shape: Phaser.Utils.Array.GetRandom(['circle', 'square', 'triangle'])
        });
      }
    });

    Phaser.Utils.Array.Shuffle(temp);

    this.shapes = [];

    temp.forEach((item, index) => {
      const x = 450 + (index % 5) * 70;
      const y = 100 + Math.floor(index / 5) * 90;

      let obj: Phaser.GameObjects.Shape;

      if (item.shape === 'circle') {
        obj = this.add.circle(x, y, 25, this.getColorHex(item.color));
      } else if (item.shape === 'square') {
        obj = this.add.rectangle(x, y, 50, 50, this.getColorHex(item.color));
      } else {
        obj = this.add.triangle(
          x, y,
          0, 50,
          25, 0,
          50, 50,
          this.getColorHex(item.color)
        );
      }

      obj.setInteractive({ draggable: true });
      this.input.setDraggable(obj);

      obj.setData('color', item.color);
      obj.setData('startX', x);
      obj.setData('startY', y);

      this.shapes.push(obj);
    });
  }

  // 🖱️ DRAG
  private setupDrag() {
    this.input.on('drag', (_: any, obj: any, x: number, y: number) => {
      obj.x = x;
      obj.y = y;
    });

    this.input.on('dragend', (_: any, obj: any) => {
      this.checkDrop(obj);
    });
  }

  // ✅ VALIDACIÓN
  private checkDrop(obj: any) {
    const color = obj.getData('color');
    let correct = false;

    this.boxes.forEach(box => {
      if (Phaser.Geom.Rectangle.Contains(
        box.zone.getBounds(),
        obj.x,
        obj.y
      )) {
        if (box.color === color) {
          correct = true;

          this.successSound.play();

          obj.disableInteractive();

          this.tweens.add({
            targets: obj,
            x: box.zone.x,
            y: box.zone.y,
            duration: 200
          });

          this.matchedCount++;

          if (this.matchedCount === this.totalShapes) {
            this.showVictory();
          }
        }
      }
    });

    if (!correct) {
      this.tweens.add({
        targets: obj,
        x: obj.getData('startX'),
        y: obj.getData('startY'),
        duration: 300
      });
    }
  }

  // 🏆 VICTORIA
  private showVictory() {
    this.victorySound.play();
    
    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    this.add.text(400, 200, '¡VICTORIA!', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    const retry = this.add.rectangle(400, 350, 220, 60, 0x4caf50)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.restart();
      });

    this.add.text(400, 350, 'Reintentar', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const menu = this.add.rectangle(400, 430, 220, 60, 0x2196f3)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('MenuScene');
      });

    this.add.text(400, 430, 'Menú', {
      fontSize: '28px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }
}
