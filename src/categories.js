// rules: [{ match: 'starbucks', category: 'coffee' }]. The first matching rule wins.
export function categorize(description, rules) {
  const text = description.toLowerCase()
  const rule = rules.find((r) => text.includes(r.match.toLowerCase()))
  return rule ? rule.category : 'uncategorized'
}
