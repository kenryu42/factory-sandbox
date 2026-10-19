// Lists every month/category whose spending exceeds its limit, months first, then categories alphabetically.
// `months` comes from summarizeByMonth; `budgets` is { category: monthlyLimit }.
export function findOverBudget(months, budgets) {
  const hits = []
  for (const month of Object.keys(months).sort()) {
    const { byCategory } = months[month]
    for (const category of Object.keys(budgets).sort()) {
      if (!(category in byCategory)) continue
      const over = Math.round(byCategory[category] * 100) - Math.round(budgets[category] * 100)
      if (over > 0) hits.push({ month, category, over: over / 100 })
    }
  }
  return hits
}
