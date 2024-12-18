interface BoardSize {
  width: number
  height: number
}

type TwoAxesOrientation = "horizontal" | "vertical"
type FourAxesOrientation = "up" | "down" | "left" | "right"

abstract class Shape {
    public indexes: number[]
    public boardSize: BoardSize
    public color: string
    public isDown: boolean = false

    constructor(indexes: number[], boardSize: BoardSize, color: string) {
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

    flipRandomly(occupiedIndexes: number[]): void {
      const randomNumberOfFlips = Math.floor(Math.random() * 3)
      for(let i = 0; i < randomNumberOfFlips; i++) {
        this.flip(occupiedIndexes)
      }
    }

    protected indexesOutOfBounds(indexes: number[], occupiedIndexes: number[]) {
      return (
        indexes.some((index) => occupiedIndexes.includes(index)) ||
        indexes.some((index) => index > this.boardSize.height * this.boardSize.width)
      )      
    }

    protected areOnTheSameLine(first: number, second: number) {
      const line = Math.floor(first / this.boardSize.width)
      return line === Math.floor(second / this.boardSize.width)
    }
}

class Line extends Shape {
  private orientation: TwoAxesOrientation = "horizontal"

  constructor(color: string, boardSize: BoardSize) {
    super([0, 1, 2, 3], boardSize, color)
  }

  flip(occupiedIndexes: number[]) {
    let newIndexes: number[] = []
    let newOrientation: TwoAxesOrientation
    const mid = this.indexes[2]

    switch(this.orientation) {
      case("horizontal"):
        newOrientation = "vertical"
        newIndexes = [mid - 2 * this.boardSize.width, mid - this.boardSize.width, mid, mid + this.boardSize.width]
        break
      case("vertical"):
        newOrientation = "horizontal"
        newIndexes = [mid - 2, mid - 1, mid, mid + 1]
        break
    }
    if (newOrientation === 'horizontal') {
      if (!this.areOnTheSameLine(mid, mid-1)) {
        newIndexes = newIndexes.map((index) => index + 2)
      }
      else if (!this.areOnTheSameLine(mid, mid-2)) {
        newIndexes = newIndexes.map((index) => index + 1)
      }  
      else if (!this.areOnTheSameLine(mid, mid+1)) {
        newIndexes = newIndexes.map((index) => index - 1)
      }
    }

    if (this.indexesOutOfBounds(newIndexes, occupiedIndexes)) {
      return
    }
    this.indexes = newIndexes
    this.orientation = newOrientation
  }
}

class Cube extends Shape {
  constructor(color: string, boardSize: BoardSize) {
    super([0, 1, boardSize.width, boardSize.width+1], boardSize, color)
  }

  flip(occupiedIndexes: number[]) {
    return false
  }
}

class TShape extends Shape {
  private orientation: FourAxesOrientation = "up"

  constructor(color: string, boardSize: BoardSize) {
    super([1, boardSize.width, boardSize.width+1, boardSize.width+2], boardSize, color)
    this.orientation = "up"
  }
  
  flip(occupiedIndexes: number[]) {
    // up -> right -> down -> left -> up
    let mid: number
    let newIndexes: number[] = []
    let newOrientation: FourAxesOrientation
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
    if (this.orientation !== "down" && !this.areOnTheSameLine(mid-1, mid)) {
      newIndexes = newIndexes.map((index) => index + 1)
    }
    // move left if we are on the right edge and would break the shape
    if (this.orientation !== "up" && !this.areOnTheSameLine(mid, mid+1)) {
      newIndexes = newIndexes.map((index) => index - 1)
    }
    if (this.indexesOutOfBounds(newIndexes, occupiedIndexes)) {
      return
    }
    this.indexes = newIndexes
    this.orientation = newOrientation
  }
}

class ZShape extends Shape {
  private orientation: TwoAxesOrientation = "horizontal"

  constructor(color: string, boardSize: BoardSize) {
    super([0, 1, boardSize.width + 1, boardSize.width + 2], boardSize, color)
  }

  flip(occupiedIndexes: number[]) {
    const mid: number = this.indexes[1]
    let newIndexes: number[] = []
    let newOrientation: TwoAxesOrientation

    switch(this.orientation) {
      case("horizontal"):
        newOrientation = "vertical"
        newIndexes = [mid - this.boardSize.width + 1, mid, mid + 1, mid + this.boardSize.width]
        break
      case("vertical"):
        newOrientation = "horizontal"
        newIndexes = [mid - 1, mid, mid + this.boardSize.width, mid + this.boardSize.width + 1]
        break
    }
    // move right when the new rotation is horizontal and the wall prevents to flip the shape
    if (newOrientation === "horizontal" && !this.areOnTheSameLine(mid-1, mid)) {
      newIndexes = newIndexes.map((index) => index + 1)
    }
    if (this.indexesOutOfBounds(newIndexes, occupiedIndexes)) {
      return
    }
    
    this.indexes = newIndexes
    this.orientation = newOrientation
  }
}

class SShape extends Shape {
  private orientation: TwoAxesOrientation = "horizontal"

