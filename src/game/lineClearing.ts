
import { Shape, BoardSize } from 'components/shape';

export const findCompletedLines = (
  boardSize: BoardSize,
  occupiedIndexes: number[]
): number[] => {
  const completedLines: number[] = [];
  
  for (let line = boardSize.height; line > 0; line--) {
    if (isLineComplete(line, boardSize, occupiedIndexes)) {
      completedLines.push(line);
    }
  }
  
  return completedLines;
};

export const isLineComplete = (
  line: number,
  boardSize: BoardSize,
  occupiedIndexes: number[]
): boolean => {
  const lineIndexes: number[] = Array.from(
    { length: boardSize.width }, 
    (_: unknown, i: number): number => i + (line * boardSize.width)
  );
  
  return lineIndexes.every((index: number): boolean => 
    occupiedIndexes.includes(index)
  );
};

export const removeCompletedLines = (
  lines: number[],
  shapesInGame: Shape[],
  boardSize: BoardSize
): void => {
  const allLineIndexes: number[] = lines.flatMap((line: number): number[] => 
    Array.from(
      { length: boardSize.width }, 
      (_: unknown, i: number): number => i + (line * boardSize.width)
    )
  );

  for (const shape of shapesInGame) {
    for (const index of allLineIndexes) {
      shape.removeIndex(index);
    }
  }
};

export const filterEmptyShapes = (shapes: Shape[]): Shape[] => {
  return shapes.filter((shape: Shape): boolean => shape.indexes.length > 0);
};

export const dropShapesAboveLine = (
  lineNumber: number,
  shapes: Shape[],
  boardSize: BoardSize
): void => {
  const shapesToDrop: Shape[] = shapes
    .filter((shape: Shape): boolean => 
      shape.indexes.some((index: number): boolean => 
        index < lineNumber * boardSize.width
      )
    )
    .sort((a: Shape, b: Shape): number => b.indexes[0] - a.indexes[0]);

  for (const shape of shapesToDrop) {
    dropShapeToBottom(shape, shapes, boardSize);
  }
};

const dropShapeToBottom = (
  shape: Shape,
  allShapes: Shape[],
  boardSize: BoardSize
): void => {
  shape.isDown = false;
  let canMoveDown: boolean = true;

  while (canMoveDown) {
    const occupiedIndexes: number[] = allShapes
      .filter((s: Shape): boolean => s.isDown)
      .flatMap((s: Shape): number[] => s.indexes);
    
    canMoveDown = shape.moveDown(boardSize.height, occupiedIndexes);
  }
};