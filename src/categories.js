// rules: [{ match: 'starbucks', category: 'coffee' }]. The first matching rule wins.
// A rule may use `pattern` (a case-insensitive regular expression) instead of
// `match`, and optional inclusive `min`/`max` amount limits.
export function categorize(description, rules, amount) {
  const rule = rules.find((r) => applies(r, description, amount))
  return rule ? rule.category : 'uncategorized'
}

function applies(rule, description, amount) {
  const matches = rule.pattern === undefined
    ? description.includes(rule.match)
    : regexFor(rule.pattern).test(description)
  if (!matches) return false
  if (rule.min !== undefined && amount < rule.min) return false
  if (rule.max !== undefined && amount > rule.max) return false
  return true
}

function regexFor(pattern) {
  try {
    return new RegExp(pattern, 'i')
  } catch {
    throw new Error(`invalid rule pattern: ${pattern}`)
  }
}
