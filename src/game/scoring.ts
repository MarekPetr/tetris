import { GAME_CONFIG } from 'game/constants';

export const calculateScore = (numberOfLinesRemoved: number, level: number): number => {
  const scoreTable: Record<number, number> = {
    1: 40 * level,
    2: 100 * level,
    3: 300 * level,
    4: 1200 * level,
  };

  return scoreTable[numberOfLinesRemoved] || 0;
};

export const getCurrentLevelTickDurationMs = (level: number): number => {
  const speed = -230 / Math.log(GAME_CONFIG.LEVEL_OF_MAX_SPEED) * Math.log(level) + 300;
  return speed < GAME_CONFIG.MAX_SPEED ? GAME_CONFIG.MAX_SPEED : speed;
};