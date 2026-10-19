// rules: [{ match: 'starbucks', category: 'coffee' }]. The first matching rule wins.
export function categorize(description, rules) {
  const rule = rules.find((r) => description.includes(r.match))
  return rule ? rule.category : 'uncategorized'
}
