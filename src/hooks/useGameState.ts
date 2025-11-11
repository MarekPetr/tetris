import { useState, useMemo } from 'react';
import { Shape } from '../components/shape';
import { getCurrentLevelTickDurationMs } from '../game/scoring';

export const useGameState = () => {
  const [shapesInGame, setShapesInGame] = useState<Shape[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [isStopped, setIsStopped] = useState(false);
  const [totalLinesCleared, setTotalLinesCleared] = useState(0);
  const [tickDurationMs, setTickDurationMs] = useState<number>(
    getCurrentLevelTickDurationMs(1)
  );

  const shapesDown = useMemo(
    () => shapesInGame.filter((shape) => shape.isDown),
    [shapesInGame]
  );
  
  const occupiedIndexes = useMemo(
    () => shapesDown.map((shape) => shape.indexes).flat(),
    [shapesDown]
  );

  const reset = () => {
    setShapesInGame([]);
    const nextLevel = 1;
    setLevel(nextLevel);
    setScore(0);
    setTotalLinesCleared(0);
    setTickDurationMs(getCurrentLevelTickDurationMs(nextLevel));
  };

  return {
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
    shapesDown,
    occupiedIndexes,
    reset,
  };
};