import Phaser from 'phaser';

// Pools de palabras
const EASY_WORDS_POOL = [
  'PERRO', 'GATO', 'CASA', 'SOL', 'LUNA', 'MAR', 'CIELO', 'FLOR', 'ARBOL', 'NUBE',
  'AGUA', 'FUEGO', 'TIERRA', 'VIENTO', 'ROJO', 'AZUL', 'VERDE', 'AMARILLO', 'BEBE',
  'PAPA', 'MAMA', 'HERMANO', 'HERMANA', 'ABUELO', 'ABUELA', 'PEZ'
];

const MEDIUM_WORDS_POOL = [
  'ELEFANTE', 'JIRAFA', 'COCODRILO', 'HIPOPOTAMO', 'CEBRA', 'LEON', 'TIGRE', 'RINOCERONTE',
  'GORILA', 'CHIMPANCE', 'CANGURO', 'KOALA', 'PANDA', 'OSO', 'LOBO', 'ZORRO', 'AGUILA',
  'HALCON', 'PINGUINO', 'DELFIN', 'TIBURON', 'BALLENA', 'PULPO', 'CALAMAR', 'ESTRELLA', 'PEZ'
];

export class GameScene extends Phaser.Scene {
  private gridSize!: number;
  private difficulty!: string;
  private wordList!: string[];
  private grid!: string[][];
  private cells!: { bg: Phaser.GameObjects.Rectangle; letter: Phaser.GameObjects.Text }[][];
  private foundWords!: boolean[];
  private isSelecting!: boolean;
  private startCell!: { row: number; col: number } | null;
  private currentHighlight!: { row: number; col: number }[];
  private permanentHighlights!: { row: number; col: number }[];
  private wordTexts!: Phaser.GameObjects.Text[];

