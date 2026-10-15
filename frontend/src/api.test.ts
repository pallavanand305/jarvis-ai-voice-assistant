import { describe, it, expect } from 'vitest'

describe('chat message flow helpers', () => {
  it('trims and validates input', () => {
    const input = '  hello jarvis  '
    expect(input.trim().length).toBeGreaterThan(0)
  })

  it('builds history payload', () => {
    const messages = [
      { role: 'user' as const, content: 'a' },
      { role: 'assistant' as const, content: 'b' },
    ]
    const history = messages.slice(-10).map((m) => ({ role: m.role, content: m.content }))
    expect(history).toHaveLength(2)
  })

  it('filters wake word', () => {
    const text = 'Hey Jarvis, what time is it?'
    const cleaned = text.replace(/hey\s+jarvis,?\s*/i, '').trim()
    expect(cleaned).toBe('what time is it?')
  })
})
