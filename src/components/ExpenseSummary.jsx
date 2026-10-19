import { formatMoney } from '../utils'

const ExpenseSummary = ({ expenses, total, unavailable }) => {
  const totals = {}
  for (const expense of expenses) {
    const previousTotal = totals[expense.category] || 0
    totals[expense.category] = previousTotal + expense.amountCents
  }

  let largestCategory = ''
  let largestAmount = 0
  for (const [category, amount] of Object.entries(totals)) {
    if (amount > largestAmount) {
      largestCategory = category
      largestAmount = amount
    }
  }

  let categoryText = '—'
  if (!unavailable && largestCategory) {
    const amountText = formatMoney(largestAmount)
    categoryText = `${largestCategory} (${amountText})`
  }
  return (
    <section className="summary" aria-label="Suodatettujen menojen yhteenveto">
      <p>Yhteensä: <strong>{unavailable ? '—' : formatMoney(total)}</strong></p>
      <p>Menoja: <strong>{unavailable ? '—' : expenses.length}</strong></p>
      <p>Suurin kategoria: <strong>{categoryText}</strong></p>
    </section>
  )
}

export default ExpenseSummary
