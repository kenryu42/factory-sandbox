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
  assert.equal(parseAmount('$1,450.00'), 145000)
  assert.equal(parseAmount('$4.95'), 495)
  assert.equal(parseAmount('-12'), -1200)
  assert.equal(parseAmount('.5'), 50)
  assert.throws(() => parseAmount('abc'), /not an amount/)
  assert.throws(() => parseAmount(''), /not an amount/)
})

test('formatMoney shows two decimals', () => {
  assert.equal(formatMoney(450), '$4.50')
  assert.equal(formatMoney(495), '$4.95')
  assert.equal(formatMoney(5), '$0.05')
  assert.equal(formatMoney(0), '$0.00')
  assert.equal(formatMoney(-450), '$-4.50')
})

test('categorize uses the first matching rule', () => {
  const rules = [{ match: 'Whole Foods', category: 'groceries' }]
  assert.equal(categorize('Whole Foods Market', rules), 'groceries')
  assert.equal(categorize('Shell', rules), 'uncategorized')
})

test('summarizeByMonth totals each month', () => {
  const months = summarizeByMonth([
    { date: '2026-03-15', amount: 1000, category: 'coffee' },
    { date: '2026-03-20', amount: 500, category: 'food' },
  ])
  assert.deepEqual(months, { '2026-03': { total: 1500, byCategory: { coffee: 1000, food: 500 } } })
})

test('cents do not drift', () => {
  assert.equal(parseAmount('0.10') + parseAmount('0.20'), 30)
  const months = summarizeByMonth([
    { date: '2026-03-15', amount: parseAmount('0.10'), category: 'a' },
    { date: '2026-03-16', amount: parseAmount('0.20'), category: 'a' },
  ])
  assert.equal(months['2026-03'].total, 30)
})

test('the summary command prints each month with its categories', () => {
  const lines = []
  const code = main(['summary', 'examples/transactions.csv', '--rules', 'examples/rules.json'], (l) => lines.push(l))
  assert.equal(code, 0)
  assert.ok(lines.includes('2026-04  $1465.49'))
  assert.ok(lines.includes('  subscriptions    $15.49'))
})
