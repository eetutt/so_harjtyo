import { readFile, mkdir, writeFile, rename } from 'node:fs/promises'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'
import { validateExpense } from '../shared/expenses.js'

export const createStore = file => {
  let queue = Promise.resolve()

  const read = async () => {
    try {
      const content = await readFile(file, 'utf8')
      const expenses = JSON.parse(content)
      if (!Array.isArray(expenses)) {
        throw new Error('Tallennustiedoston sisältö on virheellinen.')
      }
      for (const expense of expenses) {
        const validationError = validateExpense(expense)
        if (validationError || typeof expense.id !== 'string') {
          throw new Error('Tallennustiedoston sisältö on virheellinen.')
        }
      }
      return expenses
    } catch (error) {
      if (error.code === 'ENOENT') return []
      throw error
    }
  }

  const mutate = operation => {
    const result = queue.then(async () => {
      const expenses = await read()
      const value = operation(expenses)
      const directory = dirname(file)
      await mkdir(directory, { recursive: true })
      const temporary = `${file}.tmp`
      const content = JSON.stringify(expenses, null, 2) + '\n'
      await writeFile(temporary, content, 'utf8')
      await rename(temporary, file)
      return value
    })
    // Yhden tallennusvirheen ei pidä estää myöhempiä tallennusyrityksiä.
    queue = result.catch(() => {})
    return result
  }

  const getAll = () => queue.then(read)

  const create = expense => {
    const addExpense = expenses => {
      const saved = { id: randomUUID(), ...expense }
      expenses.push(saved)
      return saved
    }
    return mutate(addExpense)
  }

  const remove = id => {
    const deleteExpense = expenses => {
      const index = expenses.findIndex(expense => expense.id === id)
      if (index === -1) {
        const error = new Error('Menoa ei löytynyt. Se on ehkä jo poistettu.')
        error.status = 404
        throw error
      }
      expenses.splice(index, 1)
    }
    return mutate(deleteExpense)
  }

  return { getAll, create, remove }
}
