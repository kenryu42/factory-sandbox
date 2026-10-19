// Groups transactions by calendar month: { '2026-03': { total, byCategory: { coffee: 12.5 } } }
export function summarizeByMonth(transactions) {
  const months = {}
  for (const t of transactions) {
    const key = String(t.date).slice(0, 7)
    const month = (months[key] ??= { total: 0, byCategory: {} })
    month.total += t.amount
    month.byCategory[t.category] = (month.byCategory[t.category] ?? 0) + t.amount
  }
  return months
}
