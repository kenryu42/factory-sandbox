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

test('--percent adds shares that sum to 100 and skips non-positive categories', () => {
  const dir = mkdtempSync(join(tmpdir(), 'ledger-'))
  const csv = join(dir, 't.csv')
  const rules = join(dir, 'rules.json')
  writeFileSync(
    csv,
    'date,description,amount\n2026-03-01,aaa,10.00\n2026-03-02,bbb,10.00\n2026-03-03,ccc,10.00\n2026-03-04,ddd,-5.00\n2026-03-05,eee,0.00\n',
  )
  writeFileSync(
    rules,
    JSON.stringify(['aaa', 'bbb', 'ccc', 'ddd', 'eee'].map((m) => ({ match: m, category: m }))),
  )
  const run = (...extra) => {
    const lines = []
    main(['summary', csv, '--rules', rules, ...extra], (l) => lines.push(l))
    return lines
  }
  const plain = run()
  const withPercent = run('--percent')
  assert.ok(withPercent.includes('  aaa              $10.00  34%'))
  assert.ok(withPercent.includes('  bbb              $10.00  33%'))
  assert.ok(withPercent.includes('  ccc              $10.00  33%'))
  assert.ok(withPercent.includes('  ddd              $-5.00'))
  assert.ok(withPercent.includes('  eee              $0.00'))
  assert.deepEqual(
    withPercent.map((l) => l.replace(/  \d+%$/, '')),
    plain,
  )
})
