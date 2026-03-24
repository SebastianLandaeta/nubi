import Phaser from 'phaser';
import success from '../../../../shared/assets/success.mp3';
import victory from '../../../../shared/assets/victory.mp3';

// Pools de palabras (solo para dificultad 'palabras')
const MEDIUM_WORDS_POOL = [
  'COCO', 'GATO', 'CASA', 'SOL', 'LUNA', 'MAR', 'CIELO', 'FLOR', 'CARA', 'NUBE',
  'AGUA', 'CEJA', 'TIA', 'LOBO', 'ROJO', 'AZUL', 'PATO', 'MONO', 'BEBE',
  'PAPA', 'MAMA', 'DEDO', 'OJO', 'TIO', 'MANO', 'PEZ', 'AVE', 'LEON', 'CAMA',
  'VACA', 'CERDO', 'RISA', 'RANA', 'PERA', 'MORA'
];

export class GameScene extends Phaser.Scene {
  // Constantes de color
  private readonly BASE_CELL_COLOR = 0xffffff;        // Blanco
  private readonly INCORRECT_LETTER_COLOR = 0x666666; // Gris oscuro para letras incorrectas
  private readonly TEMP_HIGHLIGHT_COLOR = 0xffff00;   // Amarillo
  private readonly PERMANENT_HIGHLIGHT_COLOR = 0x00ff00; // Verde

  // Sonidos
  private successSound!: Phaser.Sound.BaseSound;
  private victorySound!: Phaser.Sound.BaseSound;

  // Propiedades comunes
  private gridSize!: number;
  private difficulty!: string;
  private isLetterMode!: boolean;   // true para 'easy' (letras), false para 'medium' (palabras)
  private grid!: string[][];
  private cells!: { bg: Phaser.GameObjects.Rectangle; letter: Phaser.GameObjects.Text }[][];
  private isSelecting!: boolean;
  private startCell!: { row: number; col: number } | null;
  private currentHighlight!: { row: number; col: number }[];
  private permanentHighlights!: { row: number; col: number }[];
  private startTime!: number;
  private elapsedTime!: number;
  private timerText!: Phaser.GameObjects.Text | null;
  private gameFinished!: boolean;

  // Propiedades para modo palabras
  private wordList!: string[];
  private foundWords!: boolean[];
  private wordTexts!: Phaser.GameObjects.Text[];

  // Propiedades para modo letras
  private targetLetters!: string[];        // 4 letras a buscar
  private foundLetters!: boolean[];
  private letterTexts!: Phaser.GameObjects.Text[];
  private incorrectCells!: boolean[][];    // true si la celda ya fue marcada como incorrecta

  // Dimensiones del tablero
  private cellSize!: number;
  private startX!: number;
  private startY!: number;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload() {
    // Carga los efectos de sonido (ajusta la ruta según tu estructura)
    this.load.audio('success', success);
    this.load.audio('victory', victory);
  }

  init(data: { size: number; difficulty: string }) {
    this.gridSize = data.size;
    this.difficulty = data.difficulty;
    this.isLetterMode = (this.difficulty === 'easy');

    this.grid = [];
    this.cells = [];
    this.isSelecting = false;
    this.startCell = null;
    this.currentHighlight = [];
    this.permanentHighlights = [];
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerText = null;
    this.gameFinished = false;

    if (this.isLetterMode) {
      // Modo letras: 4 letras aleatorias sin repetir
      const lettersPool = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      this.targetLetters = [];
      while (this.targetLetters.length < 4) {
        const letter = lettersPool[Math.floor(Math.random() * lettersPool.length)];
        if (!this.targetLetters.includes(letter)) {
          this.targetLetters.push(letter);
        }
      }
      this.foundLetters = new Array(4).fill(false);
      this.letterTexts = [];
      // Inicializar matriz de celdas incorrectas
      this.incorrectCells = [];
      for (let i = 0; i < this.gridSize; i++) {
        this.incorrectCells[i] = new Array(this.gridSize).fill(false);
      }
    } else {
      // Modo palabras: seleccionar 4 palabras del pool (tablero 5x5)
      const filteredPool = MEDIUM_WORDS_POOL.filter(word => word.length <= this.gridSize);
      while (filteredPool.length < 4) {
        filteredPool.push(...filteredPool);
      }
      this.wordList = this.shuffleArray(filteredPool).slice(0, 4);
      this.foundWords = new Array(this.wordList.length).fill(false);
      this.wordTexts = [];
    }
  }

