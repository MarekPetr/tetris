const Statistics = ({title, value}: {title: string, value: number}) => {
  return (
  <div className="statistics tile">
    <div className="title">{title}</div>
    {value}
  </div>
  )
}

export default Statistics