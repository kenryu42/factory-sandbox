// Splits one CSV line into cells. Quoted cells may contain commas, and "" inside quotes is a literal quote.
function splitLine(line) {
  const cells = []
  let cell = ''
  let quoted = false
  let wasQuoted = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"'
        i++
      } else if (ch === '"') {
        quoted = false
      } else {
        cell += ch
      }
    } else if (ch === '"' && cell.trim() === '' && !wasQuoted) {
      quoted = true
      wasQuoted = true
      cell = ''
    } else if (ch === ',') {
      cells.push(wasQuoted ? cell : cell.trim())
      cell = ''
      wasQuoted = false
    } else if (!(wasQuoted && ch.trim() === '')) {
      cell += ch
    }
  }
  cells.push(wasQuoted ? cell : cell.trim())
  return cells
}

// Parses a CSV export with a header row into one object per line.
export function parseCsv(text) {
  const lines = text.split('\n').filter((line) => line.trim() !== '')
  const header = splitLine(lines[0])
  return lines.slice(1).map((line) => {
    const cells = splitLine(line)
    return Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? '').trim()]))
  })
}
