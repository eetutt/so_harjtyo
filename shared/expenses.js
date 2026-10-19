export const categories = ['Ruoka', 'Asuminen', 'Liikkuminen', 'Vapaa-aika', 'Terveys', 'Opiskelu', 'Muut']

export const parseAmount = value => {
  if (typeof value !== 'string') return null
  const trimmedValue = value.trim()
  const validAmount = /^\d{1,7}([.,]\d{1,2})?$/.test(trimmedValue)
  if (!validAmount) return null

  const normalizedValue = trimmedValue.replace(',', '.')
  const [euros, cents = ''] = normalizedValue.split('.')
  const paddedCents = cents.padEnd(2, '0')
  const amount = Number(euros) * 100 + Number(paddedCents)
  return amount > 0 && amount <= 999999999 ? amount : null
}

export const isValidDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  if (Number.isNaN(date.getTime())) return false
  const dateString = date.toISOString()
  const calendarDate = dateString.slice(0, 10)
  return calendarDate === value
}

export const validateExpense = expense => {
  if (!expense || typeof expense !== 'object') return 'Menon tiedot puuttuvat.'
  if (typeof expense.description !== 'string') {
    return 'Anna kuvaus, jonka pituus on 1–100 merkkiä.'
  }
  const description = expense.description.trim()
  if (!description || description.length > 100) {
    return 'Anna kuvaus, jonka pituus on 1–100 merkkiä.'
  }
  if (!categories.includes(expense.category)) return 'Valitse kelvollinen kategoria.'
  if (!isValidDate(expense.date)) return 'Anna kelvollinen päivämäärä.'
  if (!Number.isSafeInteger(expense.amountCents) || expense.amountCents <= 0 || expense.amountCents > 999999999) {
    return 'Summan tulee olla 0,01–9 999 999,99 euroa.'
  }
  return null
}
