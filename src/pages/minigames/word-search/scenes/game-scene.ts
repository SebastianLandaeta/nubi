// scenes/GameScene.ts
import Phaser from 'phaser';

interface CellRef {
  bg: Phaser.GameObjects.Rectangle;
  letter: Phaser.GameObjects.Text;
}

interface GridCell {
  row: number;
  col: number;
}

export class GameScene extends Phaser.Scene {
  private gridSize!: number;
  private difficulty!: string;
  private wordList!: string[];
  private grid: string[][] = [];
  private cells: CellRef[][] = [];
  private foundWords: boolean[] = [];
  private isSelecting: boolean = false;
  private startCell: GridCell | null = null;
  private currentHighlight: GridCell[] = [];
  private permanentHighlights: GridCell[] = [];
  private wordTexts: Phaser.GameObjects.Text[] = [];

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: { size: number; difficulty: string }) {
    this.gridSize = data.size;
    this.difficulty = data.difficulty;

    this.wordList = this.difficulty === 'easy'
      ? ['PERRO', 'GATO', 'CASA', 'SOL']
      : ['ELEFANTE', 'JIRAFA', 'COCODRILO', 'HIPOPOTAMO', 'CEBRA', 'LEON'];

    this.grid = [];
    this.cells = [];
    this.foundWords = new Array(this.wordList.length).fill(false);
    this.permanentHighlights = [];
    this.currentHighlight = [];
    this.startCell = null;
    this.isSelecting = false;
  }

  create() {
    this.createGrid();
    this.drawBoard();
    this.setupInput();
  }

  private createGrid() {
    // Inicializar matriz vacía
    for (let i = 0; i < this.gridSize; i++) {
      this.grid[i] = new Array(this.gridSize).fill('');
    }

    const directions: [number, number][] = [
      [1, 0],   // derecha
      [0, 1],   // abajo
      [1, 1],   // diagonal abajo-derecha
      [-1, 1],  // diagonal abajo-izquierda
    ];

    for (let word of this.wordList) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 200;

      while (!placed && attempts < maxAttempts) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const [dx, dy] = dir;

        const startX = Math.floor(Math.random() * this.gridSize);
        const startY = Math.floor(Math.random() * this.gridSize);

        let endX = startX + (word.length - 1) * dx;
        let endY = startY + (word.length - 1) * dy;
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

        for (let i = 0; i < word.length; i++) {
          const x = startX + i * dx;
          const y = startY + i * dy;
          this.grid[y][x] = word[i];
        }
        placed = true;
      }
    }

    // Rellenar espacios vacíos con letras aleatorias
    for (let y = 0; y < this.gridSize; y++) {
      for (let x = 0; x < this.gridSize; x++) {
        if (this.grid[y][x] === '') {
          this.grid[y][x] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        }
      }
    }
  }

  private drawBoard() {
    const cellSize = 40;
    const startX = 100;
    const startY = 100;

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

    // Lista de palabras
    const listX = 600;
    let listY = 150;
    this.add.text(listX, listY - 30, 'Palabras a buscar:', {
      fontSize: '24px',
      color: '#ffff00',
    });

    this.wordTexts = [];
    this.wordList.forEach((word, index) => {
      const text = this.add.text(listX, listY + index * 40, word, {
        fontSize: '28px',
        color: '#ffffff',
        fontStyle: 'bold',
      });
      this.wordTexts.push(text);
    });
  }

  private setupInput() {
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
  }

  private getCellFromPointer(pointer: Phaser.Input.Pointer): GridCell | null {
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
    const cell = this.getCellFromPointer(pointer);
    if (cell) {
      this.isSelecting = true;
      this.startCell = cell;
      this.highlightCell(cell.row, cell.col, 0xffff00);
      this.currentHighlight.push({ row: cell.row, col: cell.col });
    }
  }

  private onPointerMove(pointer: Phaser.Input.Pointer) {
    if (!this.isSelecting) return;

    const currentCell = this.getCellFromPointer(pointer);
    if (!currentCell) return;

    this.clearTemporaryHighlight();

    const start = this.startCell!;
    const end = currentCell;

    const dx = Math.sign(end.col - start.col);
    const dy = Math.sign(end.row - start.row);

    // Verificar que es línea recta o diagonal
    if ((dx !== 0 && dy !== 0 && Math.abs(end.col - start.col) !== Math.abs(end.row - start.row)) ||
        (dx === 0 && dy === 0)) {
      // Solo la celda inicial
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
    if (!this.isSelecting) return;
    this.isSelecting = false;

    if (this.currentHighlight.length < 2) {
      this.clearTemporaryHighlight();
      this.startCell = null;
      return;
    }

    // Obtener palabra seleccionada
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
      // Palabra correcta
      this.foundWords[foundIndex] = true;
      this.permanentHighlights.push(...this.currentHighlight.map(cell => ({ ...cell })));
      this.currentHighlight.forEach(cell => {
        this.highlightCell(cell.row, cell.col, 0x00ff00);
      });
      // Tachar palabra en lista
      this.wordTexts[foundIndex].setStyle({ color: '#00ff00', textDecoration: 'line-through' });
    } else {
      // Incorrecta
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
}