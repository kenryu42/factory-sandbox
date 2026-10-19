// Splits CSV text into rows of cells. Quoted fields may contain commas, line breaks and "" quotes.
// Unquoted cells are trimmed; quoted cells are kept as written. Blank lines are skipped.
function splitRows(text) {
  const rows = []
  let cells = []
  let cell = ''
  let quoted = false // current cell was quoted
  let inQuotes = false

  const endCell = () => {
    cells.push(quoted ? cell : cell.trim())
    cell = ''
    quoted = false
  }
  const endRow = () => {
    endCell()
    if (cells.length > 1 || cells[0] !== '' || quoted) rows.push(cells)
    cells = []
  }

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inQuotes) {
      if (ch !== '"') cell += ch
      else if (text[i + 1] === '"') {
        cell += '"'
        i++
      } else inQuotes = false
    } else if (ch === '"' && !quoted && cell.trim() === '') {
      cell = ''
      quoted = true
      inQuotes = true
    } else if (ch === ',') endCell()
    else if (ch === '\n') endRow()
    else if (ch === '\r' && text[i + 1] === '\n') continue
    else cell += ch
  }
  endRow()
  return rows
}

// Parses a CSV export with a header row into one object per line.
export function parseCsv(text) {
  const [header = [], ...rows] = splitRows(text)
  return rows.map((cells) => Object.fromEntries(header.map((h, i) => [h, cells[i] ?? ''])))
}
