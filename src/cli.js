import { readFileSync } from 'node:fs'
import { formatMoney } from './money.js'
import { summarizeByMonth } from './summary.js'
import { dedupe, loadTransactions } from './transactions.js'

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
    let transactions = loadTransactions(readFileSync(file, 'utf8'), rules)
    if (args.includes('--dedupe')) transactions = dedupe(transactions)
    const months = summarizeByMonth(transactions)
    for (const [month, { total, byCategory }] of Object.entries(months).sort()) {
      out(`${month}  ${formatMoney(total)}`)
      for (const [category, amount] of Object.entries(byCategory).sort()) {
        out(`  ${category.padEnd(16)} ${formatMoney(amount)}`)
      }
    }
    return 0
  }
  return 0
}
