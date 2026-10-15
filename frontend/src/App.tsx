import { useEffect, useRef, useState } from 'react'
import Avatar from './components/Avatar'
import { useChat } from './hooks/useChat'
import { useVoice } from './hooks/useVoice'

export default function App() {
  const { messages, pending, avatarState, error, send, clear, setListening } = useChat()
  const [input, setInput] = useState('')
  const [wakeWord, setWakeWord] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)
  const lastRawRef = useRef('')

  const handleTranscript = (text: string) => {
    if (wakeWord && !/jarvis/i.test(text)) {
      lastRawRef.current = text
      return
    }
    const cleaned = text.replace(/hey\s+jarvis,?\s*/i, '').trim()
    if (cleaned) void send(cleaned)
  }

  const voice = useVoice(handleTranscript, setListening)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    void send(input)
    setInput('')
  }

  return (
    <div className="app">
      <section className="panel avatar-panel">
        <div className={`avatar-status avatar-status-${avatarState}`}>{avatarState}</div>
        <Avatar state={avatarState} />
        <div className="avatar-caption">JARVIS</div>
      </section>

      <section className="panel chat-panel">
        <header className="chat-header">
          <h1>Jarvis Console</h1>
          <div className="chat-actions">
            <button
              className={`btn ${voice.recording ? 'recording' : ''}`}
              onClick={voice.toggle}
              disabled={!voice.supported}
              title={voice.supported ? 'Hold a conversation by voice' : 'Mic not supported'}
            >
              {voice.recording ? '● Rec' : 'Mic'}
            </button>
            <button className={`btn ${wakeWord ? 'active' : ''}`} onClick={() => setWakeWord((w) => !w)}>
              Wake word
            </button>
            <button className="btn" onClick={() => void clear()}>
              Clear
            </button>
          </div>
        </header>

        <div className="messages">
          {messages.length === 0 && (
            <div className="msg assistant">Namaste! I am Jarvis. Ask me anything - text or voice.</div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`msg ${m.role} ${m.content === '...' ? 'pending' : ''}`}>
              {m.content}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {(error || voice.error) && <div className="hint">⚠ {error || voice.error}</div>}

        <form className="input-row" onSubmit={onSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message... (Hindi / Hinglish / English)"
            aria-label="Message"
          />
          <button className="btn" type="submit" disabled={pending}>
            Send
          </button>
        </form>
        <div className="hint">Voice: click Mic and speak. Wake word filters non-Jarvis speech.</div>
      </section>
    </div>
  )
}
