import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../utils/api'
import toast from 'react-hot-toast'

const ClockIcon = () => <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
const StarIcon = ({ filled }) => (
  <svg width="16" height="16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
)
const FireIcon = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="var(--amber)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8l5 5-3 3zm3-1l-2-2 2-2v4z"/></svg>

export default function RecipeCard({ recipe, onStarToggle }) {
  const { user } = useAuth()
  const [starred, setStarred] = useState(recipe.isStarred || false)
  const [loading, setLoading] = useState(false)

  const handleStar = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!user) { toast.error('Sign in to save recipes'); return }
    setLoading(true)
    try {
      if (starred) {
        await api.delete(`/user/star/${recipe.id}`)
        setStarred(false)
        toast.success('Removed from saved')
      } else {
        await api.post(`/user/star/${recipe.id}`, recipe)
        setStarred(true)
        toast.success('Recipe saved! ⭐')
      }
      onStarToggle?.(recipe.id, !starred)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const calories = Math.round(recipe.calories || 0)
  const time = recipe.readyInMinutes

  return (
    <Link to={`/recipe/${recipe.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="card" style={{ overflow: 'hidden', position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Image */}
        <div style={{ position: 'relative', aspectRatio: '4/3', overflow: 'hidden', background: 'var(--bg-elevated)' }}>
          {recipe.image ? (
            <img src={recipe.image} alt={recipe.title} loading="lazy"
              style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🍽️</div>
          )}
          {/* Gradient overlay */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,10,4,0.7) 0%, transparent 50%)' }} />

          {/* Star button */}
          <button
            onClick={handleStar}
            disabled={loading}
            style={{
              position: 'absolute', top: 10, right: 10,
              width: 34, height: 34, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: starred ? 'rgba(200,131,42,0.9)' : 'rgba(15,10,4,0.7)',
              backdropFilter: 'blur(8px)',
              color: starred ? '#0f0a04' : 'var(--cream)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'var(--transition)',
              cursor: 'pointer',
            }}
          >
            <StarIcon filled={starred} />
          </button>

          {/* Diet tags */}
          {recipe.diets?.slice(0, 1).map(d => (
            <span key={d} className="tag tag-green" style={{ position: 'absolute', bottom: 8, left: 8, fontSize: 11 }}>
              {d}
            </span>
          ))}
        </div>

        {/* Content */}
        <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--cream)', lineHeight: 1.3,
            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {recipe.title}
          </h3>

          {/* Meta row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 'auto' }}>
            {time > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-muted)' }}>
                <ClockIcon /> {time} min
              </span>
            )}
            {calories > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--amber)', fontWeight: 600, marginLeft: 'auto' }}>
                🔥 {calories} kcal
              </span>
            )}
          </div>

          {/* Macro bar */}
          {(recipe.protein || recipe.carbs || recipe.fat) > 0 && (
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { label: 'P', value: Math.round(recipe.protein), color: 'var(--green-light)' },
                { label: 'C', value: Math.round(recipe.carbs), color: '#7ab4e8' },
                { label: 'F', value: Math.round(recipe.fat), color: '#e8c56a' },
              ].map(m => (
                <div key={m.label} style={{ flex: 1, background: 'var(--bg-elevated)', borderRadius: 6, padding: '5px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: m.color }}>{m.value}g</div>
                </div>
              ))}
            </div>
          )}

          {/* Ingredient match */}
          {recipe.usedIngredientCount !== undefined && (
            <div style={{ fontSize: 11, color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 8 }}>
              <span style={{ color: 'var(--green-light)', fontWeight: 600 }}>{recipe.usedIngredientCount} ingredients</span> you have
              {recipe.missedIngredientCount > 0 && ` · ${recipe.missedIngredientCount} missing`}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
