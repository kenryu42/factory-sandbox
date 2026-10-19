import { categorize } from './categories.js'
import { parseCsv } from './csv.js'
import { parseAmount } from './money.js'

// CSV columns: date (YYYY-MM-DD), description, amount. Spending is positive, refunds are negative.
// `amount` is integer cents.
export function loadTransactions(csvText, rules = []) {
  return parseCsv(csvText).map((row) => ({
    date: row.date,
    description: row.description,
    amount: parseAmount(row.amount),
    category: categorize(row.description, rules),
  }))
}
