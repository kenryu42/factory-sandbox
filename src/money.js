export function parseAmount(text) {
  const amount = Number(text.replace(/[$,]/g, ''))
  if (Number.isNaN(amount)) throw new Error(`not an amount: ${text}`)
  return Math.round(amount * 100)
}

export function formatMoney(cents) {
  return `$${(cents / 100).toFixed(2)}`
}
