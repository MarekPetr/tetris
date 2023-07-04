import { Shape } from './shape'

const Cell = ({index, filled, color}: {index: number, filled: boolean, color: string}) => {
    return (
      <div className='cell' style={{backgroundColor: filled ? color : '#ADD8E6'}}>{index}</div>
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
          element = <Cell index={position} filled={false} color='#ADD8E6' key={position}/>
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
      <div className='board'>
          {rows}
      </div>
    )
  }

  export default Board