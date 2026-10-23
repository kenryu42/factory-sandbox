import { readFileSync } from 'node:fs'
import { formatMoney } from './money.js'
import { summarizeByMonth } from './summary.js'
import { loadTransactions } from './transactions.js'

function option(args, name) {
  const i = args.indexOf(name)
  return i === -1 ? null : args[i + 1]
}

const USAGE = `Usage: ledger <command> [options]

Commands:
  summary <file> [--rules <file>]  Print monthly totals by category
  help                             Show this help

Options:
  -h, --help                       Show this help`

// Returns the process exit code. Output goes through `out` so tests can capture it.
export function main(args, out = console.log, err = console.error) {
  const [command, file] = args
  if (command === undefined || command === '--help' || command === '-h' || command === 'help') {
    out(USAGE)
    return 0
  }
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
  err(`ledger: unknown command '${command}'`)
  err(USAGE)
  return 2
}
