import { readFileSync } from 'node:fs'
import { formatMoney } from './money.js'
import { summarizeByMonth } from './summary.js'
import { loadTransactions } from './transactions.js'

function option(args, name) {
  const i = args.indexOf(name)
  return i === -1 ? null : args[i + 1]
}

// Whole-percent shares of the positive categories, summing to exactly 100
// (largest remainder method; ties go to the category that sorts first).
function percentShares(byCategory) {
  const cents = Object.entries(byCategory)
    .map(([name, amount]) => [name, Math.round(amount * 100)])
    .filter(([, c]) => c > 0)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  const total = cents.reduce((sum, [, c]) => sum + c, 0)
  const shares = new Map(cents.map(([name, c]) => [name, Math.floor((c * 100) / total)]))
  let missing = 100 - [...shares.values()].reduce((sum, p) => sum + p, 0)
  const order = cents
    .map(([name, c]) => [name, (c * 100) % total])
    .sort((a, b) => b[1] - a[1]) // stable: name order is kept on ties
  for (const [name] of order) {
    if (missing-- <= 0) break
    shares.set(name, shares.get(name) + 1)
  }
  return shares
}

// Returns the process exit code. Output goes through `out` so tests can capture it.
export function main(args, out = console.log) {
  const [command, file] = args
  if (command === 'summary') {
    const rulesFile = option(args, '--rules')
    const rules = rulesFile ? JSON.parse(readFileSync(rulesFile, 'utf8')) : []
    const months = summarizeByMonth(loadTransactions(readFileSync(file, 'utf8'), rules))
    const percent = args.includes('--percent')
    for (const [month, { total, byCategory }] of Object.entries(months).sort()) {
      out(`${month}  ${formatMoney(total)}`)
      const shares = percent ? percentShares(byCategory) : new Map()
      for (const [category, amount] of Object.entries(byCategory).sort()) {
        const share = shares.has(category) ? `  ${shares.get(category)}%` : ''
        out(`  ${category.padEnd(16)} ${formatMoney(amount)}${share}`)
      }
    }
    return 0
  }
  return 0
}
