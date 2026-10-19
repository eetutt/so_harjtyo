import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { once } from 'node:events'
import { parseAmount, isValidDate } from '../shared/expenses.js'
import { createStore } from '../server/store.js'
import { createApp } from '../server/app.js'

test('eurosyöte muunnetaan tarkasti senteiksi ja virheelliset summat hylätään', () => {
  const commaAmount = parseAmount('12,34')
  const smallAmount = parseAmount('0.01')
  const trimmedAmount = parseAmount(' 20 ')
  assert.equal(commaAmount, 1234)
  assert.equal(smallAmount, 1)
  assert.equal(trimmedAmount, 2000)
  for (const amount of ['0', '-1', '1,234', '1e3', '', 'Infinity', '10000000']) {
    const parsedAmount = parseAmount(amount)
    assert.equal(parsedAmount, null)
  }
  const leapDay = isValidDate('2024-02-29')
  const invalidLeapDay = isValidDate('2025-02-29')
  const invalidMonth = isValidDate('2026-13-01')
  assert.equal(leapDay, true)
  assert.equal(invalidLeapDay, false)
  assert.equal(invalidMonth, false)
})

test('rajapinta validoi, tallentaa pysyvästi ja poistaa menot', async t => {
  const prefix = join(tmpdir(), 'menoseuranta-')
  const directory = await mkdtemp(prefix)
  const file = join(directory, 'expenses.json')
  const store = createStore(file)
  const app = createApp(store)
  const server = app.listen(0, '127.0.0.1')
  await once(server, 'listening')
  t.after(async () => {
    await new Promise(resolve => server.close(resolve))
    await rm(directory, { recursive: true, force: true })
  })
  const address = server.address()
  const base = `http://127.0.0.1:${address.port}/api/expenses`
  const post = body => {
    const json = JSON.stringify(body)
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: json,
    }
    return fetch(base, options)
  }
  const initialResponse = await fetch(base)
  const initialExpenses = await initialResponse.json()
  assert.deepEqual(initialExpenses, [])
  const expense = { description: 'Ruokaostokset', date: '2026-10-19', category: 'Ruoka', amountCents: 1234 }
  const invalidExpenses = [
    { ...expense, amountCents: 1.5 },
    { ...expense, category: 'Tuntematon' },
    { ...expense, date: '2026-02-30' },
    { ...expense, description: '  ' },
  ]
  for (const invalid of invalidExpenses) {
    const invalidResponse = await post(invalid)
    assert.equal(invalidResponse.status, 400)
  }
  const response = await post({ ...expense, id: 'ei-saa-käyttää', extra: 'ei-tallenneta' })
  assert.equal(response.status, 201)
  const saved = await response.json()
  assert.notEqual(saved.id, 'ei-saa-käyttää')
  assert.equal(saved.extra, undefined)
  const reopenedStore = createStore(file)
  const savedExpenses = await reopenedStore.getAll()
  assert.deepEqual(savedExpenses, [saved])

  const deleteUrl = `${base}/${saved.id}`
  const deleteResponse = await fetch(deleteUrl, { method: 'DELETE' })
  const repeatedDelete = await fetch(deleteUrl, { method: 'DELETE' })
  assert.equal(deleteResponse.status, 204)
  assert.equal(repeatedDelete.status, 404)
  const remainingExpenses = await reopenedStore.getAll()
  assert.deepEqual(remainingExpenses, [])
})

test('samanaikaiset kirjoitukset säilyvät ja rikkinäinen tiedosto ei ylikirjoitu', async t => {
  const prefix = join(tmpdir(), 'menoseuranta-')
  const directory = await mkdtemp(prefix)
  t.after(() => rm(directory, { recursive: true, force: true }))
  const file = join(directory, 'expenses.json')
  const store = createStore(file)
  const expense = { description: 'Testimeno', date: '2026-10-19', category: 'Muut', amountCents: 10 }
  const requests = []
  for (let index = 0; index < 15; index += 1) {
    const request = store.create(expense)
    requests.push(request)
  }
  await Promise.all(requests)
  const reopenedStore = createStore(file)
  const savedExpenses = await reopenedStore.getAll()
  assert.equal(savedExpenses.length, 15)
  await writeFile(file, 'rikkinäinen json')
  const failedWrite = store.create(expense)
  await assert.rejects(failedWrite)
})
