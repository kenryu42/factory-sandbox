import { categorize } from './categories.js'
import { parseCsv } from './csv.js'
import { parseAmount } from './money.js'

// CSV columns: date (YYYY-MM-DD), description, amount. Spending is positive, refunds are negative.
export function loadTransactions(csvText, rules = []) {
  return parseCsv(csvText).map((row) => {
    const amount = parseAmount(row.amount)
    return {
      date: row.date,
      description: row.description,
      amount,
      category: categorize(row.description, rules, amount),
    }
  })
}
