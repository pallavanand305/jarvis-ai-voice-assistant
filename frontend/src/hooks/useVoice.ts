import { useCallback, useEffect, useRef, useState } from 'react'
import { transcribeAudio } from '../api'

export function useVoice(onTranscript: (text: string) => void, onStateChange: (listening: boolean) => void) {
  const [recording, setRecording] = useState(false)
  const [supported, setSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia)
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (!supported) {
      setError('Microphone not supported in this browser')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        if (blob.size === 0) return
        try {
          const text = await transcribeAudio(blob)
          if (text.trim()) onTranscript(text)
        } catch (e) {
          setError(e instanceof Error ? e.message : 'transcription failed')
        }
      }
      mediaRef.current = mr
      mr.start()
      setRecording(true)
      onStateChange(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'microphone access denied')
    }
  }, [supported, onTranscript, onStateChange])

  const stop = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
    }
    setRecording(false)
    onStateChange(false)
  }, [onStateChange])

  const toggle = useCallback(() => {
    if (recording) stop()
    else void start()
  }, [recording, start, stop])

  return { recording, supported, error, toggle, stop }
}
