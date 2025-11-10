const Statistics = ({title, value}: {title: string, value: number}) => {
  return (
  <div className="statistics">
    <span className="title">{title} {value}</span>
  </div>
  )
}

export default Statistics