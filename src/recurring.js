const compare = (a, b) => (a < b ? -1 : a > b ? 1 : 0)

// Recurring: same description and amount in at least two different months. Refunds never count.
export function findRecurring(transactions) {
  const groups = new Map()
  for (const t of transactions) {
    if (t.amount <= 0) continue
    const key = JSON.stringify([t.description, t.amount])
    if (!groups.has(key)) groups.set(key, { description: t.description, amount: t.amount, months: new Set() })
    groups.get(key).months.add(t.date.slice(0, 7))
  }
  return [...groups.values()]
    .filter((g) => g.months.size >= 2)
    .map((g) => ({ description: g.description, amount: g.amount, months: [...g.months].sort() }))
    .sort((a, b) => compare(a.description, b.description) || compare(a.amount, b.amount))
}
