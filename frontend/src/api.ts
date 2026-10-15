export interface HistoryRow {
  user_message: string
  assistant_message: string
  language?: string
  created_at?: string
}

async function jsonOrThrow(res: Response): Promise<any> {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(body.detail || `HTTP ${res.status}`)
  }
  return body
}

export async function sendMessage(message: string, history: { role: string; content: string }[]): Promise<string> {
  const res = await fetch('/api/chat/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, language: 'auto', history }),
  })
  const data = await jsonOrThrow(res)
  return data.response as string
}

export async function fetchHistory(limit = 50): Promise<HistoryRow[]> {
  const res = await fetch(`/api/memory/?limit=${limit}`)
  const data = await jsonOrThrow(res)
  return (data.history || []) as HistoryRow[]
}

export async function clearHistory(): Promise<void> {
  const res = await fetch('/api/memory/', { method: 'DELETE' })
  await jsonOrThrow(res)
}

export async function speakText(text: string, lang = 'auto'): Promise<void> {
  const res = await fetch('/api/voice/tts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, lang }),
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `TTS HTTP ${res.status}`)
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  await audio.play()
  await new Promise<void>((resolve) => {
    audio.onended = () => {
      URL.revokeObjectURL(url)
      resolve()
    }
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      resolve()
    }
  })
}

export async function transcribeAudio(blob: Blob): Promise<string> {
  const form = new FormData()
  form.append('file', blob, 'audio.webm')
  const res = await fetch('/api/voice/stt', { method: 'POST', body: form })
  const data = await jsonOrThrow(res)
  return data.text as string
}
