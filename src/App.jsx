import { useEffect, useRef, useState } from 'react'
import ExpenseForm from './components/ExpenseForm'
import ExpenseFilters from './components/ExpenseFilters'
import ExpenseSummary from './components/ExpenseSummary'
import ExpenseTable from './components/ExpenseTable'
import Notification from './components/Notification'
import expenseService from './services/expenses'

const emptyFilters = { search: '', category: '', month: '' }

const App = () => {
  const [expenses, setExpenses] = useState([])
  const [filters, setFilters] = useState(emptyFilters)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [loadAttempt, setLoadAttempt] = useState(0)
  const [deletingId, setDeletingId] = useState(null)
  const [notification, setNotification] = useState(null)
  const notificationTimer = useRef(null)

  const notify = (message, type = 'success') => {
    clearTimeout(notificationTimer.current)
    setNotification({ message, type })
    notificationTimer.current = setTimeout(() => setNotification(null), 6000)
  }

  useEffect(() => {
    return () => clearTimeout(notificationTimer.current)
  }, [])

  useEffect(() => {
    let active = true
    expenseService.getAll()
      .then(data => {
        if (!active) return
        setExpenses(data)
        setLoadError(false)
      })
      .catch(() => {
        if (active) setLoadError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [loadAttempt])

  const addExpense = expense => {
    const request = expenseService.create(expense)
    return request.then(saved => {
      setExpenses(current => current.concat(saved))
      notify('Meno lisätty. Jos se ei näy taulukossa, tarkista suodattimet.')
    })
  }

  const removeFromList = id => {
    setExpenses(current => {
      const remainingExpenses = current.filter(expense => expense.id !== id)
      return remainingExpenses
    })
  }

  const retryLoading = () => {
    setLoading(true)
    setLoadError(false)
    setLoadAttempt(current => current + 1)
  }

  const changeFilter = (key, value) => {
    setFilters(current => ({ ...current, [key]: value }))
  }

  const resetFilters = () => {
    setFilters(emptyFilters)
  }

  const removeExpense = expense => {
    const confirmed = window.confirm(`Poistetaanko meno ”${expense.description}”?`)
    if (!confirmed) return
    setDeletingId(expense.id)
    expenseService.remove(expense.id)
      .then(() => {
        removeFromList(expense.id)
        notify('Meno poistettu.')
      })
      .catch(error => {
        if (error.status === 404) {
          removeFromList(expense.id)
          notify('Meno oli jo poistettu.', 'error')
        } else {
          notify('Poisto epäonnistui. Tarkista yhteys ja koita uudestaan.', 'error')
        }
      })
      .finally(() => setDeletingId(null))
  }

  const trimmedSearch = filters.search.trim()
  const search = trimmedSearch.toLocaleLowerCase('fi')
  const visibleExpenses = expenses.filter(expense => {
    const description = expense.description.toLocaleLowerCase('fi')
    const matchesSearch = description.includes(search)
    const matchesCategory = !filters.category || expense.category === filters.category
    const matchesMonth = !filters.month || expense.date.startsWith(filters.month)
    return matchesSearch && matchesCategory && matchesMonth
  })
  visibleExpenses.sort((a, b) => b.date.localeCompare(a.date))

  let total = 0
  for (const expense of visibleExpenses) {
    total += expense.amountCents
  }

  const unavailable = loading || loadError

  return (
    <div className="app-shell">
      <main>
        <h1>Menoseuranta</h1>
        <Notification notification={notification} />
        {loadError && (
          <div className="notification error" role="alert">
            Palvelimeen ei saatu yhteyttä. Varmista, että backend on käynnissä.{' '}
            <button type="button" onClick={retryLoading}>Yritä uudelleen</button>
          </div>
        )}
        <ExpenseSummary expenses={visibleExpenses} total={total} unavailable={unavailable} />
        <div className="workspace">
          <ExpenseForm onAdd={addExpense} disabled={unavailable} />
          <section className="panel expenses-panel" aria-labelledby="expenses-title">
            <h2 id="expenses-title">Menot</h2>
            <ExpenseFilters filters={filters} onChange={changeFilter} onReset={resetFilters} />
            <ExpenseTable
              expenses={visibleExpenses}
              total={total}
              loading={loading}
              loadError={loadError}
              deletingId={deletingId}
              onDelete={removeExpense}
              hasExpenses={expenses.length > 0}
            />
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
