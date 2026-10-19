import { createApp } from './app.js'
import { createStore } from './store.js'
import { fileURLToPath } from 'node:url'

const defaultFileUrl = new URL('./data/expenses.json', import.meta.url)
const defaultFile = fileURLToPath(defaultFileUrl)
const file = process.env.DATA_FILE || defaultFile
const port = Number(process.env.PORT || 3001)
const host = process.env.HOST || '127.0.0.1'
const store = createStore(file)
const app = createApp(store)
const server = app.listen(port, host, () => {
  console.log(`Menoseurannan palvelin: http://${host}:${port}`)
})
server.on('error', error => {
  console.error(`Palvelimen käynnistys epäonnistui: ${error.message}`)
  process.exitCode = 1
})
