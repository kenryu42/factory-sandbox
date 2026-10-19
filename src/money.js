// Money is integer cents everywhere; dollars only appear in CSV input and printed output.
export function parseAmount(text) {
  const match = /^([+-]?)(\d*)(?:\.(\d{1,2}))?$/.exec(text.replace(/[$,]/g, '').trim())
  if (!match || !(match[2] || match[3])) throw new Error(`not an amount: ${text}`)
  const [, sign, dollars, cents = ''] = match
  const total = Number(dollars || 0) * 100 + Number(cents.padEnd(2, '0'))
  return sign === '-' ? -total : total
}

export function formatMoney(cents) {
  const sign = cents < 0 ? '-' : ''
  const abs = Math.abs(cents)
  return `$${sign}${Math.floor(abs / 100)}.${String(abs % 100).padStart(2, '0')}`
}
