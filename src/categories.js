// rules: [{ match: 'starbucks', category: 'coffee' }, { pattern: '^uber', min: 20, max: 100, category: 'travel' }]
// `pattern` is a case-insensitive regular expression used instead of `match`.
// `min` and `max` are optional inclusive amount limits. The first applicable rule wins.
export function categorize(description, rules, amount) {
  const rule = rules.find((r) => matchesText(description, r) && withinLimits(amount, r))
  return rule ? rule.category : 'uncategorized'
}

function matchesText(description, rule) {
  if (rule.pattern === undefined) return description.includes(rule.match)
  let regex
  try {
    regex = new RegExp(rule.pattern, 'i')
  } catch (err) {
    throw new Error(`Invalid rule pattern ${JSON.stringify(rule.pattern)}: ${err.message}`)
  }
  return regex.test(description)
}

function withinLimits(amount, rule) {
  if (rule.min === undefined && rule.max === undefined) return true
  if (typeof amount !== 'number' || Number.isNaN(amount)) return false
  if (rule.min !== undefined && amount < rule.min) return false
  if (rule.max !== undefined && amount > rule.max) return false
  return true
}
