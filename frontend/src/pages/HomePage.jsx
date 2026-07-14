import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import RecipeCard from '../components/recipes/RecipeCard'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [featured, setFeatured] = useState([])
  const [loadingFeatured, setLoadingFeatured] = useState(true)

  useEffect(() => {
    api.get('/recipes/random?number=6')
      .then(({ data }) => setFeatured(data.results))
      .catch(() => {})
      .finally(() => setLoadingFeatured(false))
  }, [])

  const features = [
    { icon: '🥕', title: 'Ingredient-First', desc: 'Enter what\'s in your kitchen and find recipes that use exactly what you have.' },
    { icon: '🔥', title: 'Calorie Smart', desc: 'Set your calorie target and we\'ll only show recipes that fit your goals.' },
    { icon: '⭐', title: 'Save Favorites', desc: 'Star recipes you love and access them anytime from your profile.' },
    { icon: '📅', title: 'Weekly Planner', desc: 'Plan breakfast, lunch, and dinner for the whole week at a glance.' },
    { icon: '🛒', title: 'Shopping Lists', desc: 'Generate shopping lists from your meal plan automatically.' },
    { icon: '🥗', title: 'Diet Filters', desc: 'Vegan, keto, gluten-free — filter recipes to match your lifestyle.' },
  ]

  return (
    <div className="page-enter">
      {/* Hero */}
      <section style={{
        padding: 'clamp(60px, 10vw, 100px) 24px clamp(40px, 8vw, 80px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
          <div style={{ position: 'absolute', top: '20%', left: '10%', fontSize: 64, opacity: 0.04, transform: 'rotate(-15deg)' }}>🍅</div>
          <div style={{ position: 'absolute', top: '10%', right: '15%', fontSize: 80, opacity: 0.04, transform: 'rotate(10deg)' }}>🧄</div>
          <div style={{ position: 'absolute', bottom: '20%', left: '5%', fontSize: 72, opacity: 0.04, transform: 'rotate(5deg)' }}>🥦</div>
          <div style={{ position: 'absolute', bottom: '15%', right: '8%', fontSize: 60, opacity: 0.04, transform: 'rotate(-8deg)' }}>🍋</div>
        </div>

        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <div className="tag tag-amber" style={{ marginBottom: 20, display: 'inline-flex' }}>
            ✨ Powered by Spoonacular API
          </div>
          <h1 style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(2.4rem, 6vw, 4.5rem)',
            fontWeight: 900, lineHeight: 1.1,
            color: 'var(--cream)', marginBottom: 20,
          }}>
            Cook what you{' '}
            <span style={{ color: 'var(--amber)', fontStyle: 'italic' }}>actually have</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36 }}>
            Enter the ingredients sitting in your kitchen, set your calorie goal,
            and discover hundreds of recipes tailored exactly to you.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/search" className="btn btn-primary btn-lg">
              🍳 Find Recipes Now
            </Link>
            {!user && (
              <Link to="/signup" className="btn btn-secondary btn-lg">
                Create Free Account
              </Link>
            )}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: 48, flexWrap: 'wrap' }}>
            {[['380,000+', 'Recipes'], ['27', 'Diet types'], ['100%', 'Free to use']].map(([stat, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--amber)' }}>{stat}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ padding: '0 24px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 className="section-title" style={{ textAlign: 'center', marginBottom: 40 }}>
          Everything you need to cook better
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {features.map(f => (
            <div key={f.title} className="card" style={{ padding: '22px 24px', display: 'flex', gap: 14 }}>
              <div style={{ fontSize: 28, lineHeight: 1 }}>{f.icon}</div>
              <div>
                <h3 style={{ fontWeight: 600, color: 'var(--cream)', marginBottom: 4, fontSize: '0.95rem' }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured recipes */}
      <section style={{ padding: '0 24px 80px', maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
          <h2 className="section-title">Featured recipes</h2>
          <Link to="/search" className="btn btn-secondary btn-sm">View all →</Link>
        </div>

        {loadingFeatured ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div className="skeleton" style={{ height: 18, borderRadius: 4, width: '80%' }} />
                  <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '50%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
            {featured.map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        )}
      </section>

      {/* CTA */}
      {!user && (
        <section style={{ padding: '0 24px 80px' }}>
          <div style={{
            maxWidth: 700, margin: '0 auto', textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(200,131,42,0.12), rgba(200,131,42,0.04))',
            border: '1px solid rgba(200,131,42,0.25)',
            borderRadius: 'var(--radius-xl)', padding: 'clamp(32px, 6vw, 56px) 32px',
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🚀</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, color: 'var(--cream)', marginBottom: 12 }}>
              Ready to stop wasting food?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>
              Join thousands of home cooks using CookNook to make the most of their kitchen.
            </p>
            <Link to="/signup" className="btn btn-primary btn-lg">
              Get started for free →
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
