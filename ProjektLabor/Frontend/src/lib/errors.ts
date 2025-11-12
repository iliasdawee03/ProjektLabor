export type ProblemJson = { type?: string; title?: string; status?: number; errors?: Record<string, string[] | string>; traceId?: string }
export type AxiosLikeError = { response?: { data?: string | ProblemJson; status?: number }; message?: string }

function isProblemJson(obj: unknown): obj is ProblemJson {
  return typeof obj === 'object' && obj !== null &&
    ('title' in obj || 'errors' in obj || 'type' in obj || 'status' in obj || 'traceId' in obj);
}

export function toMessage(err: unknown): string {
  const e = err as AxiosLikeError
  const data = e?.response?.data
  if (typeof data === 'string') return data
  if (isProblemJson(data)) {
    if (data.errors && typeof data.errors === 'object') {
      const msgs: string[] = []
      for (const k of Object.keys(data.errors)) {
        const v = data.errors[k]
        if (Array.isArray(v)) msgs.push(...v)
        else if (typeof v === 'string') msgs.push(v)
      }
      if (msgs.length) return msgs.join('\n')
    }
    if (data.title && typeof data.title === 'string') return data.title
  }
  return e?.message || 'Ismeretlen hiba történt'
}
