import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import RecipeCard from '../components/recipes/RecipeCard'

export default function DashboardPage() {
  const { user } = useAuth()
  const [starred, setStarred] = useState([])
  const [suggestions, setSuggestions] = useState([])
  const [loadingStarred, setLoadingStarred] = useState(true)
  const [loadingSuggestions, setLoadingSuggestions] = useState(true)

  useEffect(() => {
    api.get('/user/starred?limit=4')
      .then(({ data }) => setStarred(data.recipes))
      .catch(() => {})
      .finally(() => setLoadingStarred(false))

    // Load suggestions based on saved ingredients or random
    const ingredients = user?.savedIngredients || []
    const diet = user?.preferences?.dietaryRestrictions?.find(d => d !== 'none')
    const cal = user?.preferences?.calorieTarget || 800

    if (ingredients.length > 0) {
      api.post('/recipes/search', { ingredients, maxCalories: cal, diet: diet || 'none', number: 4 })
        .then(({ data }) => setSuggestions(data.results))
        .catch(() => {})
        .finally(() => setLoadingSuggestions(false))
    } else {
      api.get('/recipes/random?number=4')
        .then(({ data }) => setSuggestions(data.results))
        .catch(() => {})
        .finally(() => setLoadingSuggestions(false))
    }
  }, [])

  const calorieTarget = user?.preferences?.calorieTarget || 2000
  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const SkeletonCard = () => (
    <div className="card" style={{ overflow: 'hidden' }}>
      <div className="skeleton" style={{ aspectRatio: '4/3' }} />
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div className="skeleton" style={{ height: 18, borderRadius: 4, width: '80%' }} />
        <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '50%' }} />
      </div>
    </div>
  )

  return (
    <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>

      {/* Greeting */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 900, color: 'var(--cream)', lineHeight: 1.2 }}>
          {greeting()}, <span style={{ color: 'var(--amber)' }}>{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 8, fontSize: '1rem' }}>
          What are we cooking today?
        </p>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 40 }}>
        {[
          {
            icon: '🔥', label: 'Calorie Target', value: `${calorieTarget} kcal`,
            sub: 'per day', color: 'var(--amber)', link: '/profile',
          },
          {
            icon: '⭐', label: 'Saved Recipes', value: starred.length,
            sub: 'recipes starred', color: '#e8c56a', link: '/saved',
          },
          {
            icon: '🥕', label: 'My Ingredients', value: user?.savedIngredients?.length || 0,
            sub: 'items saved', color: 'var(--green-light)', link: '/search',
          },
          {
            icon: '📅', label: 'Meal Plan', value: 'This week',
            sub: 'view & edit', color: '#7ab4e8', link: '/meal-plan',
          },
        ].map(stat => (
          <Link to={stat.link} key={stat.label} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ padding: '18px 20px', cursor: 'pointer', transition: 'var(--transition)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = stat.color}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{stat.icon}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, color: stat.color }}>
                {stat.value}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stat.sub}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 40 }}>
        <Link to="/search" className="btn btn-primary">🔍 Find Recipes</Link>
        <Link to="/meal-plan" className="btn btn-secondary">📅 View Meal Plan</Link>
        <Link to="/saved" className="btn btn-secondary">⭐ Saved Recipes</Link>
      </div>

      {/* Suggestions for you */}
      <section style={{ marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>
              {user?.savedIngredients?.length > 0 ? '🥕 Based on your ingredients' : '✨ Suggested for you'}
            </h2>
            {user?.savedIngredients?.length > 0 && (
              <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 4 }}>
                Using: {user.savedIngredients.slice(0, 4).join(', ')}{user.savedIngredients.length > 4 ? ` +${user.savedIngredients.length - 4} more` : ''}
              </p>
            )}
          </div>
          <Link to="/search" className="btn btn-ghost btn-sm" style={{ color: 'var(--amber)' }}>See all →</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
          {loadingSuggestions
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : suggestions.map(r => <RecipeCard key={r.id} recipe={r} />)
          }
        </div>
      </section>

      {/* Recently starred */}
      {(starred.length > 0 || loadingStarred) && (
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 className="section-title" style={{ fontSize: '1.4rem' }}>⭐ Recently saved</h2>
            <Link to="/saved" className="btn btn-ghost btn-sm" style={{ color: 'var(--amber)' }}>View all →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 }}>
            {loadingStarred
              ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
              : starred.map(r => (
                  <Link to={`/recipe/${r.recipeId}`} key={r.recipeId} style={{ textDecoration: 'none' }}>
                    <div className="card" style={{ overflow: 'hidden', display: 'flex', gap: 12, padding: 12, alignItems: 'center' }}>
                      {r.image
                        ? <img src={r.image} alt={r.title} style={{ width: 60, height: 60, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
                        : <div style={{ width: 60, height: 60, borderRadius: 10, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>🍽️</div>
                      }
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ fontWeight: 600, color: 'var(--cream)', fontSize: 13, lineHeight: 1.3,
                          overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box',
                          WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{r.title}</p>
                        {r.calories > 0 && <p style={{ fontSize: 11, color: 'var(--amber)', marginTop: 3 }}>🔥 {Math.round(r.calories)} kcal</p>}
                      </div>
                    </div>
                  </Link>
                ))
            }
          </div>
        </section>
      )}
    </div>
  )
}
