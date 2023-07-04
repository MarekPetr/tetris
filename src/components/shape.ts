class Shape {
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
  }
  
  export default Shape