export function parseAmount(text) {
  const amount = Number(text.replace(/[$,]/g, ''))
  if (Number.isNaN(amount)) throw new Error(`not an amount: ${text}`)
  return amount
}

export function formatMoney(amount) {
  const fixed = Math.abs(amount).toFixed(2)
  const negative = amount < 0 && Number(fixed) !== 0
  return `${negative ? '-' : ''}$${fixed}`
}