  create() {
    // Crea los objetos de sonido (ya cargados)
    this.successSound = this.sound.add('success');
    this.victorySound = this.sound.add('victory');

    // Fondo azul claro
    this.cameras.main.setBackgroundColor('#578abd');

    // Configurar dimensiones del tablero
    this.cellSize = 50;
    this.startX = (this.cameras.main.width - this.gridSize * this.cellSize) / 2;
    this.startY = 100;

    this.createGrid(); // Genera el tablero según el modo

    // Crear celdas con fondo blanco y letras negras
    for (let row = 0; row < this.gridSize; row++) {
      this.cells[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        const x = this.startX + col * this.cellSize + this.cellSize / 2;
        const y = this.startY + row * this.cellSize + this.cellSize / 2;

        const bg = this.add.rectangle(x, y, this.cellSize - 2, this.cellSize - 2, this.BASE_CELL_COLOR)
          .setOrigin(0.5)
          .setStrokeStyle(1, 0xcccccc); // borde gris claro

        const letter = this.add.text(x, y, this.grid[row][col], {
          fontSize: '29px',
          color: '#000000', // letra negra
          fontFamily: 'Arial',
        }).setOrigin(0.5);

        this.cells[row][col] = { bg, letter };
      }
    }

    // Lista de elementos a buscar (justo a la derecha del tablero)
    const listX = this.startX + this.gridSize * this.cellSize + 40;
    let listY = 150;

    if (this.isLetterMode) {
      this.add.text(listX, listY - 30, 'Buscar letras:', {
        fontSize: '24px',
        color: '#ffff00',
      });
      this.targetLetters.forEach((letter, index) => {
        const text = this.add.text(listX, listY + index * 40, letter, {
          fontSize: '28px',
          color: '#ffffff',
          fontStyle: 'bold',
        });
        this.letterTexts.push(text);
      });
    } else {
      this.add.text(listX, listY - 30, 'Buscar palabras:', {
        fontSize: '24px',
        color: '#ffff00',
      });
      this.wordList.forEach((word, index) => {
        const text = this.add.text(listX, listY + index * 40, word, {
          fontSize: '28px',
          color: '#ffffff',
          fontStyle: 'bold',
        });
        this.wordTexts.push(text);
      });
    }

    // Temporizador
    this.startTime = Date.now();
    this.timerText = this.add.text(this.startX, 50, 'Tiempo: 0s', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // Eventos de entrada
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
  }

  update() {
    if (!this.gameFinished && this.timerText) {
      const seconds = Math.floor((Date.now() - this.startTime) / 1000);
      this.timerText.setText(`Tiempo: ${seconds}s`);
    }
  }

  private createGrid() {
    if (this.isLetterMode) {
      this.createGridForLetters();
    } else {
      this.createGridForWords();
    }
  }

  private createGridForLetters() {
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = new Array(this.gridSize).fill('');
    }

    // Colocar letras objetivo en posiciones aleatorias
    const positions: { row: number; col: number }[] = [];
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        positions.push({ row, col });
      }
    }
    const shuffledPos = this.shuffleArray(positions);

    for (let i = 0; i < this.targetLetters.length; i++) {
      const pos = shuffledPos[i];
      this.grid[pos.row][pos.col] = this.targetLetters[i];
    }

    // Rellenar el resto con letras aleatorias
    for (let row = 0; row < this.gridSize; row++) {
      for (let col = 0; col < this.gridSize; col++) {
        if (this.grid[row][col] === '') {
          this.grid[row][col] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
  }

  private createGridForWords() {
    const maxGlobalAttempts = 500;
    let success = false;
    let attempts = 0;

    while (!success && attempts < maxGlobalAttempts) {
      success = this.tryCreateGridForWords();
      attempts++;
    }

    if (!success) {
      console.warn('No se pudo colocar todas las palabras');
    }
  }

  private tryCreateGridForWords(): boolean {
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = new Array(this.gridSize).fill('');
    }

    const directions: [number, number][] = [
      [1, 0], [0, 1], [1, 1], [-1, 1]
    ];

    const wordsToPlace = this.shuffleArray([...this.wordList]);
    const placed = new Array(wordsToPlace.length).fill(false);

    for (let wIndex = 0; wIndex < wordsToPlace.length; wIndex++) {
      const word = wordsToPlace[wIndex];
      let wordPlaced = false;
      let attempts = 0;
      const maxAttemptsPerWord = 300;

      while (!wordPlaced && attempts < maxAttemptsPerWord) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const [dx, dy] = dir;

        const startX = Math.floor(Math.random() * this.gridSize);
        const startY = Math.floor(Math.random() * this.gridSize);

        const endX = startX + (word.length - 1) * dx;
        const endY = startY + (word.length - 1) * dy;
        if (endX < 0 || endX >= this.gridSize || endY < 0 || endY >= this.gridSize) continue;

        let conflict = false;
        for (let i = 0; i < word.length; i++) {
          const x = startX + i * dx;
          const y = startY + i * dy;
          if (this.grid[y][x] !== '' && this.grid[y][x] !== word[i]) {
            conflict = true;
            break;
          }
        }
        if (conflict) continue;

        for (let i = 0; i < word.length; i++) {
          const x = startX + i * dx;
          const y = startY + i * dy;
          this.grid[y][x] = word[i];
        }
        wordPlaced = true;
        placed[wIndex] = true;
      }
    }

    const allPlaced = placed.every(v => v);
    if (allPlaced) {
      for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
          if (this.grid[y][x] === '') {
            this.grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
          }
        }
      }
      return true;
    }
    return false;
  }

  private getCellFromPointer(pointer: Phaser.Input.Pointer) {
    const col = Math.floor((pointer.x - this.startX) / this.cellSize);
    const row = Math.floor((pointer.y - this.startY) / this.cellSize);

    if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
      return { row, col };
    }
    return null;
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.gameFinished) return;
    const cell = this.getCellFromPointer(pointer);
    if (cell) {
      // En modo letras, no permitir clic en celdas incorrectas o ya encontradas
      if (this.isLetterMode) {
        const isPermanent = this.permanentHighlights.some(p => p.row === cell.row && p.col === cell.col);
        const isIncorrect = this.incorrectCells[cell.row][cell.col];
        if (isPermanent || isIncorrect) return;
      }
      this.isSelecting = true;
      this.startCell = cell;
      this.highlightCell(cell.row, cell.col, this.TEMP_HIGHLIGHT_COLOR);
      this.currentHighlight.push({ row: cell.row, col: cell.col });
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isSelecting || this.gameFinished) return;

    // En modo letras no hay arrastre
    if (this.isLetterMode) return;

    const currentCell = this.getCellFromPointer(pointer);
    if (!currentCell) return;

    this.clearTemporaryHighlight();

    const start = this.startCell!;
    const end = currentCell;

    const dx = Math.sign(end.col - start.col);
    const dy = Math.sign(end.row - start.row);

    if ((dx !== 0 && dy !== 0 && Math.abs(end.col - start.col) !== Math.abs(end.row - start.row)) ||
        (dx === 0 && dy === 0)) {
      this.highlightCell(start.row, start.col, this.TEMP_HIGHLIGHT_COLOR);
      this.currentHighlight.push({ row: start.row, col: start.col });
      return;
    }

    const steps = Math.max(Math.abs(end.col - start.col), Math.abs(end.row - start.row));
    for (let i = 0; i <= steps; i++) {
      const row = start.row + i * dy;
      const col = start.col + i * dx;
      if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
        this.highlightCell(row, col, this.TEMP_HIGHLIGHT_COLOR);
        this.currentHighlight.push({ row, col });
      }
    }
  }

  private onPointerUp() {
    if (!this.isSelecting || this.gameFinished) return;
    this.isSelecting = false;

    if (this.isLetterMode) {
      if (!this.startCell) return;

      const { row, col } = this.startCell;
      const letter = this.grid[row][col];
      const index = this.targetLetters.indexOf(letter);

      if (index !== -1 && !this.foundLetters[index]) {
        // Letra correcta
        this.foundLetters[index] = true;
        this.permanentHighlights.push({ row, col });
        this.highlightCell(row, col, this.PERMANENT_HIGHLIGHT_COLOR);
        this.letterTexts[index].setStyle({ color: '#00ff00', textDecoration: 'line-through' });
        
        // Reproducir sonido de acierto
        this.successSound.play();

        if (this.foundLetters.every(found => found)) {
          this.gameFinished = true;
          this.showVictoryMessage();
        }
      } else {
        // Letra incorrecta o ya encontrada: marcar como incorrecta (solo si no es permanente)
        if (!this.permanentHighlights.some(p => p.row === row && p.col === col)) {
          this.incorrectCells[row][col] = true;
          this.highlightCell(row, col, this.INCORRECT_LETTER_COLOR);
        }
      }

      // Limpiar resaltado temporal
      this.clearTemporaryHighlight();
      this.currentHighlight = [];
      this.startCell = null;
    } else {
      // Modo palabras
      if (this.currentHighlight.length < 2) {
        this.clearTemporaryHighlight();
        this.startCell = null;
        return;
      }

      const wordLetters = this.currentHighlight.map(cell => this.grid[cell.row][cell.col]).join('');
      const wordReverse = wordLetters.split('').reverse().join('');

      let foundIndex = -1;
      for (let i = 0; i < this.wordList.length; i++) {
        if (!this.foundWords[i] && (this.wordList[i] === wordLetters || this.wordList[i] === wordReverse)) {
          foundIndex = i;
          break;
        }
      }

      if (foundIndex !== -1) {
        this.foundWords[foundIndex] = true;
        this.permanentHighlights.push(...this.currentHighlight.map(cell => ({ ...cell })));
        this.currentHighlight.forEach(cell => {
          this.highlightCell(cell.row, cell.col, this.PERMANENT_HIGHLIGHT_COLOR);
        });
        this.wordTexts[foundIndex].setStyle({ color: '#00ff00', textDecoration: 'line-through' });

        this.successSound.play();

        if (this.foundWords.every(found => found)) {
          this.gameFinished = true;
          this.showVictoryMessage();
        }
      } else {
        this.clearTemporaryHighlight();
      }

      this.currentHighlight = [];
      this.startCell = null;
    }
  }

  private highlightCell(row: number, col: number, color: number) {
    this.cells[row][col].bg.setFillStyle(color);
  }

  private clearTemporaryHighlight() {
    this.currentHighlight.forEach(cell => {
      const isPermanent = this.permanentHighlights.some(p => p.row === cell.row && p.col === cell.col);
      const isIncorrect = this.isLetterMode && this.incorrectCells[cell.row][cell.col];
      if (!isPermanent && !isIncorrect) {
        this.cells[cell.row][cell.col].bg.setFillStyle(this.BASE_CELL_COLOR);
      }
    });
    this.currentHighlight = [];
  }

  private showVictoryMessage() {
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

    // Reproducir sonido de victoria
    this.victorySound.play();

    const overlay = this.add.rectangle(400, 300, 800, 600, 0x000000, 0.7)
      .setDepth(10)
      .setInteractive();

    this.add.text(400, 200, '¡VICTORIA!', {
      fontSize: '64px',
      color: '#ffff00',
      fontStyle: 'bold'
    })
      .setOrigin(0.5)
      .setDepth(11);

    this.add.text(400, 300, `Tiempo: ${this.elapsedTime} segundos`, {
      fontSize: '32px',
      color: '#ffffff'
    })
      .setOrigin(0.5)
      .setDepth(11);

    const button = this.add.rectangle(400, 400, 200, 60, 0x4caf50)
      .setInteractive()
      .setDepth(11)
      .on('pointerdown', () => {
        this.scene.start('MenuScene');
      });

    this.add.text(400, 400, 'Aceptar', {
      fontSize: '32px',
      color: '#ffffff'
    })
      .setOrigin(0.5)
      .setDepth(12);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }
}