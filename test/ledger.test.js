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

function summaryMonths(...flags) {
  const lines = []
  const code = main(['summary', 'examples/transactions.csv', '--rules', 'examples/rules.json', ...flags], (l) => lines.push(l))
  return { code, lines, months: lines.filter((l) => /^\d{4}-\d{2} /.test(l)).map((l) => l.slice(0, 7)) }
}

test('summary --from keeps months from the bound on, inclusive', () => {
  assert.deepEqual(summaryMonths('--from', '2026-03').months, ['2026-03', '2026-04'])
})

test('summary --to keeps months up to the bound, inclusive', () => {
  assert.deepEqual(summaryMonths('--to', '2026-03').months, ['2026-02', '2026-03'])
})

test('summary --from and --to together select a range', () => {
  assert.deepEqual(summaryMonths('--from', '2026-03', '--to', '2026-03').months, ['2026-03'])
})

test('summary rejects a bad or missing month value with exit code 2', () => {
  for (const flags of [['--from', '2026-13'], ['--to', '2026-3'], ['--from', 'abc'], ['--from']]) {
    const { code, lines } = summaryMonths(...flags)
    assert.equal(code, 2)
    assert.equal(lines.length, 1)
    assert.match(lines[0], /error/)
    if (flags[1]) assert.ok(lines[0].includes(flags[1]))
  }
})
