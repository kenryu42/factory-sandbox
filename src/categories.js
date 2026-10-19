// rules: [{ match: 'starbucks', category: 'coffee' }, { pattern: '^uber', min: 20, max: 100, category: 'travel' }]
// `pattern` is a case-insensitive regular expression used instead of `match`.
// `min` and `max` are optional inclusive amount limits. The first applicable rule wins.
export function categorize(description, rules, amount) {
  // Compile every pattern first so an invalid one throws regardless of rule order.
  const regexes = rules.map(compilePattern)
  const rule = rules.find((r, i) => matchesText(description, r, regexes[i]) && withinLimits(amount, r))
  return rule ? rule.category : 'uncategorized'
}

function compilePattern(rule) {
  if (rule.pattern === undefined) return undefined
  try {
    return new RegExp(rule.pattern, 'i')
  } catch (err) {
    throw new Error(`Invalid rule pattern ${JSON.stringify(rule.pattern)}: ${err.message}`)
  }
}

function matchesText(description, rule, regex) {
  return regex ? regex.test(description) : description.includes(rule.match)
}

function withinLimits(amount, rule) {
  if (rule.min === undefined && rule.max === undefined) return true
  if (typeof amount !== 'number' || Number.isNaN(amount)) return false
  if (rule.min !== undefined && amount < rule.min) return false
  if (rule.max !== undefined && amount > rule.max) return false
  return true
}
