import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import './App.css';
import { Shape, Line, Cube, TShape, BoardSize, ZShape, SShape, LShape, JShape } from './components/shape'
import Board from './components/Board'
import Statistics from './components/Statistics'
import { IoMdArrowRoundBack, IoMdArrowRoundForward, IoMdArrowRoundUp, IoMdArrowRoundDown } from "react-icons/io";

const WIDTH = 10
const HEIGHT = 20
const FAST_SIDE_MOVE_SPEED = 55
const FAST_SIDE_MOVE_TIMEOUT = 70
const FAST_TICK_DURATION_COEFFICIENT = 0.30
const LEVEL_OF_MAX_SPEED = 29
const MAX_SPEED = 100
const LINES_CLEARED_TO_LEVEL_UP = 1
const SHAPES_COLORS = ['#8E4585', '#478B59', '#45598E']
const SHAPES_IN_GAME = [Line, Cube, TShape, ZShape, SShape, LShape, JShape]

const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(() => {});
  const timer = useRef<number | null>(null)
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
      let id = window.setInterval(intervalTick, delay);
      return () => window.clearInterval(id);
    }
  }, [delay]);
  return timer;
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
    const speed = -230/Math.log(LEVEL_OF_MAX_SPEED) * Math.log(level) + 300
    if (speed < MAX_SPEED) {
      return MAX_SPEED
    }
    return speed
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
    setIsStopped(false)
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
      const RandomShape = SHAPES_IN_GAME[Math.floor(Math.random() * SHAPES_IN_GAME.length)]
      const newShape = new RandomShape(getRandomColor(), boardSize)
      //newShape.flipRandomly(occupiedIndexes)
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

  const handleShapeMove = useCallback((action: string) => {
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
    }
    setShapesInGame([...shapesInGame])
  }, [shapesInGame, occupiedIndexes])

  const handleShapeFlip = useCallback(() => {
    for(const shape of shapesInGame) {
      if (shape.isDown){
        continue
      }
      shape.flip(occupiedIndexes)
    }
    setShapesInGame([...shapesInGame])
  }, [shapesInGame, occupiedIndexes])

  const moveInterval = useRef<number | null>(null)
  const moveTimeout = useRef<number | null>(null)

  const handleKeyDownAction = useCallback((key: string) => {
    if (key === 'ArrowUp') {
      handleShapeFlip();
    }
    else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      handleShapeMove(key)
      if (!moveTimeout.current) {
        moveTimeout.current = window.setTimeout(() => {
          if (!moveInterval.current) {
            moveInterval.current = window.setInterval(() => handleShapeMove(key), FAST_SIDE_MOVE_SPEED)
          }  
        }, FAST_SIDE_MOVE_TIMEOUT)
      }   
    }  
    else if (key === 'ArrowDown') {
      setTickDurationMs(getCurrentLevelTickDurationMs(level) * FAST_TICK_DURATION_COEFFICIENT)
    }
  }, [handleShapeFlip, handleShapeMove, level])

  const handleKeyUpAction = useCallback((key: string) => {
    if (moveTimeout.current) {
      window.clearTimeout(moveTimeout.current)
      moveTimeout.current = null
    }
    if (moveInterval.current) {
      window.clearInterval(moveInterval.current)
      moveInterval.current = null;
    }
    if (key === "ArrowDown") {
      setTickDurationMs(getCurrentLevelTickDurationMs(level))
    }
  }, [level])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyDownAction(event.key)
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      handleKeyUpAction(event.key)
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleShapeMove, handleShapeFlip, handleKeyDownAction, handleKeyUpAction, level]);

  const pauseButton = isStopped ? 
    <button className="board-button tile" onClick={continueRunning}>Continue</button> :
    <button className="board-button tile" onClick={stop} disabled={!isRunning}>Pause</button>
  
  return (
    <div className="board-page">
      <div className='content'>
        <div className='buttons'>
          <button className="board-button tile" onClick={startGame}>New Game</button>
          { pauseButton }
          <button className="board-button tile" onClick={quit} disabled={!isRunning && !isStopped}>Quit</button>
        </div>
        
        <div className='game'>
          <Board height={boardSize.height} width={boardSize.width} shapes={shapesInGame}/>
          <div className='arrows'>
            <button className="board-button tile"
              onPointerDown={() => handleKeyDownAction('ArrowUp')}
              disabled={!isRunning && !isStopped}>
                <IoMdArrowRoundUp size='35px' />
            </button>
            <div>
              <button className="board-button tile"
                onPointerDown={() => handleKeyDownAction('ArrowLeft')}
                onPointerUp={() => handleKeyUpAction('ArrowLeft')}
                disabled={!isRunning && !isStopped}>
                  <IoMdArrowRoundBack size='35px' />
              </button>
              <button className="board-button tile"
                onPointerDown={() => handleKeyDownAction('ArrowDown')}
                onPointerUp={() => handleKeyUpAction('ArrowDown')}
                disabled={!isRunning && !isStopped}>
                  <IoMdArrowRoundDown size='35px' />
              </button>
              <button className="board-button tile"
                onPointerDown={() => handleKeyDownAction('ArrowRight')}
                onPointerUp={() => handleKeyUpAction('ArrowRight')}
                disabled={!isRunning && !isStopped}>
                  <IoMdArrowRoundForward size='35px' />
              </button>
            </div> 
          </div>
        </div>
        <div className='buttons'>
          <Statistics title="Level" value={level}/>
          <Statistics title="Score" value={score}/>
          <Statistics title="Speed" value={Math.floor(tickDurationMs)}/>
        </div>
      </div>
    </div>
  );
}

export default App;
