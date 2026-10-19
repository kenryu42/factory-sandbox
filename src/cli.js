import { readFileSync } from 'node:fs'
import { formatMoney } from './money.js'
import { summarizeByMonth } from './summary.js'
import { loadTransactions } from './transactions.js'

function option(args, name) {
  const i = args.indexOf(name)
  return i === -1 ? null : args[i + 1]
}

function monthOption(args, name) {
  const value = option(args, name)
  if (value === null) return null
  if (!/^\d{4}-\d{2}$/.test(value)) {
    return { error: `${name} must be YYYY-MM, got: ${value}` }
  }
  return value
}

// Returns the process exit code. Output goes through `out` so tests can capture it.
export function main(args, out = console.log) {
  const [command, file] = args
  if (command === 'summary') {
    const from = monthOption(args, '--from')
    if (from?.error) {
      out(from.error)
      return 2
    }
    const to = monthOption(args, '--to')
    if (to?.error) {
      out(to.error)
      return 2
    }

    const rulesFile = option(args, '--rules')
    const rules = rulesFile ? JSON.parse(readFileSync(rulesFile, 'utf8')) : []
    const months = summarizeByMonth(loadTransactions(readFileSync(file, 'utf8'), rules))
    for (const [month, { total, byCategory }] of Object.entries(months).sort()) {
      if (from && month < from) continue
      if (to && month > to) continue
      out(`${month}  ${formatMoney(total)}`)
      for (const [category, amount] of Object.entries(byCategory).sort()) {
        out(`  ${category.padEnd(16)} ${formatMoney(amount)}`)
      }
    }
    return 0
  }
  return 0
}
