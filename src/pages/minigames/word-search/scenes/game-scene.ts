import Phaser from 'phaser';

// Interfaz para los datos recibidos del menú
interface GameSceneData {
  size: number;
  difficulty: 'easy' | 'medium';
}

// Interfaz para una celda del tablero (fondo y texto)
interface Cell {
  bg: Phaser.GameObjects.Rectangle;
  letter: Phaser.GameObjects.Text;
}

// Interfaz para una coordenada de celda
interface CellCoord {
  row: number;
  col: number;
}

export class GameScene extends Phaser.Scene {
  private gridSize!: number;
  private difficulty!: 'easy' | 'medium';
  private wordList!: string[];
  private grid: string[][] = [];
  private cells: Cell[][] = [];
  private foundWords: boolean[] = [];
  private wordTexts: Phaser.GameObjects.Text[] = [];

  // Selección
  private isSelecting: boolean = false;
  private startCell: CellCoord | null = null;
  private currentHighlight: CellCoord[] = [];
  private permanentHighlights: CellCoord[] = [];

  // Tiempo
  private startTime: number = 0;
  private timerText!: Phaser.GameObjects.Text;
  private timerEvent?: Phaser.Time.TimerEvent;

  // Mensaje de victoria
  private victoryContainer?: Phaser.GameObjects.Container;

  constructor() {
    super({ key: 'GameScene' });
  }

  init(data: GameSceneData) {
    this.gridSize = data.size;
    this.difficulty = data.difficulty;

    // Palabras según dificultad
    this.wordList = this.difficulty === 'easy'
      ? ['PERRO', 'GATO', 'CASA', 'SOL']
      : ['ELEFANTE', 'JIRAFA', 'COCODRILO', 'HIPOPOTAMO', 'CEBRA', 'LEON'];

    this.foundWords = new Array(this.wordList.length).fill(false);
    this.permanentHighlights = [];
    this.currentHighlight = [];
  }

  create() {
    this.createGrid();
    this.drawBoard();
    this.createWordList();

    // Iniciar temporizador
    this.startTime = this.time.now;
    this.timerText = this.add.text(10, 10, 'Tiempo: 0s', {
      fontSize: '20px',
      color: '#ffffff',
    });

    // Actualizar cada segundo
    this.timerEvent = this.time.addEvent({
      delay: 1000,
      callback: this.updateTimer,
      callbackScope: this,
      loop: true,
    });

    // Configurar entrada
    this.input.on('pointerdown', this.onPointerDown, this);
    this.input.on('pointermove', this.onPointerMove, this);
    this.input.on('pointerup', this.onPointerUp, this);
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

    // Colocar cada palabra
    for (const word of this.wordList) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 200;

      while (!placed && attempts < maxAttempts) {
        attempts++;
        const dir = directions[Math.floor(Math.random() * directions.length)];
        const [dx, dy] = dir;

        const startX = Math.floor(Math.random() * this.gridSize);
        const startY = Math.floor(Math.random() * this.gridSize);

        // Verificar que la palabra cabe
        const endX = startX + (word.length - 1) * dx;
        const endY = startY + (word.length - 1) * dy;
        if (endX < 0 || endX >= this.gridSize || endY < 0 || endY >= this.gridSize) {
          continue;
        }

        // Verificar conflictos
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

        // Colocar la palabra
        for (let i = 0; i < word.length; i++) {
          const x = startX + i * dx;
          const y = startY + i * dy;
          this.grid[y][x] = word[i];
        }
        placed = true;
      }
      // Si no se pudo colocar, se omite (en un juego real se reintentaría)
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
  }

  private createWordList() {
    const listX = 600;
    let listY = 150;
    this.add.text(listX, listY - 30, 'Palabras a buscar:', {
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

  private updateTimer() {
    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);
    this.timerText.setText(`Tiempo: ${elapsed}s`);
  }

  private getCellFromPointer(pointer: Phaser.Input.Pointer): CellCoord | null {
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

    // Verificar que sea línea recta o diagonal
    const isStraight = (dx === 0 || dy === 0) || (Math.abs(end.col - start.col) === Math.abs(end.row - start.row));
    if (!isStraight) {
      // Solo resaltar la inicial
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
      // Palabra encontrada
      this.foundWords[foundIndex] = true;
      // Marcar como permanente (verde)
      this.permanentHighlights.push(...this.currentHighlight.map(cell => ({ ...cell })));
      this.currentHighlight.forEach(cell => {
        this.highlightCell(cell.row, cell.col, 0x00ff00);
      });
      // Tachar palabra en lista
      this.wordTexts[foundIndex].setStyle({ color: '#00ff00', textDecoration: 'line-through' });

      // Comprobar si todas las palabras han sido encontradas
      if (this.foundWords.every(found => found)) {
        this.showVictory();
      }
    } else {
      // No es correcta, limpiar resaltado temporal
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

  private showVictory() {
    // Detener el temporizador
    if (this.timerEvent) {
      this.timerEvent.remove();
    }

    const elapsed = Math.floor((this.time.now - this.startTime) / 1000);

    // Crear un contenedor para el mensaje de victoria
    this.victoryContainer = this.add.container(400, 300);

    // Fondo semitransparente
    const bg = this.add.rectangle(0, 0, 400, 200, 0x000000, 0.8)
      .setOrigin(0.5);
    this.victoryContainer.add(bg);

    // Texto de victoria
    const victoryText = this.add.text(0, -40, '¡VICTORIA!', {
      fontSize: '36px',
      color: '#ffff00',
      fontStyle: 'bold',
    }).setOrigin(0.5);
    this.victoryContainer.add(victoryText);

    // Tiempo
    const timeText = this.add.text(0, 10, `Tiempo: ${elapsed} segundos`, {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.victoryContainer.add(timeText);

    // Botón Aceptar
    const buttonBg = this.add.rectangle(0, 70, 150, 50, 0x4caf50)
      .setOrigin(0.5)
      .setInteractive()
      .on('pointerdown', () => {
        this.scene.start('MenuScene');
      });
    this.victoryContainer.add(buttonBg);

    const buttonText = this.add.text(0, 70, 'Aceptar', {
      fontSize: '24px',
      color: '#ffffff',
    }).setOrigin(0.5);
    this.victoryContainer.add(buttonText);

    // Deshabilitar interacción con el tablero (opcional)
    this.input.off('pointerdown', this.onPointerDown, this);
    this.input.off('pointermove', this.onPointerMove, this);
    this.input.off('pointerup', this.onPointerUp, this);
  }
}