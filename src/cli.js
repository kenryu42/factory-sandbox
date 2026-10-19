import { readFileSync } from 'node:fs'
import { formatMoney } from './money.js'
import { summarizeByMonth } from './summary.js'
import { loadTransactions } from './transactions.js'

function option(args, name) {
  const i = args.indexOf(name)
  return i === -1 ? null : args[i + 1]
}

// Returns the process exit code. Output goes through `out` so tests can capture it.
export function main(args, out = console.log) {
  const [command, file] = args
  if (command === 'summary') {
    const rulesFile = option(args, '--rules')
    const rules = rulesFile ? JSON.parse(readFileSync(rulesFile, 'utf8')) : []
    const months = summarizeByMonth(loadTransactions(readFileSync(file, 'utf8'), rules))
    for (const [month, { total, byCategory }] of Object.entries(months).sort()) {
      out(`${month}  ${formatMoney(total)}`)
      for (const [category, amount] of Object.entries(byCategory).sort()) {
        out(`  ${category.padEnd(16)} ${formatMoney(amount)}`)
      }
    }
    return 0
  }
  if (command === 'budget') {
    const budgetsFile = option(args, '--budgets')
    if (!budgetsFile) throw new Error('budget requires --budgets <budgets.json>')
    const budgets = JSON.parse(readFileSync(budgetsFile, 'utf8'))
    const rulesFile = option(args, '--rules')
    const rules = rulesFile ? JSON.parse(readFileSync(rulesFile, 'utf8')) : []
    const months = summarizeByMonth(loadTransactions(readFileSync(file, 'utf8'), rules))
    let anyOver = false
    for (const [month, { byCategory }] of Object.entries(months).sort()) {
      for (const category of Object.keys(budgets).sort()) {
        // Compare in whole cents to avoid floating-point noise.
        const overCents = Math.round((byCategory[category] ?? 0) * 100) - Math.round(budgets[category] * 100)
        if (overCents > 0) {
          anyOver = true
          out(`${month} ${category} over by ${formatMoney(overCents / 100)}`)
        }
      }
    }
    if (anyOver) return 1
    out('All categories within budget.')
    return 0
  }
  return 0
}
