import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { categorize } from '../src/categories.js'
import { main } from '../src/cli.js'
import { parseCsv } from '../src/csv.js'
import { formatMoney, parseAmount } from '../src/money.js'
import { summarizeByMonth } from '../src/summary.js'
import { dedupe } from '../src/transactions.js'

test('parseCsv maps each row to the header', () => {
  assert.deepEqual(parseCsv('date,description,amount\n2026-03-02,Starbucks,4.95\n'), [
    { date: '2026-03-02', description: 'Starbucks', amount: '4.95' },
  ])
})

test('parseAmount reads dollar strings', () => {
  assert.equal(parseAmount('$1,450.00'), 1450)
})

test('formatMoney shows two decimals', () => {
  assert.equal(formatMoney(4.5), '$4.50')
})

test('categorize uses the first matching rule', () => {
  const rules = [{ match: 'Whole Foods', category: 'groceries' }]
  assert.equal(categorize('Whole Foods Market', rules), 'groceries')
  assert.equal(categorize('Shell', rules), 'uncategorized')
})

test('dedupe drops later duplicates and keeps order', () => {
  const rows = [
    { date: '2026-03-15', description: 'Coffee', amount: 5 },
    { date: '2026-03-20', description: 'Lunch', amount: 10 },
    { date: '2026-03-15', description: 'Coffee', amount: 5 },
    { date: '2026-03-15', description: 'Coffee', amount: 6 },
  ]
  assert.deepEqual(dedupe(rows), [
    { date: '2026-03-15', description: 'Coffee', amount: 5 },
    { date: '2026-03-20', description: 'Lunch', amount: 10 },
    { date: '2026-03-15', description: 'Coffee', amount: 6 },
  ])
})

test('summarizeByMonth totals each month', () => {
  const months = summarizeByMonth([
    { date: '2026-03-15', amount: 10, category: 'coffee' },
    { date: '2026-03-20', amount: 5, category: 'food' },
  ])
  assert.deepEqual(months, { '2026-03': { total: 15, byCategory: { coffee: 10, food: 5 } } })
})

test('the summary command applies --dedupe before summarizing', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-'))
  const file = join(dir, 'transactions.csv')
  writeFileSync(file, 'date,description,amount\n2026-03-01,Coffee,5.00\n2026-03-01,Coffee,5.00\n')
  const lines = []
  const code = main(['summary', file, '--dedupe'], (l) => lines.push(l))
  rmSync(dir, { recursive: true, force: true })
  assert.equal(code, 0)
  assert.ok(lines.includes('2026-03  $5.00'))
  assert.ok(!lines.some((l) => l.includes('$10.00')))
})

test('the summary command prints each month with its categories', () => {
  const lines = []
  const code = main(['summary', 'examples/transactions.csv', '--rules', 'examples/rules.json'], (l) => lines.push(l))
  assert.equal(code, 0)
  assert.ok(lines.includes('2026-04  $1465.49'))
  assert.ok(lines.includes('  subscriptions    $15.49'))
})
