import Phaser from 'phaser';
import skyImage from './assets/space3.png';
import logoImage from './assets/phaser3-logo.png';
import redImage from './assets/red.png';

export class WordSearchGame extends Phaser.Scene {
  constructor() {
    super({ key: 'WordSearchGame' });
  }

  preload() {
    this.load.image('sky', skyImage);
    this.load.image('logo', logoImage);
    this.load.image('red', redImage);
  }

  create() {
    this.add.image(400, 300, 'sky');

    const particles = this.add.particles(0, 0, 'red', {
      speed: 100,
      scale: { start: 1, end: 0 },
      blendMode: 'ADD'
    });

    const logo = this.physics.add.image(400, 100, 'logo');

    logo.setVelocity(100, 500);
    logo.setBounce(1, 1);
    logo.setCollideWorldBounds(true);

    particles.startFollow(logo);
  }
}