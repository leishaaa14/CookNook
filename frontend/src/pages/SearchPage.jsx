import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import RecipeCard from '../components/recipes/RecipeCard'
import IngredientInput from '../components/recipes/IngredientInput'
import CalorieSlider from '../components/recipes/CalorieSlider'
import toast from 'react-hot-toast'

const DIETS = ['none', 'vegetarian', 'vegan', 'gluten free', 'ketogenic', 'paleo', 'whole30', 'pescetarian']
const CUISINES = ['', 'Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'French', 'Indian', 'Japanese', 'Thai']

export default function SearchPage() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const [ingredients, setIngredients] = useState(() => {
    const saved = searchParams.get('ing')
    return saved ? saved.split(',').filter(Boolean) : (user?.savedIngredients || [])
  })
  const [maxCalories, setMaxCalories] = useState(() => Number(searchParams.get('cal')) || user?.preferences?.calorieTarget || 600)
  const [diet, setDiet] = useState(searchParams.get('diet') || 'none')
  const [cuisine, setCuisine] = useState(searchParams.get('cuisine') || '')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [totalResults, setTotalResults] = useState(0)
  const [offset, setOffset] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  const search = async (newOffset = 0) => {
    if (ingredients.length === 0) { toast.error('Add at least one ingredient!'); return }
    setLoading(true)
    setSearched(true)
    try {
      const { data } = await api.post('/recipes/search', {
        ingredients, maxCalories, diet, cuisine: cuisine || undefined, number: 12, offset: newOffset,
      })
      if (newOffset === 0) setResults(data.results)
      else setResults(prev => [...prev, ...data.results])
      setTotalResults(data.totalResults)
      setOffset(newOffset)
      setSearchParams({ ing: ingredients.join(','), cal: maxCalories, diet, ...(cuisine && { cuisine }) })
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed')
    } finally {
      setLoading(false)
    }
  }

  const handleStarToggle = (recipeId, isNowStarred) => {
    setResults(prev => prev.map(r => r.id === recipeId ? { ...r, isStarred: isNowStarred } : r))
  }

  const saveMyIngredients = async () => {
    try {
      await api.put('/user/ingredients', { ingredients })
      toast.success('Ingredients saved to profile!')
    } catch { toast.error('Sign in to save ingredients') }
  }

  return (
    <div className="page-enter" style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title" style={{ marginBottom: 6 }}>Find your next meal</h1>
        <p style={{ color: 'var(--text-muted)' }}>Enter what's in your kitchen and discover recipes that match</p>
      </div>

      {/* Search panel */}
      <div className="card" style={{ padding: 28, marginBottom: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Ingredients */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                🥕 Ingredients in your kitchen
              </label>
              {user && ingredients.length > 0 && (
                <button className="btn btn-ghost btn-sm" onClick={saveMyIngredients} style={{ fontSize: 12 }}>
                  💾 Save list
                </button>
              )}
            </div>
            <IngredientInput ingredients={ingredients} onChange={setIngredients} />
          </div>

          {/* Calories */}
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
              🔥 Calorie target (max per recipe)
            </label>
            <CalorieSlider value={maxCalories} onChange={setMaxCalories} />
          </div>

          {/* Filters toggle */}
          <div>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowFilters(!showFilters)}
              style={{ color: 'var(--amber)', paddingLeft: 0 }}
            >
              {showFilters ? '▲' : '▼'} {showFilters ? 'Hide' : 'Show'} filters (diet, cuisine)
            </button>

            {showFilters && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Diet</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {DIETS.map(d => (
                      <button key={d} onClick={() => setDiet(d)}
                        style={{
                          padding: '5px 12px', borderRadius: 100, fontSize: 12, fontWeight: 500,
                          border: '1px solid', cursor: 'pointer', transition: 'var(--transition)',
                          borderColor: diet === d ? 'var(--amber)' : 'var(--border)',
                          background: diet === d ? 'rgba(200,131,42,0.15)' : 'var(--bg-elevated)',
                          color: diet === d ? 'var(--amber)' : 'var(--text-secondary)',
                        }}>
                        {d === 'none' ? 'Any' : d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 500 }}>Cuisine</label>
                  <select
                    className="input-field"
                    value={cuisine}
                    onChange={e => setCuisine(e.target.value)}
                    style={{ background: 'var(--bg-elevated)' }}
                  >
                    {CUISINES.map(c => <option key={c} value={c}>{c || 'Any cuisine'}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Search button */}
          <button
            className="btn btn-primary btn-lg"
            onClick={() => search(0)}
            disabled={loading || ingredients.length === 0}
            style={{ justifyContent: 'center' }}
          >
            {loading ? '⏳ Searching...' : '🔍 Find Recipes'}
          </button>
        </div>
      </div>

      {/* Results */}
      {searched && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {loading && results.length === 0 ? 'Searching...' : (
                totalResults > 0
                  ? <><span style={{ color: 'var(--amber)', fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{totalResults}</span> recipes found</>
                  : 'No recipes found — try different ingredients'
              )}
            </h2>
            {results.length > 0 && (
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Showing {results.length} of {totalResults}</span>
            )}
          </div>

          {loading && results.length === 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {Array(12).fill(0).map((_, i) => (
                <div key={i} className="card" style={{ overflow: 'hidden' }}>
                  <div className="skeleton" style={{ aspectRatio: '4/3' }} />
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div className="skeleton" style={{ height: 18, borderRadius: 4, width: '80%' }} />
                    <div className="skeleton" style={{ height: 14, borderRadius: 4, width: '50%' }} />
                    <div className="skeleton" style={{ height: 36, borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {results.map(r => <RecipeCard key={r.id} recipe={r} onStarToggle={handleStarToggle} />)}
              </div>

              {results.length < totalResults && (
                <div style={{ textAlign: 'center', marginTop: 32 }}>
                  <button
                    className="btn btn-secondary btn-lg"
                    onClick={() => search(offset + 12)}
                    disabled={loading}
                  >
                    {loading ? 'Loading...' : 'Load more recipes'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {!searched && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 72, marginBottom: 16 }}>🥗</div>
          <p style={{ fontSize: '1.1rem' }}>Add your ingredients above and hit <strong style={{ color: 'var(--amber)' }}>Find Recipes</strong></p>
        </div>
      )}
    </div>
  )
}
