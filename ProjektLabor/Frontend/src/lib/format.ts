export function formatDate(date?: string | number | Date) {
  if (!date) return ''
  try {
    const d = new Date(date)
    return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'short', day: '2-digit' })
  } catch {
    return ''
  }
}

export function truncate(text: string, max = 140) {
  if (!text) return ''
  if (text.length <= max) return text
  return text.slice(0, max - 1) + '…'
}

export function clsxTruth(...values: (string | false | null | undefined)[]) {
  return values.filter(Boolean).join(' ')
}
