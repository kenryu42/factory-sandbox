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

test('the budget command reports overspent categories in order', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-budget-'))
  const budgets = join(dir, 'budgets.json')
  writeFileSync(budgets, JSON.stringify({ coffee: 3, groceries: 100 }))
  const lines = []
  try {
    const code = main(['budget', 'examples/transactions.csv', '--budgets', budgets, '--rules', 'examples/rules.json'], (l) => lines.push(l))
    assert.equal(code, 1)
    assert.deepEqual(lines, ['2026-02 coffee over by $3.40', '2026-03 coffee over by $1.95'])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the budget command reports when all categories are within budget', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-budget-'))
  const budgets = join(dir, 'budgets.json')
  writeFileSync(budgets, JSON.stringify({ coffee: 20, groceries: 300 }))
  const lines = []
  try {
    const code = main(['budget', 'examples/transactions.csv', '--budgets', budgets, '--rules', 'examples/rules.json'], (l) => lines.push(l))
    assert.equal(code, 0)
    assert.deepEqual(lines, ['All categories within budget.'])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the budget command does not report over when spending exactly equals the limit', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-budget-'))
  const budgets = join(dir, 'budgets.json')
  const rules = join(dir, 'rules.json')
  const transactions = join(dir, 'transactions.csv')
  writeFileSync(budgets, JSON.stringify({ coffee: 0.3 }))
  writeFileSync(rules, JSON.stringify([{ match: 'Starbucks', category: 'coffee' }]))
  writeFileSync(transactions, 'date,description,amount\n2026-03-01,Starbucks,0.10\n2026-03-02,Starbucks,0.20\n')
  const lines = []
  try {
    const code = main(['budget', transactions, '--budgets', budgets, '--rules', rules], (l) => lines.push(l))
    assert.equal(code, 0)
    assert.deepEqual(lines, ['All categories within budget.'])
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
})

test('the budget command requires --budgets', () => {
  const lines = []
  const code = main(['budget', 'examples/transactions.csv'], (l) => lines.push(l))
  assert.equal(code, 1)
  assert.deepEqual(lines, ['Missing required --budgets <budgets.json>'])
})
