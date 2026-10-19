import assert from 'node:assert/strict'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
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

function runBudget(csv, budgets) {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-'))
  writeFileSync(join(dir, 't.csv'), csv)
  writeFileSync(join(dir, 'b.json'), JSON.stringify(budgets))
  writeFileSync(
    join(dir, 'r.json'),
    JSON.stringify([
      { match: 'Starbucks', category: 'coffee' },
      { match: 'Whole Foods', category: 'groceries' },
      { match: 'Shell', category: 'gas' },
    ]),
  )
  const lines = []
  const code = main(
    ['budget', join(dir, 't.csv'), '--budgets', join(dir, 'b.json'), '--rules', join(dir, 'r.json')],
    (l) => lines.push(l),
  )
  return { code, lines }
}

const HEADER = 'date,description,amount\n'

test('the budget command reports a category over its limit and returns 1', () => {
  const { code, lines } = runBudget(`${HEADER}2026-03-10,Starbucks,24.95\n`, { coffee: 20 })
  assert.deepEqual(lines, ['2026-03 coffee over by $4.95'])
  assert.equal(code, 1)
})

test('the budget command returns 0 when everything is within budget', () => {
  const { code, lines } = runBudget(`${HEADER}2026-03-10,Starbucks,5.00\n`, { coffee: 20 })
  assert.deepEqual(lines, ['All categories within budget.'])
  assert.equal(code, 0)
})

test('the budget command orders by month then category and ignores unbudgeted categories', () => {
  const csv = `${HEADER}2026-04-10,Whole Foods,50\n2026-03-10,Starbucks,30\n2026-03-11,Whole Foods,50\n2026-03-12,Shell,500\n2026-04-12,Starbucks,30\n`
  const { code, lines } = runBudget(csv, { coffee: 20, groceries: 40 })
  assert.deepEqual(lines, [
    '2026-03 coffee over by $10.00',
    '2026-03 groceries over by $10.00',
    '2026-04 coffee over by $10.00',
    '2026-04 groceries over by $10.00',
  ])
  assert.equal(code, 1)
})

test('the budget command does not report spending equal to the limit', () => {
  const { code, lines } = runBudget(`${HEADER}2026-03-10,Starbucks,10.10\n2026-03-11,Starbucks,9.90\n`, { coffee: 20 })
  assert.deepEqual(lines, ['All categories within budget.'])
  assert.equal(code, 0)
})
