import { useCallback, useEffect, useRef, useState } from 'react'
import { transcribeAudio } from '../api'

export type VoiceStatus = 'idle' | 'recording' | 'processing'

export function useVoice(
  onTranscript: (text: string) => void,
  onStateChange: (listening: boolean) => void,
) {
  const [status, setStatus] = useState<VoiceStatus>('idle')
  const [supported, setSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mediaRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const rafRef = useRef<number | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const maxTimerRef = useRef<number | null>(null)
  const statusRef = useRef<VoiceStatus>('idle')

  const setStatusSafe = (s: VoiceStatus) => {
    statusRef.current = s
    setStatus(s)
  }

  useEffect(() => {
    setSupported(typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
      audioCtxRef.current?.close().catch(() => {})
    }
  }, [])

  const cleanup = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    if (maxTimerRef.current) clearTimeout(maxTimerRef.current)
    rafRef.current = null
    maxTimerRef.current = null
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
  }, [])

  const stop = useCallback(() => {
    if (mediaRef.current && mediaRef.current.state !== 'inactive') {
      mediaRef.current.stop()
    }
  }, [])

  const start = useCallback(async () => {
    setError(null)
    if (!supported) {
      setError('Is browser mein microphone support nahi hai')
      return
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      })
      streamRef.current = stream

      let mime = 'audio/webm'
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) mime = 'audio/webm;codecs=opus'
      const mr = new MediaRecorder(stream, { mimeType: mime })
      chunksRef.current = []
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      mr.onstop = async () => {
        cleanup()
        const blob = new Blob(chunksRef.current, { type: mime })
        onStateChange(false)
        if (blob.size === 0) {
          setStatusSafe('idle')
          return
        }
        setStatusSafe('processing')
        try {
          const text = await transcribeAudio(blob)
          if (text.trim()) onTranscript(text.trim())
        } catch (e) {
          setError(e instanceof Error ? e.message : 'transcription failed')
        } finally {
          setStatusSafe('idle')
        }
      }
      mediaRef.current = mr
      mr.start()
      setStatusSafe('recording')
      onStateChange(true)

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      const ctx: AudioContext = new AudioCtx()
      audioCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)

      let hasSpoken = false
      let silenceSince = 0
      const startedAt = performance.now()

      const tick = () => {
        if (statusRef.current !== 'recording') return
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (let i = 0; i < data.length; i++) sum += data[i]
        const avg = sum / data.length
        const now = performance.now()

        if (avg > 12) {
          hasSpoken = true
          silenceSince = 0
        } else if (hasSpoken) {
          if (!silenceSince) silenceSince = now
          else if (now - silenceSince > 1400) {
            stop()
            return
          }
        }
        if (now - startedAt > 15000) {
          stop()
          return
        }
        rafRef.current = requestAnimationFrame(tick)
      }
      rafRef.current = requestAnimationFrame(tick)
      maxTimerRef.current = window.setTimeout(() => stop(), 15000)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'microphone access denied')
      cleanup()
      setStatusSafe('idle')
    }
  }, [supported, onTranscript, onStateChange, cleanup, stop])

  const toggle = useCallback(() => {
    if (statusRef.current === 'recording') stop()
    else if (statusRef.current === 'idle') void start()
  }, [start, stop])

  return {
    status,
    recording: status === 'recording',
    processing: status === 'processing',
    supported,
    error,
    toggle,
    start,
    stop,
  }
}
