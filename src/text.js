export function slugify(title) {
  return title.trim().replace(/[^A-Za-z0-9]+/g, '-')
}

export function wordCount(text) {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}