  constructor(color: string, boardSize: BoardSize) {
    super([1, 2, boardSize.width, boardSize.width + 1], boardSize, color)
  }

  flip(occupiedIndexes: number[]) {
    let newIndexes: number[] = []
    let newOrientation: TwoAxesOrientation
    let mid: number

    switch(this.orientation) {
      case("horizontal"):
        mid = this.indexes[0]
        newOrientation = "vertical"        
        newIndexes = [mid - this.boardSize.width, mid, mid + 1, mid + this.boardSize.width + 1]
        break
      case("vertical"):
        mid = this.indexes[1]
        newOrientation = "horizontal"        
        newIndexes = [mid, mid + 1, mid, mid + this.boardSize.width - 1, mid + this.boardSize.width]
        break
    }

    // move right when the new rotation is horizontal and the wall prevents to flip the shape
    if (newOrientation === "horizontal" && !this.areOnTheSameLine(mid-1, mid)) {
      newIndexes = newIndexes.map((index) => index + 1)
    }
    if (this.indexesOutOfBounds(newIndexes, occupiedIndexes)) {
      return
    }
    
    this.indexes = newIndexes
    this.orientation = newOrientation
  }
}

class LShape extends Shape {
  private orientation: FourAxesOrientation = "down"

  constructor(color: string, boardSize: BoardSize) {
    super([0, 1, 2, boardSize.width], boardSize, color)
  }
  flip(occupiedIndexes: number[]) {
    const refIndex = this.indexes[1]
    let newIndexes: number[]
    let newOrientation: FourAxesOrientation

    switch(this.orientation){
      case("down"):
        newIndexes = [refIndex-this.boardSize.width-1, refIndex, refIndex-this.boardSize.width, refIndex+this.boardSize.width]
        newOrientation = "left"
        break
      case("left"):
        newIndexes = [refIndex-this.boardSize.width+1, refIndex, refIndex-1,  refIndex+1]
        newOrientation = "up"
        break
      case("up"):
        newIndexes = [refIndex-this.boardSize.width, refIndex, refIndex+this.boardSize.width, refIndex+this.boardSize.width+1]
        newOrientation = "right"
        break
      case("right"):
        newIndexes = [refIndex-1, refIndex, refIndex+1, refIndex+this.boardSize.width-1]
        newOrientation = "down"
        break
    }

    if(newOrientation === "up" && !this.areOnTheSameLine(refIndex, refIndex+2)) {
      newIndexes = newIndexes.map((index) => index - 1)
    }
    if(newOrientation === "down" && !this.areOnTheSameLine(refIndex, refIndex-1)) {
      newIndexes = newIndexes.map((index) => index + 1)
    }

    if (this.indexesOutOfBounds(newIndexes, occupiedIndexes)) {
      return
    }

    this.indexes = newIndexes
    this.orientation = newOrientation
  }
}

class JShape extends Shape {
  private orientation: FourAxesOrientation = "down"

  constructor(color: string, boardSize: BoardSize) {
    super([0, 1, 2, boardSize.width + 2], boardSize, color)
  }
  flip(occupiedIndexes: number[]) {
    const refIndex = this.indexes[1]
    let newIndexes: number[]
    let newOrientation: FourAxesOrientation

    switch(this.orientation){
      case("down"):
        newIndexes = [refIndex-this.boardSize.width, refIndex, refIndex+this.boardSize.width, refIndex+this.boardSize.width-1]
        newOrientation = "left"
        break
      case("left"):
        newIndexes = [refIndex-this.boardSize.width-1, refIndex-1, refIndex,  refIndex+1]
        newOrientation = "up"
        break
      case("up"):
        newIndexes = [refIndex+1, refIndex+1-this.boardSize.width, refIndex+2-this.boardSize.width, refIndex+1+this.boardSize.width]
        newOrientation = "right"
        break
      case("right"):
        newIndexes = [refIndex+this.boardSize.width-1, refIndex+this.boardSize.width, refIndex+this.boardSize.width+1, refIndex+2*this.boardSize.width+1]
        newOrientation = "down"
        break
    }

    if(newOrientation === "up" && !this.areOnTheSameLine(refIndex, refIndex+1)) {
      newIndexes = newIndexes.map((index) => index - 1)
    }
    if(newOrientation === "down" && !this.areOnTheSameLine(refIndex, refIndex-1)) {
      newIndexes = newIndexes.map((index) => index + 1)
    }

    if (this.indexesOutOfBounds(newIndexes, occupiedIndexes)) {
      return
    }

    this.indexes = newIndexes
    this.orientation = newOrientation
  }
}

export { Shape, Line, Cube, TShape, ZShape, SShape, LShape, JShape}
export type { BoardSize }