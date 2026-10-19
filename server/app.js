import express from 'express'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { validateExpense } from '../shared/expenses.js'

export const createApp = store => {
  const app = express()
  app.disable('x-powered-by')
  app.use(express.json({ limit: '10kb' }))

  app.get('/api/expenses', async (request, response) => {
    const expenses = await store.getAll()
    response.set('Cache-Control', 'no-store')
    response.json(expenses)
  })

  app.post('/api/expenses', async (request, response) => {
    const error = validateExpense(request.body)
    if (error) return response.status(400).json({ error })
    const { description, date, category, amountCents } = request.body
    const expense = { description: description.trim(), date, category, amountCents }
    const saved = await store.create(expense)
    response.status(201).json(saved)
  })

  app.delete('/api/expenses/:id', async (request, response) => {
    await store.remove(request.params.id)
    response.status(204).end()
  })

  app.use('/api', (request, response) => response.status(404).json({ error: 'Rajapinnan osoitetta ei löytynyt.' }))

  const distUrl = new URL('../dist/', import.meta.url)
  const dist = fileURLToPath(distUrl)
  const indexFile = resolve(dist, 'index.html')
  if (existsSync(indexFile)) app.use(express.static(dist))
  app.use((request, response) => response.status(404).json({ error: 'Sivua ei löytynyt.' }))

  // Neljäs parametri tarvitaan, jotta Express ohjaa virheet tähän käsittelijään.
  app.use((error, request, response, _next) => {
    const status = error.status || 500
    if (status >= 500) console.error(error)
    let message = error.message
    if (status >= 500) {
      message = 'Tietojen käsittely epäonnistui palvelimella. Yritä uudelleen.'
    } else if (error.type === 'entity.parse.failed') {
      message = 'Pyynnön JSON on virheellinen.'
    } else if (error.type === 'entity.too.large') {
      message = 'Pyyntö on liian suuri.'
    }
    response.status(status).json({ error: message })
  })

  return app
}
