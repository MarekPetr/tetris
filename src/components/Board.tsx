import { useState, useEffect } from 'react'
import { Shape } from 'game/shape'

const CELL_COLOR = '#1A101B'

const Cell = ({filled, color, boardHeight}: {filled: boolean, color: string, boardHeight: number}) => {
  const [height, setHeight] = useState((window.innerHeight / boardHeight) * 0.6)

  useEffect(() => {
    const handleResize = () => {
      setHeight((window.innerHeight / boardHeight) * 0.6)
    }
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [boardHeight])

  return (
    <div className='cell' style={{backgroundColor: filled ? color : CELL_COLOR, height: height, width: height}}/>
  )
}
  
const Row = ({size, index, shapes, boardHeight}: {size: number, index: number, shapes: Shape[], boardHeight: number}) => {
  let row = []
  for (let i = 0; i < size; i ++) {
    const position = index + i
    const shape = shapes.find((shape) => shape.indexes.includes(position))
    let element
    if (shape) {
      element = <Cell filled={true} color={shape.color} boardHeight={boardHeight} key={position}/>
    } else {
      element = <Cell filled={false} color={CELL_COLOR} boardHeight={boardHeight} key={position}/>
    }
    row.push(element)
  }
  return (
    <div className='row'>{row}</div>
  )
}
  
const Board = ({height, width, shapes}: {height: number, width: number, shapes: Shape[]}) => {
  let rows = []
  for (let i = 0; i < height*width; i+=width) {
    rows.push(
      <Row boardHeight={height} size={width} index={i} shapes={shapes} key={i}/>
    )
  }
  return (
    <div>
      <div className='board-third-border'>
        <div className='board-second-border'>
          <div className='board-first-border'>
            <div className='board'>
              {rows}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Board