import assert from 'node:assert/strict'
import { test } from 'node:test'
import { findRecurring } from '../src/recurring.js'

test('findRecurring finds same description and amount in different months', () => {
  const t = (date, description, amount) => ({ date, description, amount })
  assert.deepEqual(
    findRecurring([
      t('2026-03-05', 'Spotify', 9.99),
      t('2026-01-05', 'Spotify', 9.99),
      t('2026-01-20', 'Spotify', 9.99),
      t('2026-02-01', 'Netflix', 15),
      t('2026-03-01', 'Netflix', 16),
      t('2026-01-02', 'Gym', 30),
      t('2026-01-09', 'Gym', 30),
      t('2026-01-03', 'Refund', -5),
      t('2026-02-03', 'Refund', -5),
    ]),
    [{ description: 'Spotify', amount: 9.99, months: ['2026-01', '2026-03'] }],
  )
})
