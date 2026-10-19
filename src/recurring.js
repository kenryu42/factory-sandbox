// A payment is recurring when the same description and amount appear in at
// least two different calendar months. Refunds (negative amounts) never count.
export function findRecurring(transactions) {
  const groups = new Map()
  for (const t of transactions) {
    if (t.amount < 0) continue
    const key = `${t.description}\u0000${t.amount}`
    const group = groups.get(key) ?? { description: t.description, amount: t.amount, months: new Set() }
    group.months.add(t.date.slice(0, 7))
    groups.set(key, group)
  }
  return [...groups.values()]
    .filter((group) => group.months.size >= 2)
    .map((group) => ({ description: group.description, amount: group.amount, months: [...group.months].sort() }))
    .sort((a, b) => a.description.localeCompare(b.description))
}
