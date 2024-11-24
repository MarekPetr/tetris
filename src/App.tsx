import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import './App.css';
import { Shape, Line, Cube, TShape, BoardSize } from './components/shape'
import Board from './components/Board'

const WIDTH = 10
const HEIGHT = 20
const FAST_TICK_DURATION_COEFFICIENT = 0.30
const LEVEL_OF_MAX_SPEED = 15
const MAX_SPEED = 85
const LINES_CLEARED_TO_LEVEL_UP = 5
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

  const [shapesInGame, setShapesInGame] = React.useState<Shape[]>([])
  const [isRunning, setIsRunning] = React.useState(false)
  const [level, setLevel] = React.useState(1)
  const [score, setScore] = React.useState(0)
  const [isStopped, setIsStopped] = React.useState(false)
  const [totalLinesCleared, setTotalLinesCleared] = React.useState(0)
  
  const getCurrentLevelTickDurationMs = (level: number) => {
    if (level < LEVEL_OF_MAX_SPEED) {
      return -230/Math.log(LEVEL_OF_MAX_SPEED) * Math.log(level) + 300
    }
    return MAX_SPEED
  }

  const [tickDurationMs, setTickDurationMs] = React.useState<number>(getCurrentLevelTickDurationMs(level))

  const shapesDown = useMemo(
    () => shapesInGame.filter((shape) => shape.isDown),
    [shapesInGame]
  )
  const occupiedIndexes = useMemo(
    () => shapesDown.map((shape) => shape.indexes).flat(),
    [shapesDown]
  )

  const reset = () => {
    setShapesInGame([])
    const nextLevel = 1
    setLevel(nextLevel)
    setScore(0)
    setTickDurationMs(getCurrentLevelTickDurationMs(nextLevel))
  }

  const startGame = () => {
    if (isRunning) {
      return
    }
    reset()
    setIsRunning(true)
  }

  const continueRunning = () => {
    if (isRunning) {
      return
    }
    setIsRunning(true)
    setIsStopped(false)
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
    const currentTotalLinesCleared = totalLinesCleared + numberOfLinesRemoved
    setTotalLinesCleared(currentTotalLinesCleared)

    if (currentTotalLinesCleared % LINES_CLEARED_TO_LEVEL_UP === 0) {
      const nextLevel = level + 1
      setLevel(nextLevel)
      setTickDurationMs(getCurrentLevelTickDurationMs(nextLevel))
      updateScore(numberOfLinesRemoved)
    }    
  }

  const updateScore = (numberOfLinesRemoved: number) => {
    if (numberOfLinesRemoved === 1) {
      setScore(score+(40*(level)))
    }
    else if (numberOfLinesRemoved === 2) {
      setScore(score+(100*(level)))
    }
    else if (numberOfLinesRemoved === 3) {
      setScore(score+(300*(level)))
    }
    else if (numberOfLinesRemoved === 4) {
      setScore(score+(1200*(level)))
    }
  }

  const tick = ()  => {
    if (shapesInGame.every((shape) => shape.isDown)) {
      const shapesChoices = [TShape, Cube, Line]
      const RandomShape = shapesChoices[Math.floor(Math.random() * shapesChoices.length)]
      const newShape = new RandomShape(getRandomColor(), boardSize)
      newShape.flipRandomly(occupiedIndexes)
      if (newShape.indexes.some((index) => occupiedIndexes.includes(index))) {        
        quit()
        alert("Game over")
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
    setIsRunning(false)
    setIsStopped(true)
  }

  const quit = () => {
    setIsRunning(false)
    setIsStopped(false)
    reset()
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
        setTickDurationMs(getCurrentLevelTickDurationMs(level) * FAST_TICK_DURATION_COEFFICIENT)
      }
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === "ArrowDown") {
        setTickDurationMs(getCurrentLevelTickDurationMs(level))
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleShapeAction, level]);

  const pauseButton = isStopped ? 
    <button className="board-button tile" onClick={continueRunning}>Continue</button> :
    <button className="board-button tile" onClick={stop} disabled={!isRunning}>Pause</button>
  
  return (
    <div className="board-page">
      <div className='content'>
        <div className='buttons'>
        <button className="board-button tile" onClick={startGame}>New Game</button>
        { pauseButton }
        <button className="board-button tile" onClick={quit} disabled={!isRunning}>Quit</button>
        </div>
        <Board height={boardSize.height} width={boardSize.width} shapes={shapesInGame}/>
        <div className='buttons'>
          <div className="level tile">Level: {level}</div>
          <div className="score tile">Score: {score}</div>
          <div className="score tile">Speed: {Math.floor(tickDurationMs)}</div>
        </div>
      </div>
    </div>
  );
}

export default App;
