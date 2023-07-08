abstract class Shape {
    public indexes: number[]
    public boardWidth: number
    public color: string
    public isDown: boolean = false

    constructor(indexes: number[], boardWidth: number, color: string, isDown: boolean = false) {
      this.indexes = indexes.map((index) => index + (Math.floor((boardWidth-1) / 2)) - 1)
      this.boardWidth = boardWidth
      this.color = color
      this.isDown = false
      this.flipRandomly()
    }
  
    moveLeft(occupiedIndexes: number[]): boolean {
      if (
        this.indexes.every((index) => index % this.boardWidth > 0) && 
        !this.indexes.some((index) => occupiedIndexes.includes(index - 1))
      )
      {
        this.indexes = this.indexes.map((index) => index - 1)
        return true
      }
      return false
    }
  
    moveRight(occupiedIndexes: number[]): boolean {
      if (
        this.indexes.every((index) => index % this.boardWidth < this.boardWidth - 1) && 
        !this.indexes.some((index) => occupiedIndexes.includes(index + 1))
      )
      {
        this.indexes = this.indexes.map((index) => index + 1)
        return true
      }
      return false
    }
  
    moveDown(height: number, occupiedIndexes: number[]): boolean {
      if (
        this.indexes.every((index) => index + this.boardWidth < height * this.boardWidth) && 
        !this.indexes.some((index) => occupiedIndexes.includes(index + this.boardWidth))
      )
      {
        this.indexes = this.indexes.map((index) => index + this.boardWidth)
        return true
      }
      this.isDown = true
      return false
    }
    removeIndex(index: number): void {
      this.indexes = this.indexes.filter((i) => i !== index)
      for(let indexOnTop = index-this.boardWidth; indexOnTop >= 0; indexOnTop -= this.boardWidth) {
        this.indexes = this.indexes.map((index) => index === indexOnTop ? index + this.boardWidth : index)
      }
    }
    abstract flip(boardWidth: number, height: number, occupiedIndexes: number[]): void

    flipRandomly(): void {
      const randomNumberOfFlips = Math.floor(Math.random() * 3)
      for(let i = 0; i < randomNumberOfFlips; i++) {
        this.flip(this.boardWidth, 0, [])
      }
    }
}

class Line extends Shape {
  constructor(color: string, boardWidth: number, isDown: boolean = false) {
    super([0, 1, 2], boardWidth, color, isDown)
  }

  flip(boardWidth: number, height: number, occupiedIndexes: number[]) {
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
        return false
      }
      this.indexes = [mid - 1, mid, mid + 1]
    }
    return
  }
  private isLyingDown(): boolean {
    return this.indexes[0] === this.indexes[1] - 1 && this.indexes[1] === this.indexes[2] - 1
  }
}

class Cube extends Shape {
  constructor(color: string, boardWidth: number, isDown: boolean = false) {
    super([0, 1, boardWidth, boardWidth+1], boardWidth, color, isDown)
  }

  flip(boardWidth: number, height: number, occupiedIndexes: number[]) {
    return false
  }
}

export { Shape, Line, Cube}