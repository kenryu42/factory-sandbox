// Parses a CSV export with a header row into one object per line.
//
// Follows the usual CSV quoting rules: a quoted field may contain commas,
// doubled quotes (`""` is one `"`), and line breaks. Rows end with `\n` or
// `\r\n`, the final line break is optional, and blank lines are skipped.
// Unquoted fields are trimmed; quoted fields are kept verbatim.
export function parseCsv(text) {
  const rows = []
  let fields = []
  let field = ''
  let fieldWasQuoted = false
  let inQuotes = false
  let rowHasContent = false
  let i = 0

  const endField = () => {
    fields.push(fieldWasQuoted ? field : field.trim())
    field = ''
    fieldWasQuoted = false
  }

  const endRow = () => {
    if (rowHasContent) rows.push(fields)
    fields = []
    rowHasContent = false
  }

  while (i < text.length) {
    const c = text[i]

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i += 2
        } else {
          inQuotes = false
          i += 1
        }
      } else {
        field += c
        i += 1
      }
      continue
    }

    if (c === '"' && field === '') {
      fieldWasQuoted = true
      inQuotes = true
      rowHasContent = true
      i += 1
    } else if (c === ',') {
      endField()
      rowHasContent = true
      i += 1
    } else if (c === '\n') {
      endField()
      endRow()
      i += 1
    } else if (c === '\r') {
      endField()
      endRow()
      i += text[i + 1] === '\n' ? 2 : 1
    } else {
      field += c
      if (!/\s/.test(c)) rowHasContent = true
      i += 1
    }
  }

  endField()
  endRow()

  const header = rows[0]
  return rows.slice(1).map((row) => Object.fromEntries(header.map((h, idx) => [h, row[idx] ?? ''])))
}
