import React from 'react';
import { IoMdArrowRoundBack, IoMdArrowRoundForward, IoMdArrowRoundUp, IoMdArrowRoundDown } from 'react-icons/io';
import Statistics from 'components/Statistics';

interface ArrowControlsProps {
  isRunning: boolean;
  level: number;
  score: number;
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
}

export const ArrowControls: React.FC<ArrowControlsProps> = ({
  isRunning,
  level,
  score,
  onKeyDown,
  onKeyUp,
}) => {
  return (
    <div className='arrows'>
      <div className="arrows-row">
        <Statistics title="Level" value={level} />
        <button
          className="board-button tile"
          onPointerDown={() => onKeyDown('ArrowUp')}
          disabled={!isRunning}
        >
          <IoMdArrowRoundUp size='35px' />
        </button>
        <Statistics title="Skóre" value={score} />
      </div>
      <div className="arrows-row">
        <button
          className="board-button tile"
          onPointerDown={() => onKeyDown('ArrowLeft')}
          onPointerUp={() => onKeyUp('ArrowLeft')}
          disabled={!isRunning}
        >
          <IoMdArrowRoundBack size='35px' />
        </button>
        <button
          className="board-button tile"
          onPointerDown={() => onKeyDown('ArrowDown')}
          onPointerUp={() => onKeyUp('ArrowDown')}
          disabled={!isRunning}
        >
          <IoMdArrowRoundDown size='35px' />
        </button>
        <button
          className="board-button tile"
          onPointerDown={() => onKeyDown('ArrowRight')}
          onPointerUp={() => onKeyUp('ArrowRight')}
          disabled={!isRunning}
        >
          <IoMdArrowRoundForward size='35px' />
        </button>
      </div>
    </div>
  );
};