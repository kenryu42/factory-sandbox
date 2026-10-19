import { categorize } from './categories.js'
import { parseCsv } from './csv.js'
import { parseAmount } from './money.js'

// CSV columns: date (YYYY-MM-DD), description, amount. Spending is positive, refunds are negative.
export function loadTransactions(csvText, rules = []) {
  return parseCsv(csvText).map((row) => ({
    date: row.date,
    description: row.description,
    amount: parseAmount(row.amount),
    category: categorize(row.description, rules),
  }))
}

// Drops a transaction when an earlier one has the same date, description and amount.
// Order is otherwise preserved.
export function dedupe(transactions) {
  const seen = new Set()
  return transactions.filter((t) => {
    const key = JSON.stringify([t.date, t.description, t.amount])
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
