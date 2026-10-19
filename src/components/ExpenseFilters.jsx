import { categories } from '../../shared/expenses'

const ExpenseFilters = ({ filters, onChange, onReset }) => (
  <div className="filters" role="search" aria-label="Menojen suodatus">
    <div className="search-field">
      <label htmlFor="search">Hae menoja</label>
      <input
        id="search"
        type="search"
        placeholder="Hae kuvauksella…"
        value={filters.search}
        onChange={event => onChange('search', event.target.value)}
      />
    </div>
    <div>
      <label htmlFor="filter-category">Kategoria</label>
      <select
        id="filter-category"
        value={filters.category}
        onChange={event => onChange('category', event.target.value)}
      >
        <option value="">Kaikki kategoriat</option>
        {categories.map(item => <option key={item}>{item}</option>)}
      </select>
    </div>
    <div>
      <label htmlFor="month">Kuukausi</label>
      <input
        id="month"
        type="month"
        value={filters.month}
        onChange={event => onChange('month', event.target.value)}
      />
    </div>
    <button type="button" className="text-button reset-button" onClick={onReset}>
      Tyhjennä suodattimet
    </button>
  </div>
)

export default ExpenseFilters