  // Tiempo y victoria
  private startTime!: number;
  private elapsedTime!: number;
  private timerText!: Phaser.GameObjects.Text | null;
  private gameFinished!: boolean;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { size: number; difficulty: string }) {
    this.gridSize = data.size;
    this.difficulty = data.difficulty;

    // Seleccionar palabras aleatorias
    const pool = this.difficulty === 'easy' ? EASY_WORDS_POOL : MEDIUM_WORDS_POOL;
    const numWords = this.difficulty === 'easy' ? 6 : 10;
    // Filtrar palabras que quepan (longitud <= gridSize)
    const filteredPool = pool.filter(word => word.length <= this.gridSize);
    // Si no hay suficientes, repetir palabras (poco probable, pero por seguridad)
    while (filteredPool.length < numWords) {
      filteredPool.push(...filteredPool);
    }
    this.wordList = this.shuffleArray(filteredPool).slice(0, numWords);

    this.grid = [];
    this.cells = [];
    this.foundWords = new Array(this.wordList.length).fill(false);
    this.isSelecting = false;
    this.startCell = null;
    this.currentHighlight = [];
    this.permanentHighlights = [];
    this.wordTexts = [];

    // Inicializar tiempo
    this.startTime = 0;
    this.elapsedTime = 0;
    this.timerText = null;
    this.gameFinished = false;
  }

  create() {
    this.createGrid(); // <-- ahora usa el algoritmo mejorado

    const cellSize = 40;
    const startX = 100;
    const startY = 100;

    // Crear celdas
    for (let row = 0; row < this.gridSize; row++) {
      this.cells[row] = [];
      for (let col = 0; col < this.gridSize; col++) {
        const x = startX + col * cellSize + cellSize / 2;
        const y = startY + row * cellSize + cellSize / 2;

        const bg = this.add.rectangle(x, y, cellSize - 2, cellSize - 2, 0x333333)
          .setOrigin(0.5)
          .setStrokeStyle(1, 0x666666);

        const letter = this.add.text(x, y, this.grid[row][col], {
          fontSize: '24px',
          color: '#ffffff',
          fontFamily: 'Arial',
        }).setOrigin(0.5);

        this.cells[row][col] = { bg, letter };
      }
    }

    // Mostrar lista de palabras
    const listX = 600;
    let listY = 150;
    this.add.text(listX, listY - 30, 'Buscar:', {
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

    // Iniciar temporizador
    this.startTime = Date.now();
    this.timerText = this.add.text(600, 50, 'Tiempo: 0s', {
      fontSize: '24px',
      color: '#ffffff'
    });

    // Configurar eventos
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

  /**
   * Genera el tablero asegurando que todas las palabras estén colocadas.
   * Reintenta la generación completa hasta tener éxito.
   */
  private createGrid() {
    const maxGlobalAttempts = 500; // Intentos de generar el tablero completo
    let success = false;
    let attempts = 0;

    while (!success && attempts < maxGlobalAttempts) {
      success = this.tryCreateGrid();
      attempts++;
    }

    if (!success) {
      console.warn('No se pudo colocar todas las palabras después de varios intentos');
      // Como fallback, forzamos la colocación (poco probable que llegue aquí si los parámetros son adecuados)
      // Podrías lanzar un error o simplemente aceptar el último intento fallido
    }
  }

  /**
   * Intenta colocar todas las palabras en el tablero.
   * Retorna true si todas se colocaron, false en caso contrario.
   */
  private tryCreateGrid(): boolean {
    // Reiniciar la matriz
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = new Array(this.gridSize).fill('');
    }

    const directions: [number, number][] = [
      [1, 0],   // derecha
      [0, 1],   // abajo
      [1, 1],   // diagonal abajo-derecha
      [-1, 1],  // diagonal abajo-izquierda
    ];

    // Mezclamos las palabras para intentar en diferente orden cada vez
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
        if (endX < 0 || endX >= this.gridSize || endY < 0 || endY >= this.gridSize) {
          continue;
        }

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

        // Colocar palabra
        for (let i = 0; i < word.length; i++) {
          const x = startX + i * dx;
          const y = startY + i * dy;
          this.grid[y][x] = word[i];
        }
        wordPlaced = true;
        placed[wIndex] = true;
      }
      // Si no se colocó, continuamos con la siguiente (luego veremos si todas se colocaron)
    }

    // Verificar si todas las palabras se colocaron
    const allPlaced = placed.every(v => v);
    if (allPlaced) {
      // Rellenar espacios vacíos con letras aleatorias
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
    const cellSize = 40;
    const startX = 100;
    const startY = 100;

    const col = Math.floor((pointer.x - startX) / cellSize);
    const row = Math.floor((pointer.y - startY) / cellSize);

    if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
      return { row, col };
    }
    return null;
  }

  private onPointerDown(pointer: Phaser.Input.Pointer) {
    if (this.gameFinished) return;
    const cell = this.getCellFromPointer(pointer);
    if (cell) {
      this.isSelecting = true;
      this.startCell = cell;
      this.highlightCell(cell.row, cell.col, 0xffff00);
      this.currentHighlight.push({ row: cell.row, col: cell.col });
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isSelecting || this.gameFinished) return;

    const currentCell = this.getCellFromPointer(pointer);
    if (!currentCell) return;

    this.clearTemporaryHighlight();

    const start = this.startCell!;
    const end = currentCell;

    const dx = Math.sign(end.col - start.col);
    const dy = Math.sign(end.row - start.row);

    // Verificar que sea línea recta o diagonal
    if ((dx !== 0 && dy !== 0 && Math.abs(end.col - start.col) !== Math.abs(end.row - start.row)) ||
        (dx === 0 && dy === 0)) {
      this.highlightCell(start.row, start.col, 0xffff00);
      this.currentHighlight.push({ row: start.row, col: start.col });
      return;
    }

    const steps = Math.max(Math.abs(end.col - start.col), Math.abs(end.row - start.row));
    for (let i = 0; i <= steps; i++) {
      const row = start.row + i * dy;
      const col = start.col + i * dx;
      if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize) {
        this.highlightCell(row, col, 0xffff00);
        this.currentHighlight.push({ row, col });
      }
    }
  }

  private onPointerUp() {
    if (!this.isSelecting || this.gameFinished) return;
    this.isSelecting = false;

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
        this.highlightCell(cell.row, cell.col, 0x00ff00);
      });
      this.wordTexts[foundIndex].setStyle({ color: '#00ff00', textDecoration: 'line-through' });

      // Comprobar si todas las palabras fueron encontradas
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

  private highlightCell(row: number, col: number, color: number) {
    this.cells[row][col].bg.setFillStyle(color);
  }

  private clearTemporaryHighlight() {
    this.currentHighlight.forEach(cell => {
      const isPermanent = this.permanentHighlights.some(p => p.row === cell.row && p.col === cell.col);
      if (!isPermanent) {
        this.cells[cell.row][cell.col].bg.setFillStyle(0x333333);
      }
    });
    this.currentHighlight = [];
  }

  private showVictoryMessage() {
    this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);

    // Fondo semitransparente que bloquea interacción
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