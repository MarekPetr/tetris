import React from 'react';
import './App.css';
import Shape from './components/shape'
import Board from './components/Board'


const App = () => {
  const nextColorIndex = React.useRef(0)
  const getRandomColor = () => {
    const colors = ['red', 'blue', 'green', 'yellow', 'orange', 'purple']
    if (nextColorIndex.current === colors.length) {
      nextColorIndex.current = 0
    }
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
  const getAllIndexes = () => {
    let indexes: number[] = []
    for (const shape of shapesInGame) {
      indexes = indexes.concat(shape.indexes)
    }
    return indexes
  }

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

    if (shapesInGame.every((shape) => shape.isDown) || shapesInGame.length === 0) {
      const newLine = new Shape([0, 1, 2], getRandomColor())
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
      if (getAllIndexes().includes(0)) {
        console.log('game over')
        stop()
        alert('Game Over')
        return
      }
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
    <div>
      <div onKeyDown={handleKeyDown}>
        <Board height={height} width={width} shapes={shapesInGame}/>
        <button onClick={run}>Start</button>
        <button onClick={stop}>Stop</button>
        <button onClick={reset}>Reset</button>
      </div>      
    </div>
  );
}

export default App;
