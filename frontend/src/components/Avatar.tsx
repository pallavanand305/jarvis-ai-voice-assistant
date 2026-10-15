import { useMemo } from 'react'

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking'

interface Props {
  state: AvatarState
}

const STATE_LABEL: Record<AvatarState, string> = {
  idle: 'Standby',
  listening: 'Listening...',
  thinking: 'Thinking...',
  speaking: 'Speaking...',
}

/**
 * SVG-based animated anime-style avatar.
 * States drive CSS animations: idle breathing, listening pulse,
 * thinking rings, speaking mouth movement.
 */
export default function Avatar({ state }: Props) {
  const mouthOpen = useMemo(() => state === 'speaking', [state])

  return (
    <div className="avatar-stage">
      <div className={`avatar-state avatar-state-${state}`}>{STATE_LABEL[state]}</div>

      <svg
        viewBox="0 0 300 340"
        className={`avatar-svg avatar-${state}`}
        role="img"
        aria-label="Jarvis avatar"
      >
        <defs>
          <linearGradient id="hairGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* aura / glow */}
        <circle cx="150" cy="170" r="140" fill="url(#glowGrad)" className="avatar-glow" />

        {/* body / shoulders */}
        <path
          d="M70 340 Q75 260 150 250 Q225 260 230 340 Z"
          fill="#111c30"
          stroke="#22d3ee"
          strokeWidth="2"
        />
        <path d="M135 255 L150 300 L165 255 Z" fill="#22d3ee" opacity="0.6" />

        {/* neck */}
        <rect x="135" y="215" width="30" height="45" fill="#f5d0b0" />

        {/* head */}
        <ellipse cx="150" cy="150" rx="70" ry="78" fill="#fbe3cd" />

        {/* hair */}
        <path
          d="M80 150 Q75 60 150 55 Q225 60 220 150 Q215 110 195 95 Q170 120 150 100 Q130 120 105 95 Q85 110 80 150 Z"
          fill="url(#hairGrad)"
        />
        <path d="M85 145 Q95 105 120 95 Q105 130 110 165 Q90 165 85 145 Z" fill="#818cf8" />
        <path d="M215 145 Q205 105 180 95 Q195 130 190 165 Q210 165 215 145 Z" fill="#818cf8" />

        {/* eyes */}
        <g className="avatar-eyes">
          <ellipse cx="122" cy="155" rx="14" ry={state === 'idle' ? '16' : '18'} fill="#fff" />
          <ellipse cx="178" cy="155" rx="14" ry={state === 'idle' ? '16' : '18'} fill="#fff" />
          <circle cx="125" cy="157" r="8" fill="#1e3a8a" className="pupil" />
          <circle cx="181" cy="157" r="8" fill="#1e3a8a" className="pupil" />
          <circle cx="127" cy="154" r="2.5" fill="#fff" />
          <circle cx="183" cy="154" r="2.5" fill="#fff" />
          <path d="M108 140 Q122 132 136 140" stroke="#4338ca" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M164 140 Q178 132 192 140" stroke="#4338ca" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>

        {/* blush */}
        <ellipse cx="106" cy="180" rx="12" ry="7" fill="#fda4af" opacity="0.55" />
        <ellipse cx="194" cy="180" rx="12" ry="7" fill="#fda4af" opacity="0.55" />

        {/* nose */}
        <path d="M150 165 L146 180 Q150 184 154 180 Z" fill="#f3c8a8" />

        {/* mouth */}
        <g className="avatar-mouth">
          {mouthOpen ? (
            <ellipse cx="150" cy="202" rx="16" ry="10" fill="#b91c1c">
              <animate
                attributeName="ry"
                values="4;11;6;10;4"
                dur="0.45s"
                repeatCount="indefinite"
              />
            </ellipse>
          ) : state === 'listening' ? (
            <path
              d="M136 202 Q150 212 164 202"
              stroke="#b91c1c"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M138 200 Q150 210 162 200"
              stroke="#b91c1c"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
        </g>

        {/* headset */}
        <path d="M80 150 Q80 70 150 68 Q220 70 220 150" stroke="#22d3ee" strokeWidth="5" fill="none" />
        <rect x="68" y="140" width="18" height="38" rx="8" fill="#0ea5e9" />
        <rect x="214" y="140" width="18" height="38" rx="8" fill="#0ea5e9" />
        <circle cx="77" cy="159" r="5" fill="#22d3ee" className="headset-dot" />
      </svg>

      {/* listening waves */}
      {state === 'listening' && (
        <div className="wave-ring">
          <span />
          <span />
          <span />
        </div>
      )}

      {/* thinking orbit */}
      {state === 'thinking' && (
        <div className="think-orbit">
          <i />
          <i />
          <i />
        </div>
      )}
    </div>
  )
}
