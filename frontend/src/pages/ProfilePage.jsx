import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

const DIETS = ['none', 'vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo']
const CUISINES = ['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'French', 'Indian', 'Japanese', 'Thai', 'Greek', 'Spanish']

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth()
  const navigate = useNavigate()
  const [prefs, setPrefs] = useState({
    calorieTarget: user?.preferences?.calorieTarget || 2000,
    dietaryRestrictions: user?.preferences?.dietaryRestrictions || ['none'],
    cuisinePreferences: user?.preferences?.cuisinePreferences || [],
  })
  const [saving, setSaving] = useState(false)

  const toggleDiet = (diet) => {
    if (diet === 'none') { setPrefs(p => ({ ...p, dietaryRestrictions: ['none'] })); return }
    setPrefs(p => {
      const cur = p.dietaryRestrictions.filter(d => d !== 'none')
      return { ...p, dietaryRestrictions: cur.includes(diet) ? cur.filter(d => d !== diet) || ['none'] : [...cur, diet] }
    })
  }

  const toggleCuisine = (c) => {
    setPrefs(p => ({
      ...p,
      cuisinePreferences: p.cuisinePreferences.includes(c)
        ? p.cuisinePreferences.filter(x => x !== c)
        : [...p.cuisinePreferences, c]
    }))
  }

  const savePreferences = async () => {
    setSaving(true)
    try {
      const { data } = await api.put('/user/preferences', prefs)
      updateUser({ preferences: data.preferences })
      toast.success('Preferences saved! ✅')
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    toast.success('Logged out')
  }

  return (
    <div className="page-enter" style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      {/* Profile header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 36 }}>
        <div style={{
          width: 72, height: 72, borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--amber), #8a4a10)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, fontWeight: 900, color: '#0f0a04',
          fontFamily: 'var(--font-display)',
          flexShrink: 0,
        }}>
          {user?.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--cream)' }}>{user?.name}</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.email}</p>
        </div>
      </div>

      {/* Calorie target */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>🔥 Daily Calorie Target</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input
            type="range" min={500} max={4000} step={50}
            value={prefs.calorieTarget}
            onChange={e => setPrefs(p => ({ ...p, calorieTarget: Number(e.target.value) }))}
            style={{ flex: 1 }}
          />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--amber)', minWidth: 100, textAlign: 'right' }}>
            {prefs.calorieTarget} <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>kcal/day</span>
          </div>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>This will be used as the default calorie filter when searching</p>
      </div>

      {/* Dietary restrictions */}
      <div className="card" style={{ padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>🥗 Dietary Restrictions</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {DIETS.map(d => {
            const active = prefs.dietaryRestrictions.includes(d)
            return (
              <button key={d} onClick={() => toggleDiet(d)}
                style={{
                  padding: '8px 16px', borderRadius: 100, border: '1px solid', cursor: 'pointer', transition: 'var(--transition)',
                  fontWeight: 500, fontSize: 13,
                  borderColor: active ? 'var(--green-light)' : 'var(--border)',
                  background: active ? 'rgba(122,191,122,0.15)' : 'var(--bg-elevated)',
                  color: active ? 'var(--green-light)' : 'var(--text-secondary)',
                }}>
                {d === 'none' ? 'No restriction' : d}
              </button>
            )
          })}
        </div>
      </div>

      {/* Cuisine preferences */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--cream)', marginBottom: 16 }}>🌍 Favorite Cuisines</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {CUISINES.map(c => {
            const active = prefs.cuisinePreferences.includes(c)
            return (
              <button key={c} onClick={() => toggleCuisine(c)}
                style={{
                  padding: '8px 16px', borderRadius: 100, border: '1px solid', cursor: 'pointer', transition: 'var(--transition)',
                  fontWeight: 500, fontSize: 13,
                  borderColor: active ? 'var(--amber)' : 'var(--border)',
                  background: active ? 'rgba(200,131,42,0.15)' : 'var(--bg-elevated)',
                  color: active ? 'var(--amber)' : 'var(--text-secondary)',
                }}>
                {c}
              </button>
            )
          })}
        </div>
      </div>

      {/* Save button */}
      <button className="btn btn-primary btn-lg" onClick={savePreferences} disabled={saving} style={{ width: '100%', justifyContent: 'center', marginBottom: 24 }}>
        {saving ? 'Saving...' : '💾 Save Preferences'}
      </button>

      {/* Danger zone */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
        <button className="btn btn-secondary" onClick={handleLogout} style={{ color: 'var(--red)', borderColor: 'rgba(224,90,58,0.3)' }}>
          🚪 Log out
        </button>
      </div>
    </div>
  )
}
