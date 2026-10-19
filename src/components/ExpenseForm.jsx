import { useState } from 'react'
import { categories, parseAmount, validateExpense } from '../../shared/expenses'
import { today } from '../utils'

const ExpenseForm = ({ onAdd, disabled }) => {
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState(categories[0])
  const [date, setDate] = useState(today)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = event => {
    event.preventDefault()
    const trimmedDescription = description.trim()
    const amountCents = parseAmount(amount)
    const expense = { description: trimmedDescription, amountCents, category, date }
    const validationError = validateExpense(expense)
    if (validationError) {
      setError(validationError)
      return
    }
    setError('')
    setSaving(true)
    onAdd(expense)
      .then(() => {
        setDescription('')
        setAmount('')
      })
      .catch(failure => {
        const message = failure.message || 'Tallennus epäonnistui. Yritä uudelleen.'
        setError(message)
      })
      .finally(() => setSaving(false))
  }

  return (
    <section className="panel form-panel" aria-labelledby="add-title">
      <h2 id="add-title">Lisää meno</h2>
      <form onSubmit={handleSubmit}>
        <fieldset disabled={disabled || saving}>
          <label htmlFor="description">Kuvaus</label>
          <input
            id="description"
            value={description}
            onChange={event => setDescription(event.target.value)}
            placeholder="Esim. viikon ruokaostokset"
            required
            maxLength={100}
          />
          <div className="form-row">
            <div>
              <label htmlFor="amount">Summa (€)</label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={event => setAmount(event.target.value)}
                placeholder="0,00"
                required
                aria-describedby="amount-help"
              />
            </div>
            <div>
              <label htmlFor="date">Päivämäärä</label>
              <input
                id="date"
                type="date"
                value={date}
                onChange={event => setDate(event.target.value)}
                required
              />
            </div>
          </div>
          <small id="amount-help">Voit käyttää pilkkua tai pistettä. Enintään kaksi desimaalia.</small>
          <label htmlFor="category">Kategoria</label>
          <select id="category" value={category} onChange={event => setCategory(event.target.value)}>
            {categories.map(item => <option key={item}>{item}</option>)}
          </select>
          <button className="primary-button" type="submit">{saving ? 'Tallennetaan…' : 'Lisää meno'}</button>
        </fieldset>
        {error && <p className="form-error" role="alert">{error}</p>}
      </form>
    </section>
  )
}

export default ExpenseForm
