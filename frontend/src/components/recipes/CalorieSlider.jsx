export default function CalorieSlider({ value, onChange }) {
  const presets = [
    { label: 'Light', cal: 400, desc: 'Under 400 kcal' },
    { label: 'Balanced', cal: 600, desc: '400–600 kcal' },
    { label: 'Hearty', cal: 900, desc: '600–900 kcal' },
    { label: 'Full', cal: 1500, desc: '900–1500 kcal' },
  ]

  const getColor = (v) => {
    if (v < 400) return '#7ab4e8'
    if (v < 600) return 'var(--green-light)'
    if (v < 900) return 'var(--amber)'
    return '#e88066'
  }

  const pct = Math.round(((value - 100) / (2000 - 100)) * 100)
  const color = getColor(value)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Presets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
        {presets.map(p => (
          <button
            key={p.label}
            onClick={() => onChange(p.cal)}
            style={{
              padding: '8px 6px', borderRadius: 10, border: '1px solid',
              borderColor: value <= p.cal && (p.label === 'Light' ? true : value > presets[presets.indexOf(p) - 1]?.cal) ? color : 'var(--border)',
              background: value === p.cal ? `${color}22` : 'var(--bg-elevated)',
              color: value === p.cal ? color : 'var(--text-secondary)',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'var(--transition)',
              textAlign: 'center',
            }}
          >
            <div>{p.label}</div>
            <div style={{ fontSize: 10, opacity: 0.7, marginTop: 2 }}>{p.desc}</div>
          </button>
        ))}
      </div>

      {/* Slider */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Max calories per recipe</span>
          <span style={{ fontSize: 20, fontWeight: 700, color, fontFamily: 'var(--font-display)' }}>
            {value} <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--text-muted)' }}>kcal</span>
          </span>
        </div>
        <div style={{ position: 'relative', height: 6, background: 'var(--bg-elevated)', borderRadius: 3, cursor: 'pointer' }}>
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: `linear-gradient(to right, #7ab4e8, ${color})`, borderRadius: 3, transition: 'width 0.1s' }} />
          <input
            type="range" min={100} max={2000} step={50} value={value}
            onChange={e => onChange(Number(e.target.value))}
            style={{ position: 'absolute', inset: 0, opacity: 0, width: '100%', cursor: 'pointer', height: '100%' }}
          />
          <div style={{
            position: 'absolute', top: '50%', left: `${pct}%`, transform: 'translate(-50%, -50%)',
            width: 18, height: 18, borderRadius: '50%',
            background: color, border: '2px solid var(--bg-primary)',
            boxShadow: `0 0 8px ${color}66`,
            pointerEvents: 'none', transition: 'left 0.1s',
          }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)' }}>
          <span>100</span><span>500</span><span>1000</span><span>1500</span><span>2000</span>
        </div>
      </div>
    </div>
  )
}
