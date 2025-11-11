import 'App.css';
import { BoardSize } from 'components/shape';
import { GAME_CONFIG, SHAPES_IN_GAME } from 'game/constants';
import { useGameState } from 'hooks/useGameState';
import { useInterval } from 'hooks/useInterval';
import { useRandomColor } from 'utils/randomColor';
import { useKeyboardControls } from 'hooks/useKeyboardControls';
import Board from 'components/Board';
import { GameControls } from 'components/GameControls';
import { ArrowControls } from 'components/ArrowControls';
import {
  findCompletedLines,
  removeCompletedLines,
  filterEmptyShapes,
  dropShapesAboveLine,
} from 'game/lineClearing';
import { calculateScore, getCurrentLevelTickDurationMs } from 'game/scoring';

const App = () => {
  const boardSize: BoardSize = { width: GAME_CONFIG.WIDTH, height: GAME_CONFIG.HEIGHT };
  const getRandomColor = useRandomColor();

  const gameState = useGameState();
  const {
    shapesInGame,
    setShapesInGame,
    isRunning,
    setIsRunning,
    level,
    setLevel,
    score,
    setScore,
    isStopped,
    setIsStopped,
    totalLinesCleared,
    setTotalLinesCleared,
    tickDurationMs,
    setTickDurationMs,
    occupiedIndexes,
    reset,
  } = gameState;

  const startGame = () => {
    if (isRunning) {
      return;
    }
    reset();
    setIsRunning(true);
    setIsStopped(false);
  };

  const continueRunning = () => {
    if (isRunning) {
      return;
    }
    setIsRunning(true);
    setIsStopped(false);
  };

  const stop = () => {
    setIsRunning(false);
    setIsStopped(true);
  };

  const quit = () => {
    setIsRunning(false);
    setIsStopped(false);
    reset();
  };

  const handleCompletedLines = () => {
    const completedLines = findCompletedLines(boardSize, occupiedIndexes);

    if (completedLines.length === 0) {
      return;
    }

    removeCompletedLines(completedLines, shapesInGame, boardSize);
    const remainingShapes = filterEmptyShapes(shapesInGame);

    if (remainingShapes.length === 0) {
      setShapesInGame([]);
      return;
    }

    const highestClearedLine = Math.min(...completedLines);
    dropShapesAboveLine(highestClearedLine, remainingShapes, boardSize);
    setShapesInGame([...remainingShapes]);

    const newTotalLines = totalLinesCleared + completedLines.length;
    setTotalLinesCleared(newTotalLines);

    if (newTotalLines % GAME_CONFIG.LINES_CLEARED_TO_LEVEL_UP === 0) {
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setTickDurationMs(getCurrentLevelTickDurationMs(nextLevel));
    }

    const scoreToAdd = calculateScore(completedLines.length, level);
    setScore(score + scoreToAdd);
  }

  const tick = () => {
    if (shapesInGame.every((shape) => shape.isDown)) {
      const RandomShape = SHAPES_IN_GAME[Math.floor(Math.random() * SHAPES_IN_GAME.length)];
      const newShape = new RandomShape(getRandomColor(), boardSize);
      newShape.flipRandomly(occupiedIndexes);
      
      if (newShape.indexes.some((index) => occupiedIndexes.includes(index))) {
        quit();
        alert('Konec hry');
        return;
      }
      setShapesInGame([...shapesInGame, newShape]);
    } else {
      for (const shape of shapesInGame) {
        if (!shape.isDown) {
          shape.moveDown(boardSize.height, occupiedIndexes);
        }
      }
      setShapesInGame([...shapesInGame]);
    }
    handleCompletedLines();
  }

  useInterval(tick, isRunning ? tickDurationMs : null);

  const { handleKeyDownAction, handleKeyUpAction } = useKeyboardControls({
    isRunning,
    level,
    shapesInGame,
    occupiedIndexes,
    setShapesInGame,
    setTickDurationMs,
  });

  return (
    <div className="board-page">
      <div className='content'>
        <div className='game'>
          <GameControls
            isRunning={isRunning}
            isStopped={isStopped}
            onStart={startGame}
            onStop={stop}
            onContinue={continueRunning}
            onQuit={quit}
          />
          <Board height={boardSize.height} width={boardSize.width} shapes={shapesInGame} />
          <ArrowControls
            isRunning={isRunning}
            level={level}
            score={score}
            onKeyDown={handleKeyDownAction}
            onKeyUp={handleKeyUpAction}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
