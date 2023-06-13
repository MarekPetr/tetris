import React from 'react';
import './App.css';

class Shape {
  public indexes: number[]
  public color: string

  constructor(indexes: number[], color: string) {
    this.indexes = indexes
    this.color = color
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

  moveDown(width: number, height: number) {
    if (this.indexes.every((index) => index + width < height*width)) {
      this.indexes = this.indexes.map((index) => index + width)
    }
  }
  
}

const Cell = ({index, filled, color}: {index: number, filled: boolean, color: string}) => {
  return (
    <div className='cell' style={{backgroundColor: filled ? color : '#ADD8E6'}}>{index}</div>
  )
}

const Row = ({size, index, shapes}: {size: number, index: number, shapes: Shape[]}) => {
    let row = []
    for (let i = 0; i < size; i ++) {
      const position = index + i
      const shape = shapes.find((shape) => shape.indexes.includes(position))
      let element
      if (shape) {
        element = <Cell index={position} filled={true} color={shape.color} key={position}/>
      } else {
        element = <Cell index={position} filled={false} color='#ADD8E6' key={position}/>
      }
      row.push(element)
    }
    return (
      <div className='row'>{row}</div>
    )
}

const Board = ({height, width, shapes}: {height: number, width: number, shapes: Shape[]}) => {
    let rows = []
    for (let i = 0; i < height*width; i+=width) {
      rows.push(
        <Row size={width} index={i} shapes={shapes} key={i}/>
      )
    }
  return (
    <div className='board'>
        {rows}
    </div>
  )
}

const App = () => {
  const height = 10
  const width = 10
  const tickDurationMs = 400
  
  const line = new Shape([0, 1, 2], 'red')
  const lShape = new Shape([0, 1, 2, 12], 'red')
  const shapes = [line, lShape]

  const [shapesInGame, setShapesInGame] = React.useState<Shape[]>([line])
  const stopped = React.useRef(false)

  // todo stop when can not place another shape, add random shapes

  let interval: NodeJS.Timeout | null
  const run = () => {
    stopped.current = false
    interval = setInterval(tick, tickDurationMs)
  }

  const tick = ()  => {
    console.log('tick')
    if (stopped.current) {
      stop()
    }
    for(const shape of shapesInGame) {
      shape.moveDown(width, height)
    }
    setShapesInGame([...shapesInGame])
  }
  const stop = () => {
    if (interval) {
      clearInterval(interval)
    }
    interval = null
    stopped.current = true
  }

  const reset = () => {
    if (interval) {
      clearInterval(interval)
    }
    interval = null
    stopped.current = true
    setShapesInGame([line])
  }
  
  return (
    <div>
      <Board shapes={shapesInGame} height={height} width={width}/>
      <button onClick={run}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;
