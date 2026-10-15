import { useCallback, useEffect, useRef, useState } from 'react'
import type { AvatarState } from '../components/Avatar'
import { sendMessage, fetchHistory, clearHistory, speakText } from '../api'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [pending, setPending] = useState(false)
  const [avatarState, setAvatarState] = useState<AvatarState>('idle')
  const [error, setError] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fetchHistory()
      .then((h) => {
        if (h.length > 0) {
          const mapped: ChatMessage[] = []
          h.forEach((row) => {
            mapped.push({ role: 'user', content: row.user_message })
            mapped.push({ role: 'assistant', content: row.assistant_message })
          })
          setMessages(mapped)
        }
      })
      .catch(() => {})
  }, [])

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim()
      if (!trimmed || pending) return
      setError(null)
      const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
      setMessages((prev) => [...prev, { role: 'user', content: trimmed }, { role: 'assistant', content: '...' }])
      setPending(true)
      setAvatarState('thinking')
      try {
        const reply = await sendMessage(trimmed, history)
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: reply }
          return next
        })
        setAvatarState('speaking')
        try {
          await speakText(reply)
        } catch (e) {
          setError(e instanceof Error ? `Voice playback: ${e.message}` : 'voice playback failed')
        }
        setAvatarState('idle')
      } catch (e) {
        setError(e instanceof Error ? e.message : 'request failed')
        setMessages((prev) => {
          const next = [...prev]
          next[next.length - 1] = { role: 'assistant', content: 'Sorry, something went wrong.' }
          return next
        })
        setAvatarState('idle')
      } finally {
        setPending(false)
      }
    },
    [messages, pending],
  )

  const clear = useCallback(async () => {
    try {
      await clearHistory()
      setMessages([])
      setAvatarState('idle')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'clear failed')
    }
  }, [])

  const setListening = useCallback((listening: boolean) => {
    setAvatarState(listening ? 'listening' : 'idle')
  }, [])

  return { messages, pending, avatarState, error, send, clear, setListening, audioRef }
}
