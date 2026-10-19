const moneyFormatter = new Intl.NumberFormat('fi-FI', {
  style: 'currency', currency: 'EUR',
})
const dateFormatter = new Intl.DateTimeFormat('fi-FI')

export const formatMoney = cents => {
  const euros = cents / 100
  return moneyFormatter.format(euros)
}

export const formatDate = date => {
  const dateObject = new Date(`${date}T12:00:00`)
  return dateFormatter.format(dateObject)
}

export const today = () => {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1)
  const day = String(date.getDate())
  const paddedMonth = month.padStart(2, '0')
  const paddedDay = day.padStart(2, '0')
  return `${year}-${paddedMonth}-${paddedDay}`
}
