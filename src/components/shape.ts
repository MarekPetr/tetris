abstract class Shape {
    public indexes: number[]
    public boardWidth: number
    public color: string
    public isDown: boolean = false

    constructor(indexes: number[], boardWidth: number, color: string, isDown: boolean = false) {
      this.indexes = indexes.map((index) => index + (Math.floor((boardWidth-1) / 2)))
      this.boardWidth = boardWidth
      this.color = color
      this.isDown = false
    }
  
    moveLeft(occupiedIndexes: number[]) {
      if (
        this.indexes.every((index) => index % this.boardWidth > 0) && 
        !this.indexes.some((index) => occupiedIndexes.includes(index - 1))
      )
      {
        this.indexes = this.indexes.map((index) => index - 1)
      }
    }
  
    moveRight(occupiedIndexes: number[]) {
      if (
        this.indexes.every((index) => index % this.boardWidth < this.boardWidth - 1) && 
        !this.indexes.some((index) => occupiedIndexes.includes(index + 1))
      )
      {
        this.indexes = this.indexes.map((index) => index + 1)
      }
    }
  
    moveDown(height: number, occupiedIndexes: number[]) {
      if (
        this.indexes.every((index) => index + this.boardWidth < height * this.boardWidth) && 
        !this.indexes.some((index) => occupiedIndexes.includes(index + this.boardWidth))
      )
      {
        this.indexes = this.indexes.map((index) => index + this.boardWidth)
      }
      else {
        this.isDown = true
      }
    }
    abstract flip(boardWidth: number, height: number, occupiedIndexes: number[]): void
}

class Line extends Shape {
  constructor(color: string, boardWidth: number, isDown: boolean = false) {
    super([-1, 0, 1], boardWidth, color, isDown)
  }

  flip(boardWidth: number, height: number, occupiedIndexes: number[]): void {
    if (this.indexes.some((index) => occupiedIndexes.includes(index + boardWidth))) {
      return
    }
    const mid = this.indexes[1]

    if (this.isLyingDown()) {
      this.indexes = [mid - boardWidth, mid, mid + boardWidth]
    }
    else {
      // if the shape is on the left or right edge, don't flip - moves pieces out of shape
      if (mid % boardWidth === 0 || mid % boardWidth === (boardWidth - 1)) {
        return
      }
      this.indexes = [mid - 1, mid, mid + 1]
    }    
  }
  isLyingDown() {
    return this.indexes[0] === this.indexes[1] - 1 && this.indexes[1] === this.indexes[2] - 1
  }
}

export { Shape, Line }