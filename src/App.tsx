import React from 'react';
import './App.css';

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
  const nextColorIndex = React.useRef(0)
  const getRandomColor = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple']
    if (nextColorIndex.current === colors.length) {
      nextColorIndex.current = 0
    }
    console.log(nextColorIndex.current)
    const color = colors[nextColorIndex.current]
    nextColorIndex.current += 1
    return color
  }

  const height = 7
  const width = 10
  let tickDurationMs = 400


  const [shapesInGame, setShapesInGame] = React.useState<Shape[]>([])
  const toStop = React.useRef(false)
  const isRunning = React.useRef(false)
  const allIndexes = React.useMemo(() => {
    return shapesInGame.map((shape) => shape.indexes || []).flat() ?? []
  }, [shapesInGame])

  // todo stop when can not place another shape, add random shapes

  let interval: NodeJS.Timeout | null
  const run = () => {
    console.log('run', isRunning.current)
    if (isRunning.current) {
      return
    }
    toStop.current = false

    interval = setInterval(tick, tickDurationMs)
    isRunning.current = true
  }

  const tick = ()  => {
    if (toStop.current) {
      return
    }
    
    if ([0, 1, 2].some((index) => allIndexes.includes(index))) {
      stop()
      alert('Game Over')
      return
    }

    if (shapesInGame.every((shape) => shape.isDown) || shapesInGame.length === 0) {
      const newLine = new Shape([0, 1, 2], getRandomColor())
      console.log('new line')
      shapesInGame.push(newLine)
      setShapesInGame([...shapesInGame, newLine])
    }
    else {
      for(const shape of shapesInGame) {
        if (!shape.isDown) {
          shape.moveDown(width, height, shapesInGame.map((shape) => shape.indexes).flat())
        }
      }
      setShapesInGame([...shapesInGame])
    }
    
  }
  const stop = () => {
    console.log('stop', isRunning.current)
    if (!isRunning.current) {
      return
    }
    if (interval) {
      clearInterval(interval)
    }
    interval = null
    toStop.current = true
    isRunning.current = false
  }

  const reset = () => {
    if (interval) {
      clearInterval(interval)
    }
    interval = null
    toStop.current = true
    isRunning.current = false
    setShapesInGame([])
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    for(const shape of shapesInGame) {
      if (shape.isDown){
        continue
      }
      if (event.key === 'ArrowLeft') {
        shape.moveLeft(width)
      }
      if (event.key === 'ArrowRight') {
        shape.moveRight(width)
      }
    }
    setShapesInGame([...shapesInGame])
  }
  
  return (
    <div onKeyDown={handleKeyDown}>
      <Board shapes={shapesInGame} height={height} width={width}/>
      <button onClick={run}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;
