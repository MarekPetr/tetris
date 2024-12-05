import { Shape } from './shape'

const CELL_COLOR = '#1A101B'

const Cell = ({index, filled, color}: {index: number, filled: boolean, color: string}) => {
  return (
    <div className='cell' style={{backgroundColor: filled ? color : CELL_COLOR}}/>
  )
}
  
const Row = ({size, index, shapes}: {size: number, index: number, shapes: Shape[]}) => {
  let row = []
  for (let i = 0; i < size; i ++) {
    const position = index + i
    const shape = shapes.find((shape) => shape.indexes.includes(position))
    let element
    if (shape) {
      element = <Cell index={position} filled={true} color={shape.color} key={position}/>
    } else {
      element = <Cell index={position} filled={false} color={CELL_COLOR} key={position}/>
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
      <Row size={width} index={i} shapes={shapes} key={i}/>
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