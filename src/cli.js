import { readFileSync } from 'node:fs'
import { findOverBudget } from './budget.js'
import { formatMoney } from './money.js'
import { summarizeByMonth } from './summary.js'
import { loadTransactions } from './transactions.js'

function option(args, name) {
  const i = args.indexOf(name)
  return i === -1 ? null : args[i + 1]
}

function load(file, args) {
  const rulesFile = option(args, '--rules')
  const rules = rulesFile ? JSON.parse(readFileSync(rulesFile, 'utf8')) : []
  return summarizeByMonth(loadTransactions(readFileSync(file, 'utf8'), rules))
}

// Returns the process exit code. Output goes through `out` so tests can capture it.
export function main(args, out = console.log) {
  const [command, file] = args
  if (command === 'summary') {
    const months = load(file, args)
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
    if (!budgetsFile) throw new Error('--budgets is required')
    const budgets = JSON.parse(readFileSync(budgetsFile, 'utf8'))
    const hits = findOverBudget(load(file, args), budgets)
    for (const { month, category, over } of hits) out(`${month} ${category} over by ${formatMoney(over)}`)
    if (hits.length === 0) out('All categories within budget.')
    return hits.length > 0 ? 1 : 0
  }
  return 0
}
