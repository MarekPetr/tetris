import { Cube, JShape, Line, LShape, SShape, TShape, ZShape } from "game/shape";

export const GAME_CONFIG = {
  WIDTH: 10,
  HEIGHT: 20,
  FAST_SIDE_MOVE_SPEED: 55,
  FAST_SIDE_MOVE_TIMEOUT: 70,
  FAST_TICK_DURATION_COEFFICIENT: 0.30,
  LEVEL_OF_MAX_SPEED: 29,
  MAX_SPEED: 100,
  LINES_CLEARED_TO_LEVEL_UP: 1,
} as const;

export const SHAPES_COLORS = ['#8E4585', '#478B59', '#45598E'];
export const SHAPES_IN_GAME = [Line, Cube, TShape, ZShape, SShape, LShape, JShape];