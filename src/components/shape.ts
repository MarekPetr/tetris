interface BoardSize {
  width: number
  height: number
}

abstract class Shape {
    public indexes: number[]
    public boardSize: BoardSize
    public color: string
    public isDown: boolean = false

    constructor(indexes: number[], boardSize: BoardSize, color: string, isDown: boolean = false) {
      this.indexes = indexes.map((index) => index + (Math.floor((boardSize.width-1) / 2)) - 1)
      this.boardSize = boardSize
      this.color = color
      this.isDown = false
    }
  
    moveLeft(occupiedIndexes: number[]): boolean {
      if (
        this.indexes.every((index) => index % this.boardSize.width > 0) && 
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
        this.indexes.every((index) => index % this.boardSize.width < this.boardSize.width - 1) && 
        !this.indexes.some((index) => occupiedIndexes.includes(index + 1))
      )
      {
        this.indexes = this.indexes.map((index) => index + 1)
        return true
      }
      return false
    }
  
    moveDown(height: number, occupiedIndexes: number[]): boolean {
      const newIndexes = this.indexes.map((index) => index + this.boardSize.width)
      if (
        newIndexes.some((index) => occupiedIndexes.includes(index)) ||
        newIndexes.some((index) => index >= height * this.boardSize.width)
      ) {
        this.isDown = true
        return false
      }
      this.indexes = newIndexes
      
      return true
    }

    removeIndex(index: number): void {
      this.indexes = this.indexes.filter((i) => i !== index)
      for(let indexOnTop = index-this.boardSize.width; indexOnTop >= 0; indexOnTop -= this.boardSize.width) {
        this.indexes = this.indexes.map((index) => index === indexOnTop ? index + this.boardSize.width : index)
      }
    }
    abstract flip(occupiedIndexes: number[]): void

    flipRandomly(getOccupiedIndexes: () => number[]): void {
      const randomNumberOfFlips = Math.floor(Math.random() * 3)
      for(let i = 0; i < randomNumberOfFlips; i++) {
        this.flip(getOccupiedIndexes())
      }
    }

    indexesOutOfBounds(indexes: number[], occupiedIndexes: number[], height: number) {
      return (
        indexes.some((index) => occupiedIndexes.includes(index)) ||
        indexes.some((index) => index > height * this.boardSize.width)
      )      
    }
}

class Line extends Shape {
  constructor(color: string, boardSize: BoardSize, isDown: boolean = false) {
    super([0, 1, 2], boardSize, color, isDown)
  }

  flip(occupiedIndexes: number[]) {
    let newIndexes: number[] = []
    const mid = this.indexes[1]

    if (this.isLyingDown()) {
      newIndexes = [mid - this.boardSize.width, mid, mid + this.boardSize.width]
    }
    else {
      // if the shape is on the left or right edge, don't flip - moves pieces out of shape
      if (mid % this.boardSize.width === 0 || mid % this.boardSize.width === (this.boardSize.width - 1)) {
        return false
      }
      newIndexes = [mid - 1, mid, mid + 1]
    }
    if (this.indexesOutOfBounds(newIndexes, occupiedIndexes, this.boardSize.height)) {
      return
    }
    this.indexes = newIndexes
  }
  private isLyingDown(): boolean {
    return this.indexes[0] === this.indexes[1] - 1 && this.indexes[1] === this.indexes[2] - 1
  }
}

class Cube extends Shape {
  constructor(color: string, boardSize: BoardSize, isDown: boolean = false) {
    super([0, 1, boardSize.width, boardSize.width+1], boardSize, color, isDown)
  }

  flip(occupiedIndexes: number[]) {
    return false
  }
}


type TShapeOrientation = "up" | "right" | "down" | "left"

class TShape extends Shape {
  private orientation: TShapeOrientation = "up"

  constructor(color: string, boardSize: BoardSize, isDown: boolean = false) {
    super([1, boardSize.width, boardSize.width+1, boardSize.width+2], boardSize, color, isDown)
    this.orientation = "up"
  }
  
  flip(occupiedIndexes: number[]) {
    // up -> right -> down -> left -> up
    let mid = this.indexes[2]
    let newIndexes: number[] = []
    let newOrientation: TShapeOrientation
    switch(this.orientation) {
      case "up":
        newOrientation = "right"
        mid = this.indexes[2]
        newIndexes = [mid - this.boardSize.width, mid, mid + 1, mid + this.boardSize.width]
        break
      case "right":
        newOrientation = "down"
        mid = this.indexes[1]
        newIndexes = [mid - 1, mid, mid + 1, mid + this.boardSize.width]
        break
      case "down":
        newOrientation = "left"
        mid = this.indexes[1]
        newIndexes = [mid - this.boardSize.width, mid - 1, mid, mid + this.boardSize.width]
        break
      case "left":
        newOrientation = "up"
        mid = this.indexes[2]
        newIndexes = [mid - this.boardSize.width, mid - 1, mid, mid + 1]
        break
      default:
        console.error("Undefined TShape orientation! Resorting to up orientation.")
        newOrientation = "right"
        mid = this.indexes[2]
        newIndexes = [mid - this.boardSize.width, mid, mid + 1, mid + this.boardSize.width]
        break
    }
    // move right if we are on the left edge and would break the shape
    if (this.orientation !== "down" && Math.floor(mid / this.boardSize.width) !== Math.floor((mid - 1) / this.boardSize.width)) {
      newIndexes = newIndexes.map((index) => index + 1)
    }
    // move left if we are on the right edge and would break the shape
    if (this.orientation !== "up" && Math.floor(mid / this.boardSize.width) !== Math.floor((mid + 1) / this.boardSize.width)) {
      newIndexes = newIndexes.map((index) => index - 1)
    }
    if (this.indexesOutOfBounds(newIndexes, occupiedIndexes, this.boardSize.height)) {
      return
    }
    this.indexes = newIndexes
    this.orientation = newOrientation
  }
}

export { Shape, Line, Cube, TShape }
export type { BoardSize }