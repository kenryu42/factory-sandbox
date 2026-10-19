// Splits one CSV line into cells, keeping quoted fields (and their commas) together.
function splitLine(line) {
  const cells = []
  let cell = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cell += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        cell += ch
      }
    } else if (ch === '"' && cell.trim() === '') {
      inQuotes = true
    } else if (ch === ',') {
      cells.push(cell)
      cell = ''
    } else {
      cell += ch
    }
  }
  cells.push(cell)
  return cells
}

// Parses a CSV export with a header row into one object per line.
export function parseCsv(text) {
  const lines = text.split('\n').filter((line) => line.trim() !== '')
  const header = splitLine(lines[0]).map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const cells = splitLine(line)
    return Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? '').trim()]))
  })
}
