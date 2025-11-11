import { useCallback, useRef, useEffect } from 'react';
import { Shape } from 'game/shape';
import { GAME_CONFIG } from 'game/constants';
import { getCurrentLevelTickDurationMs } from 'game/scoring';

interface UseKeyboardControlsProps {
  isRunning: boolean;
  level: number;
  shapesInGame: Shape[];
  occupiedIndexes: number[];
  setShapesInGame: (shapes: Shape[]) => void;
  setTickDurationMs: (duration: number) => void;
}

export const useKeyboardControls = ({
  isRunning,
  level,
  shapesInGame,
  occupiedIndexes,
  setShapesInGame,
  setTickDurationMs,
}: UseKeyboardControlsProps) => {
  const moveInterval = useRef<number | null>(null);
  const moveTimeout = useRef<number | null>(null);

  const handleShapeMove = useCallback((action: string) => {
    for (const shape of shapesInGame) {
      if (shape.isDown) {
        continue;
      }
      if (action === 'ArrowLeft') {
        shape.moveLeft(occupiedIndexes);
      }
      if (action === 'ArrowRight') {
        shape.moveRight(occupiedIndexes);
      }
    }
    setShapesInGame([...shapesInGame]);
  }, [shapesInGame, occupiedIndexes, setShapesInGame]);

  const handleShapeFlip = useCallback(() => {
    for (const shape of shapesInGame) {
      if (shape.isDown) {
        continue;
      }
      shape.flip(occupiedIndexes);
    }
    setShapesInGame([...shapesInGame]);
  }, [shapesInGame, occupiedIndexes, setShapesInGame]);

  const handleKeyDownAction = useCallback((key: string) => {
    if (!isRunning) {
      return;
    }

    if (key === 'ArrowUp') {
      handleShapeFlip();
    } else if (key === 'ArrowLeft' || key === 'ArrowRight') {
      handleShapeMove(key);
      if (!moveTimeout.current) {
        moveTimeout.current = window.setTimeout(() => {
          if (!moveInterval.current) {
            moveInterval.current = window.setInterval(
              () => handleShapeMove(key),
              GAME_CONFIG.SIDE_MOVE_SPEED
            );
          }
        }, GAME_CONFIG.SIDE_MOVE_TIMEOUT);
      }
    } else if (key === 'ArrowDown') {
      setTickDurationMs(
        getCurrentLevelTickDurationMs(level) * GAME_CONFIG.FAST_TICK_DURATION_COEFFICIENT
      );
    }
  }, [handleShapeFlip, handleShapeMove, level, isRunning, setTickDurationMs]);

  const handleKeyUpAction = useCallback((key: string) => {
    if (moveTimeout.current) {
      window.clearTimeout(moveTimeout.current);
      moveTimeout.current = null;
    }
    if (moveInterval.current) {
      window.clearInterval(moveInterval.current);
      moveInterval.current = null;
    }
    if (key === 'ArrowDown') {
      setTickDurationMs(getCurrentLevelTickDurationMs(level));
    }
  }, [level, setTickDurationMs]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      handleKeyDownAction(event.key);
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      handleKeyUpAction(event.key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDownAction, handleKeyUpAction]);

  return {
    handleKeyDownAction,
    handleKeyUpAction,
  };
};