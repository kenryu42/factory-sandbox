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

test('summary --json prints one line of JSON with amounts rounded to 2 decimals', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-'))
  const file = join(dir, 'tx.csv')
  const rulesFile = join(dir, 'rules.json')
  writeFileSync(
    file,
    'date,description,amount\n2026-03-10,Tea,0.10\n2026-03-11,Tea,0.10\n2026-03-12,Tea,0.10\n2026-03-13,Rent,0.70\n',
  )
  writeFileSync(rulesFile, JSON.stringify([{ match: 'Tea', category: 'drinks' }]))

  const run = (args) => {
    const lines = []
    assert.equal(main(args, (l) => lines.push(l)), 0)
    assert.equal(lines.length, 1)
    return JSON.parse(lines[0])
  }

  assert.deepEqual(run(['summary', file, '--json']), {
    '2026-03': { total: 1, byCategory: { uncategorized: 1 } },
  })
  assert.deepEqual(run(['summary', file, '--json', '--rules', rulesFile]), {
    '2026-03': { total: 1, byCategory: { drinks: 0.3, uncategorized: 0.7 } },
  })
})
