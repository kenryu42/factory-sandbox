// A payment is recurring when the same description and amount appear in at least two different months.
// Returns [{ description, amount, months: ['2026-01', ...] }] sorted by description. Refunds never count.
export function findRecurring(transactions) {
  const groups = new Map()
  for (const t of transactions) {
    if (t.amount < 0) continue
    const key = JSON.stringify([t.description, t.amount])
    const group = groups.get(key) ?? { description: t.description, amount: t.amount, months: new Set() }
    group.months.add(t.date.slice(0, 7))
    groups.set(key, group)
  }
  return [...groups.values()]
    .filter((g) => g.months.size >= 2)
    .map((g) => ({ description: g.description, amount: g.amount, months: [...g.months].sort() }))
    .sort((a, b) => (a.description < b.description ? -1 : a.description > b.description ? 1 : a.amount - b.amount))
}
