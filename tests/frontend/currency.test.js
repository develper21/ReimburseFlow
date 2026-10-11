import assert from 'node:assert/strict'
import test from 'node:test'
import { convertCurrency, formatCurrency, getExchangeRates } from '../../src/lib/currency.js'

test('formats supported currencies with their symbol and two decimal places', () => {
  assert.equal(formatCurrency(1234.5, 'USD'), '$ 1,234.50')
  assert.equal(formatCurrency(1200, 'INR'), '₹ 1,200.00')
})

test('formats unknown currency codes without losing the code', () => {
  assert.equal(formatCurrency(25, 'XYZ'), 'XYZ 25.00')
})

test('returns the amount directly when converting to the same currency', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = () => {
    throw new Error('fetch should not be called')
  }

  try {
    assert.equal(await convertCurrency(25.5, 'USD', 'USD'), 25.5)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('converts currencies using the fetched exchange rate', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => ({
    ok: true,
    json: async () => ({ rates: { INR: 83.25 } }),
    url
  })

  try {
    assert.equal(await convertCurrency(2, 'USD', 'INR'), 166.5)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('rejects exchange-rate requests when the API responds with an error', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => ({ ok: false })
  const originalConsoleError = console.error
  console.error = () => {}

  try {
    await assert.rejects(getExchangeRates('USD'), /Failed to fetch exchange rates/)
  } finally {
    globalThis.fetch = originalFetch
    console.error = originalConsoleError
  }
})
