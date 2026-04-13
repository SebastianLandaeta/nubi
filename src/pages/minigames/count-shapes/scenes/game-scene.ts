import Phaser from 'phaser';
import success from '../../../../shared/assets/success.mp3';
import victory from '../../../../shared/assets/victory.mp3';

export class GameScene extends Phaser.Scene {

  private targetNumber!: number;
  private previousNumber: number | null = null;

  private shapes: Phaser.GameObjects.GameObject[] = [];
  private options: Phaser.GameObjects.Text[] = [];

  private score = 0;
  private scoreText!: Phaser.GameObjects.Text;

  private totalRounds = 5;
  private currentRound = 1;
  private roundText!: Phaser.GameObjects.Text;

  // ⏱️ TIMER
  private startTime = 0;
  private elapsedTime = 0;
  private timerText!: Phaser.GameObjects.Text;
  private gameFinished = false;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    this.load.audio('success', success);
    this.load.audio('victory', victory);
  }

  init(data: { rounds: number }) {
    this.totalRounds = data.rounds || 5;
  }

  create() {
    this.cameras.main.setBackgroundColor('#578abd');

    this.score = 0;
    this.currentRound = 1;
    this.previousNumber = null;
    this.gameFinished = false;

    // ⏱️ iniciar timer
    this.startTime = this.time.now;
    this.elapsedTime = 0;

    this.timerText = this.add.text(20, 20, 'Tiempo: 0.0s', {
      fontSize: '26px',
      color: '#ffffff'
    }).setOrigin(0, 0);

    this.scoreText = this.add.text(20, 60, 'Puntos: 0', {
      fontSize: '26px',
      color: '#ffffff'
    });

    this.roundText = this.add.text(600, 20, `Ronda: 1/${this.totalRounds}`, {
      fontSize: '26px',
      color: '#ffffff'
    });

    this.startRound();
  }

  update() {
    if (this.gameFinished) return;

    const currentTime = this.time.now;
    this.elapsedTime = (currentTime - this.startTime) / 1000;

    this.timerText.setText(`Tiempo: ${this.elapsedTime.toFixed(1)}s`);
  }

  // Nueva ronda
  private startRound() {

    if (this.currentRound > this.totalRounds) {
      this.showGameOver();
      return;
    }

    this.clearScene();

    this.targetNumber = this.generateNumber();

    this.drawBox();
    this.drawShapes(this.targetNumber);
    this.createOptions();

    this.roundText.setText(`Ronda: ${this.currentRound}/${this.totalRounds}`);
  }

  // Número
  private generateNumber(): number {
    let num;

    do {
      num = Phaser.Math.Between(1, 9);
    } while (num === this.previousNumber);

    this.previousNumber = num;
    return num;
  }

  // Caja
  private drawBox() {
    this.add.rectangle(400, 220, 320, 220, 0xffffff)
      .setStrokeStyle(4, 0x000000);

    this.add.text(400, 90, '¿Cuántas figuras hay?', {
      fontSize: '30px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  // Figuras
  private drawShapes(count: number) {

    const positions = [
      { x: 320, y: 150 }, { x: 400, y: 150 }, { x: 480, y: 150 },
      { x: 320, y: 210 }, { x: 400, y: 210 }, { x: 480, y: 210 },
      { x: 320, y: 270 }, { x: 400, y: 270 }, { x: 480, y: 270 }
    ];

    const shapeType = Phaser.Math.Between(0, 2);

    for (let i = 0; i < count; i++) {
      const pos = positions[i];

      let shape;

      if (shapeType === 0) {
        shape = this.add.circle(pos.x, pos.y, 18, 0xff0000);
      } else if (shapeType === 1) {
        shape = this.add.rectangle(pos.x, pos.y, 36, 36, 0x00ff00);
      } else {
        shape = this.add.triangle(
          pos.x, pos.y,
          0, 36,
          18, 0,
          36, 36,
          0x0000ff
        );
      }

      this.shapes.push(shape);
    }
  }

  // Opciones
  private createOptions() {
    for (let i = 1; i <= 9; i++) {

      const txt = this.add.text(100 + i * 65, 460, i.toString(), {
        fontSize: '28px',
        backgroundColor: '#333',
        color: '#fff'
      })
        .setPadding(10)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.checkAnswer(i));

      this.options.push(txt);
    }
  }

  // Validar
  private checkAnswer(value: number) {

    this.options.forEach(o => o.disableInteractive());

    if (value === this.targetNumber) {
      this.sound.play('success');

      this.score++;
      this.scoreText.setText('Puntos: ' + this.score);

      this.showFeedback('¡Correcto!', 0x00ff00);

      this.time.delayedCall(800, () => {
        this.currentRound++;
        this.startRound();
      });

    } else {

      this.showFeedback('Intenta otra vez', 0xff0000);

      this.time.delayedCall(800, () => {
        this.options.forEach(o => o.setInteractive());
      });
    }
  }

  // 💬 Feedback
  private showFeedback(text: string, color: number) {
    const t = this.add.text(400, 380, text, {
      fontSize: '40px',
      color: '#' + color.toString(16).padStart(6, '0')
    }).setOrigin(0.5);

    this.time.delayedCall(700, () => t.destroy());
  }

  // 🏁 FIN DEL JUEGO
  private showGameOver() {
    this.gameFinished = true; // 🛑 detener timer

    this.sound.play('victory');

    const finalTime = this.elapsedTime.toFixed(1);

    // mejor tiempo por modo
    const storageKey = `bestTime_${this.totalRounds}`;
    const best = localStorage.getItem(storageKey);

    if (!best || parseFloat(finalTime) < parseFloat(best)) {
      localStorage.setItem(storageKey, finalTime);
    }

    const bestTime = localStorage.getItem(storageKey);

    this.clearScene();

    this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);

    this.add.text(400, 200, '¡VICTORIA!', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(400, 260, `Tiempo: ${finalTime}s`, {
      fontSize: '32px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(400, 300, `Mejor tiempo: ${bestTime}s`, {
      fontSize: '26px',
      color: '#00ffcc'
    }).setOrigin(0.5);

    const retry = this.add.rectangle(400, 400, 240, 70, 0x4caf50)
      .setInteractive()
      .on('pointerdown', () => this.scene.restart());

    this.add.text(400, 400, 'Reintentar', {
      fontSize: '28px',
      color: '#fff'
    }).setOrigin(0.5);

    const menu = this.add.rectangle(400, 480, 240, 70, 0x2196f3)
      .setInteractive()
      .on('pointerdown', () => this.scene.start('MenuScene'));

    this.add.text(400, 480, 'Menú', {
      fontSize: '28px',
      color: '#fff'
    }).setOrigin(0.5);
  }

  // 🧹 Limpiar
  private clearScene() {
    this.shapes.forEach(s => s.destroy());
    this.options.forEach(o => o.destroy());

    this.shapes = [];
    this.options = [];
  }
}
