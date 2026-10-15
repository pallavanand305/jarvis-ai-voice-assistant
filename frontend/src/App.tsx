import { useEffect, useRef, useState } from 'react'
import Avatar from './components/Avatar'
import { useChat } from './hooks/useChat'
import { useVoice } from './hooks/useVoice'
import { unlockAudio } from './api'

export default function App() {
  const { messages, pending, avatarState, error, send, clear, setListening } = useChat()
  const [input, setInput] = useState('')
  const [wakeWord, setWakeWord] = useState(false)
  const [continuous, setContinuous] = useState(false)
  const [voiceOnly, setVoiceOnly] = useState(true)
  const [notice, setNotice] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const prevAvatar = useRef<string>('idle')

  const handleTranscript = (text: string) => {
    const hasWake = /jarvis|jarv[iy]s|jarvus|wajari|जार्विस|जारविस/i.test(text)
    if (wakeWord && !hasWake) {
      setNotice(`Suna: "${text}" (wake word "Jarvis" nahi mila)`)
      return
    }
    setNotice(null)
    const cleaned = text
      .replace(/hey\s+jarvis,?\s*/gi, '')
      .replace(/^(jarvis|wajari|जार्विस|जारविस)[,\s]*/i, '')
      .trim()
    if (cleaned) void send(cleaned)
  }

  const voice = useVoice(handleTranscript, setListening)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    const prev = prevAvatar.current
    prevAvatar.current = avatarState
    if (!continuous) return
    if (prev === 'speaking' && avatarState === 'idle' && voice.status === 'idle' && !pending) {
      const t = window.setTimeout(() => voice.start(), 500)
      return () => clearTimeout(t)
    }
  }, [avatarState, continuous, voice, pending])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    unlockAudio()
    void send(input)
    setInput('')
  }

  const onMicClick = () => {
    unlockAudio()
    if (continuous && voice.status === 'idle') setContinuous(false)
    voice.toggle()
  }

  const micLabel =
    voice.status === 'recording'
      ? '● Sun raha hoon...'
      : voice.status === 'processing'
        ? '... samajh raha'
        : 'Mic'

  const lastBot = [...messages].reverse().find((m) => m.role === 'assistant' && m.content !== '...')

  return (
    <div className="app">
      <section className="panel avatar-panel">
        <div className={`avatar-status avatar-status-${avatarState}`}>{avatarState}</div>
        <Avatar state={avatarState} />
        <div className="avatar-caption">JARVIS</div>
        {voiceOnly && lastBot && <div className="voice-caption">{lastBot.content}</div>}
      </section>

      <section className="panel chat-panel">
        <header className="chat-header">
          <h1>Jarvis Console</h1>
          <div className="chat-actions">
            <button
              className={`btn ${voice.recording ? 'recording' : ''}`}
              onClick={onMicClick}
              disabled={!voice.supported || voice.processing}
            >
              {micLabel}
            </button>
            <button
              className={`btn ${continuous ? 'active' : ''}`}
              onClick={() => {
                unlockAudio()
                setContinuous((c) => !c)
                if (!continuous) {
                  setVoiceOnly(true)
                  if (voice.status === 'idle') voice.start()
                }
              }}
              title="Two-way: har jawab ke baad khud sunna shuru karega"
            >
              Two-way
            </button>
            <button className={`btn ${voiceOnly ? 'active' : ''}`} onClick={() => setVoiceOnly((v) => !v)}>
              Voice only
            </button>
            <button className={`btn ${wakeWord ? 'active' : ''}`} onClick={() => setWakeWord((w) => !w)}>
              Wake
            </button>
            <button className="btn" onClick={() => void clear()}>
              Clear
            </button>
          </div>
        </header>

        {!voiceOnly && (
          <>
            <div className="messages">
              {messages.length === 0 && (
                <div className="msg assistant">
                  Namaste! Main Jarvis hoon. "Two-way" ON kijiye aur bina rukey baat kijiye. Hindi, Hinglish aur
                  English - sab chalega.
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`msg ${m.role} ${m.content === '...' ? 'pending' : ''}`}>
                  {m.content}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form className="input-row" onSubmit={onSubmit}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type karein... (Hindi / Hinglish / English)"
                aria-label="Message"
              />
              <button className="btn" type="submit" disabled={pending}>
                Send
              </button>
            </form>
          </>
        )}

        {voiceOnly && (
          <div className="voice-only-body">
            <div className="voice-only-hint">
              {voice.status === 'recording'
                ? 'Boliye... sun raha hoon'
                : voice.status === 'processing'
                  ? 'Samajh raha hoon...'
                  : avatarState === 'thinking'
                    ? 'Soch raha hoon...'
                    : avatarState === 'speaking'
                      ? 'Jarvis bol raha hai...'
                      : continuous
                        ? 'Sun raha hoon... boliye'
                        : 'Mic dabaiye ya Two-way ON kijiye'}
            </div>
            {lastBot && <div className="voice-only-last">{lastBot.content}</div>}
          </div>
        )}

        {(error || voice.error || notice) && <div className="hint">Warning: {error || voice.error || notice}</div>}
      </section>
    </div>
  )
}
