// rules: [{ match: 'starbucks', category: 'coffee' }]. The first matching rule wins.
export function categorize(description, rules) {
  const lower = description.toLowerCase()
  const rule = rules.find((r) => lower.includes(r.match.toLowerCase()))
  return rule ? rule.category : 'uncategorized'
}
