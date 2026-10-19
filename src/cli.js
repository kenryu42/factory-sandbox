import { readFileSync } from 'node:fs'
import { formatMoney } from './money.js'
import { summarizeByMonth } from './summary.js'
import { loadTransactions } from './transactions.js'

function option(args, name) {
  const i = args.indexOf(name)
  return i === -1 ? null : args[i + 1]
}

const MONTH = /^\d{4}-(0[1-9]|1[0-2])$/

// Returns the process exit code. Output goes through `out` so tests can capture it.
export function main(args, out = console.log) {
  const [command, file] = args
  if (command === 'summary') {
    const range = {}
    for (const name of ['--from', '--to']) {
      const value = option(args, name)
      if (args.includes(name) && !MONTH.test(value ?? '')) {
        out(`error: invalid ${name} value '${value ?? ''}', expected YYYY-MM`)
        return 2
      }
      range[name] = value
    }
    const rulesFile = option(args, '--rules')
    const rules = rulesFile ? JSON.parse(readFileSync(rulesFile, 'utf8')) : []
    const months = summarizeByMonth(loadTransactions(readFileSync(file, 'utf8'), rules))
    for (const [month, { total, byCategory }] of Object.entries(months).sort()) {
      if ((range['--from'] && month < range['--from']) || (range['--to'] && month > range['--to'])) continue
      out(`${month}  ${formatMoney(total)}`)
      for (const [category, amount] of Object.entries(byCategory).sort()) {
        out(`  ${category.padEnd(16)} ${formatMoney(amount)}`)
      }
    }
    return 0
  }
  return 0
}
