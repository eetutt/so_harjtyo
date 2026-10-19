import { formatDate, formatMoney } from '../utils'

const ExpenseTable = ({ expenses, total, loading, loadError, deletingId, onDelete, hasExpenses }) => {
  let emptyMessage = ''
  if (loading) {
    emptyMessage = 'Ladataan menoja…'
  } else if (loadError) {
    emptyMessage = 'Menojen lataaminen epäonnistui. Kokeile yllä olevaa painiketta.'
  } else if (expenses.length === 0 && hasExpenses) {
    emptyMessage = 'Suodattimilla ei löytynyt menoja.'
  } else if (expenses.length === 0) {
    emptyMessage = 'Ei vielä menoja. Lisää ensimmäinen meno lomakkeella.'
  }

  const totalText = loading || loadError ? '—' : formatMoney(total)

  return (
    <div
      className="table-scroll"
      tabIndex={0}
      role="region"
      aria-label="Menotaulukko, vieritä tarvittaessa sivusuunnassa"
    >
      <table aria-busy={loading}>
        <caption>Menot päivämäärän mukaan, uusimmat ensin</caption>
        <thead>
          <tr>
            <th scope="col">Päivämäärä</th>
            <th scope="col">Kuvaus</th>
            <th scope="col">Kategoria</th>
            <th scope="col" className="amount">Summa</th>
            <th scope="col"><span className="sr-only">Toiminnot</span></th>
          </tr>
        </thead>
        <tbody>
          {emptyMessage ? (
            <tr>
              <td colSpan={5} className="empty-state">{emptyMessage}</td>
            </tr>
          ) : expenses.map(expense => {
            const dateText = formatDate(expense.date)
            const amountText = formatMoney(expense.amountCents)
            const deleteLabel = `Poista ${expense.description}, ${amountText}`
            const deleting = deletingId === expense.id

            return (
              <tr key={expense.id}>
                <td className="date-cell">
                  <time dateTime={expense.date}>{dateText}</time>
                </td>
                <td className="description-cell">{expense.description}</td>
                <td><span className="category-tag">{expense.category}</span></td>
                <td className="amount">{amountText}</td>
                <td className="action-cell">
                  <button
                    type="button"
                    className="delete-button"
                    disabled={deletingId !== null}
                    aria-label={deleteLabel}
                    onClick={() => onDelete(expense)}
                  >
                    {deleting ? 'Poistetaan…' : 'Poista'}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" colSpan={3}>Näytettävät menot yhteensä</th>
            <td className="amount">{totalText}</td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

export default ExpenseTable
