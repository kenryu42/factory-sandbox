// Groups transactions by calendar month: { '2026-03': { total, byCategory: { coffee: 1250 } } }
export function summarizeByMonth(transactions) {
  const months = {}
  for (const t of transactions) {
    const d = new Date(t.date)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const month = (months[key] ??= { total: 0, byCategory: {} })
    month.total += t.amount
    month.byCategory[t.category] = (month.byCategory[t.category] ?? 0) + t.amount
  }
  return months
}
