import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import './App.css';
import { Shape, Line, Cube, TShape, BoardSize } from './components/shape'
import Board from './components/Board'

const WIDTH = 10
const HEIGHT = 20
const INITIAL_TICK_DURATION = 15 * HEIGHT
const LOWER_TICK_DURATION_COEFFICIENT = 0.9
const FAST_TICK_DURATION_COEFFICIENT = 0.30
const SHAPES_COLORS = ['#8E4585', '#478B59', '#45598E']

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
    if (nextColorIndex.current === SHAPES_COLORS.length) {
      nextColorIndex.current = 0
    }
    const color = SHAPES_COLORS[nextColorIndex.current]
    nextColorIndex.current += 1
    return color
  }

  const boardSize: BoardSize = { width: WIDTH, height: HEIGHT}
  const [tickDurationMs, setTickDurationMs] = React.useState<number>(INITIAL_TICK_DURATION)
  const [currentLevelTickDurationMs, setCurrentLevelTickDurationMs] = React.useState<number>(INITIAL_TICK_DURATION)
  const [shapesInGame, setShapesInGame] = React.useState<Shape[]>([])
  const [isRunning, setIsRunning] = React.useState(false)
  const [level, setLevel] = React.useState(0)
  const [score, setScore] = React.useState(0)

  const shapesDown = useMemo(
    () => shapesInGame.filter((shape) => shape.isDown),
    [shapesInGame]
  )
  const occupiedIndexes = useMemo(
    () => shapesDown.map((shape) => shape.indexes).flat(),
    [shapesDown]
  )

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
    let lastLineCleared = -1
    let lineRemoved = false
    let filteredShapes: Shape[] = []
    let numberOfLinesRemoved = 0

    for(let line = boardSize.height; line > 0; line--) {
      const lineIndexes = Array.from({length: boardSize.width}, (_, i) => i + (line * boardSize.width))
      const lineOccupied = lineIndexes.every((index) => occupiedIndexes.includes(index))
      if (!lineOccupied) {
        continue
      }
      lineRemoved = true
      numberOfLinesRemoved += 1
      for(const shape of shapesInGame) {
        for (const index of lineIndexes) {
          shape.removeIndex(index)
          if (lastLineCleared === -1) {
            lastLineCleared = line
          }
        }
      }
      filteredShapes = shapesInGame.filter((shape) => shape.indexes.length !== 0)
      setShapesInGame([...filteredShapes])
    }

    if (!lineRemoved) {
      return
    }
    
    const shapesAboveLine = filteredShapes.filter((shape) => shape.indexes.some((index) => index < lastLineCleared * boardSize.width))
    const orderedShapes = shapesAboveLine.sort((a, b) => b.indexes[0] - a.indexes[0])

    for(const shape of orderedShapes) {
      let moved = true
      shape.isDown = false
      while (moved) {
        const occupiedIndexes = filteredShapes.filter((shape) => shape.isDown).map((shape) => shape.indexes).flat()
        moved = shape.moveDown(boardSize.height, occupiedIndexes)
        setShapesInGame([...filteredShapes])
      }
    }

    if (numberOfLinesRemoved % 10 === 0 && level < 8) {
      setLevel(level+1)
      const nextTickDuration = currentLevelTickDurationMs * LOWER_TICK_DURATION_COEFFICIENT
      setTickDurationMs(nextTickDuration)
      setCurrentLevelTickDurationMs(nextTickDuration)
    }

    updateScore(numberOfLinesRemoved)
  }

  const updateScore = (numberOfLinesRemoved: number) => {
    if (numberOfLinesRemoved === 1) {
      setScore(score+(40*(level+1)))
    }
    else if (numberOfLinesRemoved === 2) {
      setScore(score+(100*(level+1)))
    }
    else if (numberOfLinesRemoved === 3) {
      setScore(score+(300*(level+1)))
    }
    else if (numberOfLinesRemoved === 4) {
      setScore(score+(1200*(level+1)))
    }
  }

  const tick = ()  => {
    if (shapesInGame.every((shape) => shape.isDown)) {
      if (getAllIndexes().some((value) => value < boardSize.width)) {
        reset()
        alert('Game Over')
        return
      }
      const shapesChoices = [TShape, Cube, Line]
      const RandomShape = shapesChoices[Math.floor(Math.random() * shapesChoices.length)]
      const newShape = new RandomShape(getRandomColor(), boardSize)
      newShape.flipRandomly(occupiedIndexes)
      if (newShape.indexes.some((index) => occupiedIndexes.includes(index))) {
        reset()
        alert('Game Over')
        return
      }
      setShapesInGame([...shapesInGame, newShape])
    }
    else {
      for(const shape of shapesInGame) {
        if (!shape.isDown) {
          shape.moveDown(boardSize.height, occupiedIndexes)
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
    setLevel(0)
    setScore(0)
    setTickDurationMs(INITIAL_TICK_DURATION)
  }

  const handleShapeAction = useCallback((action: string) => {
    for(const shape of shapesInGame) {
      if (shape.isDown){
        continue
      }
      if (action === 'ArrowLeft') {
        shape.moveLeft(occupiedIndexes)
      }
      if (action === 'ArrowRight') {
        shape.moveRight(occupiedIndexes)
      }
      if (action === 'ArrowUp') {
        shape.flip(occupiedIndexes)
      }
    }
    setShapesInGame([...shapesInGame])
  }, [shapesInGame, occupiedIndexes])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleShapeAction(event.key);
      if (event.key === 'ArrowDown') {
        setTickDurationMs(currentLevelTickDurationMs * FAST_TICK_DURATION_COEFFICIENT)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        setTickDurationMs(currentLevelTickDurationMs)
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleShapeAction, currentLevelTickDurationMs]);
  
  return (
    <div className="board-page">
      <div className='content'>
        <div className='buttons'>
          <button className="board-button tile" onClick={run}>Play</button>
          <button className="board-button tile" onClick={stop}>Pause</button>
          <button className="board-button tile" onClick={reset}>Quit</button>
        </div>
        <Board height={boardSize.height} width={boardSize.width} shapes={shapesInGame}/>
        <div className='buttons'>
          <div className="level tile">Level: {level}</div>
          <div className="score tile">Score: {score}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
