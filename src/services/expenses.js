const baseUrl = '/api/expenses'

const request = async (url, options) => {
  const response = await fetch(url, options)
  if (!response.ok) {
    let body
    try {
      body = await response.json()
    } catch {
      body = {}
    }
    const error = new Error(body.error || 'Palvelin ei pystynyt käsittelemään pyyntöä.')
    error.status = response.status
    throw error
  }
  if (response.status === 204) return
  return response.json()
}

const getAll = () => request(baseUrl)
const create = expense => {
  const body = JSON.stringify(expense)
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  }
  return request(baseUrl, options)
}

const remove = id => {
  const encodedId = encodeURIComponent(id)
  const url = `${baseUrl}/${encodedId}`
  return request(url, { method: 'DELETE' })
}

export default { getAll, create, remove }
