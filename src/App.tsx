import React from 'react';
import './App.css';
import { Shape, Line } from './components/shape'
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

  const height = 15
  const width = 9
  let tickDurationMs = 200

  const [shapesInGame, setShapesInGame] = React.useState<Shape[]>([])
  const getShapesDown = () => shapesInGame.filter((shape) => shape.isDown)
  const getOccupiedIndexes = () => getShapesDown().map((shape) => shape.indexes).flat()
  const toStop = React.useRef(false)
  const isRunning = React.useRef(false)

  const getAllIndexes = () => {
    let indexes: number[] = []
    for (const shape of shapesInGame) {
      indexes = indexes.concat(shape.indexes)
    }
    return indexes
  }

  let interval: NodeJS.Timeout | null
  const run = () => {
    if (isRunning.current) {
      return
    }
    toStop.current = false
    interval = setInterval(tick, tickDurationMs)
    isRunning.current = true
  }


  const removeFullLines = () => {
    for(let line = 0; line < height; line++) {
      const lineIndexes = Array.from({length: width}, (_, i) => i + (line * width))
      const occupiedIndexes = getOccupiedIndexes()
      const lineOccupied = lineIndexes.every((index) => occupiedIndexes.includes(index))
      if (lineOccupied) {

        for(const shape of shapesInGame) {
          for (const index of lineIndexes) {
            const indexToRemove = shape.indexes.indexOf(index)
            if (indexToRemove !== -1) {
              shape.indexes.splice(indexToRemove, 1)
            }
          }
        }
        setShapesInGame([...shapesInGame])
      }
    }
  }

  const tick = ()  => {
    if (toStop.current) {
      return
    }

    if (shapesInGame.every((shape) => shape.isDown) || shapesInGame.length === 0) {
      const newShape = new Line(getRandomColor())
      shapesInGame.push(newShape)
      setShapesInGame([...shapesInGame, newShape])
    }
    else {
      for(const shape of shapesInGame) {
        if (!shape.isDown) {
          shape.moveDown(width, height, getOccupiedIndexes())
        }
      }
      setShapesInGame([...shapesInGame])
      if (getAllIndexes().includes(0)) {
        reset()
        alert('Game Over')
        return
      }
    }
    removeFullLines()
  }

  const stop = () => {
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
        shape.moveLeft(width, getOccupiedIndexes())
      }
      if (event.key === 'ArrowRight') {
        shape.moveRight(width, getOccupiedIndexes())
      }
      if (event.key === 'ArrowUp') {
        shape.flip(width, height, getOccupiedIndexes())
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
