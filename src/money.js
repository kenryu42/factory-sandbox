export function parseAmount(text) {
  const amount = Number(text.replace(/[$,]/g, ''))
  if (Number.isNaN(amount)) throw new Error(`not an amount: ${text}`)
  return amount
}

export function formatMoney(amount) {
  return `$${amount.toFixed(2)}`
}
