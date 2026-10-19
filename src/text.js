export function slugify(title) {
  return title.trim().replace(/[^A-Za-z0-9]+/g, '-')
}

export function wordCount(text) {
  return text.split(' ').length
}

export function titleCase(text) {
  return text.toLowerCase().replace(/(^|\s)\S/g, (match) => match.toUpperCase())
}
