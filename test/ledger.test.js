import assert from 'node:assert/strict'
import { test } from 'node:test'
import { categorize } from '../src/categories.js'
import { main } from '../src/cli.js'
import { parseCsv } from '../src/csv.js'
import { formatMoney, parseAmount } from '../src/money.js'
import { summarizeByMonth } from '../src/summary.js'

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

test('summarizeByMonth totals each month', () => {
  const months = summarizeByMonth([
    { date: '2026-03-15', amount: 10, category: 'coffee' },
    { date: '2026-03-20', amount: 5, category: 'food' },
  ])
  assert.deepEqual(months, { '2026-03': { total: 15, byCategory: { coffee: 10, food: 5 } } })
})

test('the summary command prints each month with its categories', () => {
  const lines = []
  const code = main(['summary', 'examples/transactions.csv', '--rules', 'examples/rules.json'], (l) => lines.push(l))
  assert.equal(code, 0)
  assert.ok(lines.includes('2026-04  $1465.49'))
  assert.ok(lines.includes('  subscriptions    $15.49'))
})

test('the summary command prints a single JSON line with --json', () => {
  const lines = []
  const code = main(['summary', 'examples/transactions.csv', '--json', '--rules', 'examples/rules.json'], (l) => lines.push(l))
  assert.equal(code, 0)
  assert.equal(lines.length, 1)
  assert.deepEqual(JSON.parse(lines[0]), {
    '2026-02': { total: 6.4, byCategory: { coffee: 6.4 } },
    '2026-03': {
      total: 1540.61,
      byCategory: { housing: 1450, coffee: 4.95, groceries: 70.17, subscriptions: 15.49 },
    },
    '2026-04': { total: 1465.49, byCategory: { housing: 1450, subscriptions: 15.49 } },
  })
})

test('the summary command supports --json without --rules', () => {
  const lines = []
  const code = main(['summary', 'examples/transactions.csv', '--json'], (l) => lines.push(l))
  assert.equal(code, 0)
  assert.equal(lines.length, 1)
  assert.equal(JSON.parse(lines[0])['2026-02'].byCategory.uncategorized, 6.4)
})
