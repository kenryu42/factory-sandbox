import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findRecurring } from '../src/recurring.js'

const tx = (date, description, amount) => ({ date, description, amount })

test('same description and amount in two months is recurring, months sorted', () => {
  assert.deepEqual(findRecurring([tx('2026-03-05', 'Netflix', 15), tx('2026-01-05', 'Netflix', 15)]), [
    { description: 'Netflix', amount: 15, months: ['2026-01', '2026-03'] },
  ])
})

test('two charges in the same month are not recurring', () => {
  assert.deepEqual(findRecurring([tx('2026-01-05', 'Netflix', 15), tx('2026-01-20', 'Netflix', 15)]), [])
})

test('a different amount is not grouped', () => {
  assert.deepEqual(findRecurring([tx('2026-01-05', 'Netflix', 15), tx('2026-02-05', 'Netflix', 16)]), [])
})

test('refunds are never recurring', () => {
  assert.deepEqual(findRecurring([tx('2026-01-05', 'Refund', -15), tx('2026-02-05', 'Refund', -15)]), [])
})

test('repeats within a month are listed once', () => {
  const [entry] = findRecurring([
    tx('2026-01-05', 'Gym', 30),
    tx('2026-01-25', 'Gym', 30),
    tx('2026-02-05', 'Gym', 30),
  ])
  assert.deepEqual(entry.months, ['2026-01', '2026-02'])
})

test('entries are sorted by description', () => {
  const result = findRecurring([
    tx('2026-01-01', 'Spotify', 10),
    tx('2026-02-01', 'Spotify', 10),
    tx('2026-01-01', 'Gym', 30),
    tx('2026-02-01', 'Gym', 30),
  ])
  assert.deepEqual(result.map((r) => r.description), ['Gym', 'Spotify'])
})

test('empty input returns an empty list', () => {
  assert.deepEqual(findRecurring([]), [])
})
