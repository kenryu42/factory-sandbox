// Groups transactions by calendar month: { '2026-03': { total, byCategory: { coffee: 12.5 } } }
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

// Whole percents for each category with a positive total, so they sum to exactly 100.
// Rounds every share down, then gives the leftover points to the largest fractional
// parts (ties broken by category name). Categories with a zero or negative total are omitted.
export function categoryPercents(byCategory) {
  const positive = Object.entries(byCategory)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, cents: Math.round(amount * 100) }))

  const totalCents = positive.reduce((sum, { cents }) => sum + cents, 0)
  if (positive.length === 0 || totalCents <= 0) return {}

  const shares = positive.map(({ category, cents }) => {
    const numerator = cents * 100
    return { category, percent: Math.floor(numerator / totalCents), remainder: numerator % totalCents }
  })

  let leftover = 100 - shares.reduce((sum, { percent }) => sum + percent, 0)
  const order = [...shares].sort(
    (a, b) =>
      b.remainder - a.remainder || (a.category < b.category ? -1 : a.category > b.category ? 1 : 0),
  )
  for (const share of order) {
    if (leftover <= 0) break
    share.percent += 1
    leftover -= 1
  }

  return Object.fromEntries(shares.map(({ category, percent }) => [category, percent]))
}
