abstract class Shape {
    public indexes: number[]
    public color: string
    public isDown: boolean = false

    constructor(indexes: number[], color: string, isDown: boolean = false) {
      this.indexes = indexes
      this.color = color
      this.isDown = false
    }
  
    moveLeft(width: number) {
      if (this.indexes.every((index) => index % width > 0)) {
        this.indexes = this.indexes.map((index) => index - 1)
      }
    }
  
    moveRight(width: number) {
      if (this.indexes.every((index) => index % width < width - 1)) {
        this.indexes = this.indexes.map((index) => index + 1)
      }
    }
  
    moveDown(width: number, height: number, occupiedIndexes: number[]) {
      if (this.indexes.every((index) => index + width < height*width) && !this.indexes.some((index) => occupiedIndexes.includes(index + width))) {
        this.indexes = this.indexes.map((index) => index + width)
      }
      else {
        this.isDown = true
      }
    }
    abstract flip(width: number, height: number): void
}

class IShape extends Shape {
  constructor(color: string, isDown: boolean = false) {
    super([0, 1, 2], color, isDown)
  }
  flip(width: number, height: number): void {
    const mid = this.indexes[1]
    if (this.isLyingDown()) {
      this.indexes = [this.indexes[0] + width + 1, this.indexes[1], this.indexes[2] - width - 1]
    }
    else {
      this.indexes = [mid - 1, mid, mid, mid + 1]
    }
    
  }
  isLyingDown() {
    return this.indexes[0] === this.indexes[1] - 1 && this.indexes[1] === this.indexes[2] - 1
  }
}

export { Shape, IShape }