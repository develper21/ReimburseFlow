import assert from 'node:assert/strict'
import test from 'node:test'
import { parseAmount, parseDate, parseMerchant } from '../../src/lib/ocr.js'

test('extracts the largest currency amount from receipt text', () => {
  assert.equal(parseAmount('Subtotal $8.99\nTotal $15.00'), '15')
  assert.equal(parseAmount('Total INR 1,234.50'), '1234.5')
})

test('returns null when receipt text has no recognizable amount', () => {
  assert.equal(parseAmount('Thank you for your visit'), null)
})

test('parses ISO, numeric, and named-month receipt dates', () => {
  assert.equal(parseDate('Date: 2026-10-11'), '2026-10-11')
  assert.equal(parseDate('Receipt: 5/2/2025'), '2025-02-05')
  assert.equal(parseDate('Receipt: 15 Mar 2024'), '2024-03-15')
})

test('returns the first non-empty merchant line, capped at 50 characters', () => {
  assert.equal(parseMerchant('\n  Acme Cafe  \nTotal $12.00'), 'Acme Cafe')
  assert.equal(parseMerchant('A'.repeat(60)).length, 50)
})

test('returns null when receipt text contains no merchant line', () => {
  assert.equal(parseMerchant('\n  \n'), null)
})
