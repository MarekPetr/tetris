const Statistics = ({title, value}: {title: string, value: number}) => {
  return (
  <div className="statistics tile">
    <div>{title}</div>
    <div>{value}</div>
  </div>
  )
}

export default Statistics