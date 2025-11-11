import { useRef } from 'react';
import { SHAPES_COLORS } from '../game/constants';

export const useRandomColor = () => {
  const nextColorIndex = useRef(0);

  return () => {
    if (nextColorIndex.current === SHAPES_COLORS.length) {
      nextColorIndex.current = 0;
    }
    const color = SHAPES_COLORS[nextColorIndex.current];
    nextColorIndex.current += 1;
    return color;
  };
};