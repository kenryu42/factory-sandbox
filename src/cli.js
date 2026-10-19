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
    const rulesFile = option(args, '--rules')
    const budgets = budgetsFile ? JSON.parse(readFileSync(budgetsFile, 'utf8')) : {}
    const rules = rulesFile ? JSON.parse(readFileSync(rulesFile, 'utf8')) : []
    const months = summarizeByMonth(loadTransactions(readFileSync(file, 'utf8'), rules))
    let over = false
    for (const [month, { byCategory }] of Object.entries(months).sort()) {
      for (const [category, limit] of Object.entries(budgets).sort()) {
        const spent = byCategory[category] ?? 0
        if (spent > limit) {
          out(`${month} ${category} over by ${formatMoney(spent - limit)}`)
          over = true
        }
      }
    }
    if (!over) out('All categories within budget.')
    return over ? 1 : 0
  }
  return 0
}
