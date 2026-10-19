export function slugify(title) {
  return title.trim().replace(/[^A-Za-z0-9]+/g, '-')
}

export function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length
}
