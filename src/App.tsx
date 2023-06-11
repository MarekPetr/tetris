import React from 'react';
import './App.css';

interface Shape {
  indexes: number[]
  color: string
}

const Cell = ({index, filled, color}: {index: number, filled: boolean, color: string}) => {
  return (
    <div className='cell' style={{backgroundColor: filled ? color : '#ADD8E6'}}></div>
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

const App = () => {
  const height = 20
  const width = 10
  const line: Shape = {indexes: [0, 1, 2], color: 'green'}
  const [shapes, setShapes] = React.useState<Shape[]>([line])
  const stopped = React.useRef(false)

  let interval: NodeJS.Timeout | null
  const run = () => {
    stopped.current = false
    interval = setInterval(doOneTurn, 700)
  }

  const doOneTurn = ()  => {
    if (stopped.current) {
      if (interval) {
        clearInterval(interval)
      }
      return
    }
    for (let i = 0; i < shapes.length; i++) {
      let push = true
      for (let j = 0; j < shapes[i].indexes.length; j++) {
        if (shapes[i].indexes[j] + width > height*width) {
          push = false
          if (interval) {
            clearInterval(interval)
          }
        }
      }
      if (push) {
        setShapes(shapes.map((shape) => {shape.indexes = shape.indexes.map((index) => index + 10); return shape}))
      }
    }
  }
  const stop = () => {
    if (interval) {
      clearInterval(interval)
    }
    interval = null
    stopped.current = true
  }

  const reset = () => {
    if (interval) {
      clearInterval(interval)
    }
    interval = null
    stopped.current = true
    setShapes([line])
  }
  
  return (
    <div>
      <Board shapes={shapes} height={height} width={width}/>
      <button onClick={run}>Start</button>
      <button onClick={stop}>Stop</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}

export default App;
