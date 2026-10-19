import assert from 'node:assert/strict'
import { test } from 'node:test'
import { categorize } from '../src/categories.js'
import { main } from '../src/cli.js'
import { parseCsv } from '../src/csv.js'
import { formatMoney, parseAmount } from '../src/money.js'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { findOverBudget } from '../src/budget.js'
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

test('findOverBudget reports only strictly-over budgeted categories, in order', () => {
  const months = {
    '2026-04': { total: 0, byCategory: { coffee: 9 } },
    '2026-03': { total: 0, byCategory: { food: 50, coffee: 10.5, rent: 900, tea: 0.1 + 0.2, gym: 5 } },
  }
  assert.deepEqual(findOverBudget(months, { tea: 0.3, coffee: 10, food: 50, gym: 20, nothing: 1 }), [
    { month: '2026-03', category: 'coffee', over: 0.5 },
  ])
  assert.deepEqual(
    findOverBudget(months, { coffee: 5, food: 10 }).map((h) => `${h.month} ${h.category}`),
    ['2026-03 coffee', '2026-03 food', '2026-04 coffee'],
  )
})

test('the budget command reports overspending with exit code 1', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-'))
  const file = join(dir, 'b.json')
  writeFileSync(file, '{"coffee":2}')
  const lines = []
  const code = main(['budget', 'examples/transactions.csv', '--budgets', file, '--rules', 'examples/rules.json'], (l) => lines.push(l))
  assert.equal(code, 1)
  assert.ok(lines.length > 0 && lines.every((l) => / coffee over by \$/.test(l)))
  writeFileSync(file, '{"coffee":20}')
  const ok = []
  assert.equal(main(['budget', 'examples/transactions.csv', '--budgets', file, '--rules', 'examples/rules.json'], (l) => ok.push(l)), 0)
  assert.deepEqual(ok, ['All categories within budget.'])
})

test('the budget command requires --budgets', () => {
  assert.throws(() => main(['budget', 'examples/transactions.csv']), /--budgets is required/)
})
