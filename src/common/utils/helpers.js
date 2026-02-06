export function formatDate(value) {
  if (!value) return ''

  const formatOne = (str) => {
    const [y, m, d] = str.split('-')
    return `${d}.${m}.${y}`
  }

  if (value.includes('/')) {
    const [from, to] = value.split('/')
    return `${formatOne(from)} – ${formatOne(to)}`
  }

  return formatOne(value)
}

export function uiToIsoDate(date) {
  const [d, m, y] = date.split('.')
  return `${y}-${m}-${d}`
}

export function parseUiDateRange(date) {
  if (!date) return {}

  const [fromRaw, toRaw] = date.split('-')

  const from = uiToIsoDate(fromRaw)
  const to = uiToIsoDate(toRaw || fromRaw)

  return { from, to }
}
