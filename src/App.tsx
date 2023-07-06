import React, { useEffect, useRef } from 'react';
import './App.css';
import { Shape, Line } from './components/shape'
import Board from './components/Board'

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(() => {});

  // Remember the latest function.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const intervalTick = () => {
      savedCallback.current();
    }
    if (delay !== null) {
      let id = setInterval(intervalTick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}

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

  const height = 10
  const width = 9
  const initialTickDuration = 400
  const fastTickDuration = 80
  const [tickDurationMs, setTickDurationMs] = React.useState<number>(initialTickDuration)
  const [shapesInGame, setShapesInGame] = React.useState<Shape[]>([])
  const [isRunning, setIsRunning] = React.useState(false);

  const getShapesDown = () => shapesInGame.filter((shape) => shape.isDown)
  const getOccupiedIndexes = () => getShapesDown().map((shape) => shape.indexes).flat()

  const getAllIndexes = () => {
    let indexes: number[] = []
    for (const shape of shapesInGame) {
      indexes = indexes.concat(shape.indexes)
    }
    return indexes
  }
  const run = () => {
    if (isRunning) {
      return
    }
    setIsRunning(true)
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
    if (shapesInGame.every((shape) => shape.isDown) || shapesInGame.length === 0) {
      if (getAllIndexes().some((value) => value < width)) {
        reset()
        alert('Game Over')
        return
      }
      const newShape = new Line(getRandomColor(), width)
      setShapesInGame([...shapesInGame, newShape])
    }
    else {
      for(const shape of shapesInGame) {
        if (!shape.isDown) {
          shape.moveDown(height, getOccupiedIndexes())
        }
      }
      setShapesInGame([...shapesInGame])
    }
    removeFullLines()
  }

  useInterval(tick, isRunning ? tickDurationMs : null)

  const stop = () => {
    if (!isRunning) {
      return
    }
    setIsRunning(false)
  }

  const reset = () => {
    setIsRunning(false)
    setShapesInGame([])
  }

  const handleAction = (action: string) => {
    for(const shape of shapesInGame) {
      if (shape.isDown){
        continue
      }
      if (action === 'ArrowLeft') {
        shape.moveLeft(getOccupiedIndexes())
      }
      if (action === 'ArrowRight') {
        shape.moveRight(getOccupiedIndexes())
      }
      if (action === 'ArrowUp') {
        shape.flip(width, height, getOccupiedIndexes())
      }
      if (action === 'ArrowDown') {
        if (isRunning) {
          setIsRunning(false)
          setTickDurationMs(fastTickDuration)
          setIsRunning(true)
        }
      }

    }
    setShapesInGame([...shapesInGame])
  }

  const handleKeyUp = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowDown') {
      setIsRunning(false)
      setTickDurationMs(initialTickDuration)
      setIsRunning(true)
    }
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    handleAction(event.key)
  }
  
  return (
    <div>
      <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
        <Board height={height} width={width} shapes={shapesInGame}/>
        <button onClick={run}>Start</button>
        <button onClick={stop}>Stop</button>
        <button onClick={reset}>Reset</button>
        <button onClick={() => handleAction('ArrowLeft')}>Left</button>
        <button onClick={()=> handleAction('ArrowUp')}>Flip</button>
        <button onClick={()=> handleAction('ArrowRight')}>Right</button>
      </div>      
    </div>
  );
}

export default App;
