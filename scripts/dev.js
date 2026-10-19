import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const rootUrl = new URL('../', import.meta.url)
const root = fileURLToPath(rootUrl)
const options = { cwd: root, stdio: 'inherit' }
const server = spawn(process.execPath, ['--watch', 'server/index.js'], options)
const client = spawn(process.execPath, ['node_modules/vite/bin/vite.js'], options)
const children = [server, client]
let stopping = false

const stop = code => {
  if (stopping) return
  stopping = true
  for (const child of children) {
    child.kill()
  }
  process.exitCode = code
}

const handleError = error => {
  console.error(error.message)
  stop(1)
}

const handleExit = code => {
  stop(code || 0)
}

for (const child of children) {
  child.on('error', handleError)
  child.on('exit', handleExit)
}

process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
