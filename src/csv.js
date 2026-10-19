// Parses a CSV export with a header row into one object per line.
export function parseCsv(text) {
  const lines = text.split('\n').filter((line) => line.trim() !== '')
  const header = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const cells = line.split(',')
    return Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? '').trim()]))
  })
}
