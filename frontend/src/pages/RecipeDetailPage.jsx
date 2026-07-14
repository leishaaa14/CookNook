import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function RecipeDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [starring, setStarring] = useState(false)
  const [activeTab, setActiveTab] = useState('instructions')
  const [mealPlanOpen, setMealPlanOpen] = useState(false)
  const [selectedDay, setSelectedDay] = useState('monday')
  const [selectedMealType, setSelectedMealType] = useState('dinner')
  const [addingToPlan, setAddingToPlan] = useState(false)
  const [shoppingOpen, setShoppingOpen] = useState(false)
  const [selectedIngredients, setSelectedIngredients] = useState({})
  const [savingShoppingItems, setSavingShoppingItems] = useState(false)

  useEffect(() => {
    setLoading(true)
    api.get(`/recipes/${id}`)
      .then(({ data }) => setRecipe(data))
      .catch(() => toast.error('Failed to load recipe'))
      .finally(() => setLoading(false))
  }, [id])

  const handleStar = async () => {
    if (!user) { toast.error('Sign in to save recipes'); return }
    setStarring(true)
    try {
      if (recipe.isStarred) {
        await api.delete(`/user/star/${id}`)
        setRecipe(r => ({ ...r, isStarred: false }))
        toast.success('Removed from saved')
      } else {
        await api.post(`/user/star/${id}`, {
          id: recipe.id, title: recipe.title, image: recipe.image,
          calories: recipe.nutrition?.calories ? parseFloat(recipe.nutrition.calories) : 0,
          readyInMinutes: recipe.readyInMinutes, servings: recipe.servings,
          summary: recipe.summary, diets: recipe.diets, cuisines: recipe.cuisines,
          sourceUrl: recipe.sourceUrl,
        })
        setRecipe(r => ({ ...r, isStarred: true }))
        toast.success('Recipe saved! ⭐')
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed')
    } finally {
      setStarring(false)
    }
  }

  const handleAddToPlan = async () => {
    setAddingToPlan(true)
    try {
      await api.post('/meal-plan/add', {
        day: selectedDay, mealType: selectedMealType,
        recipe: { id: recipe.id, title: recipe.title, image: recipe.image,
          calories: recipe.nutrition?.calories ? parseFloat(recipe.nutrition.calories) : 0, servings: recipe.servings },
      })
      toast.success(`Added to ${selectedDay} ${selectedMealType}! 📅`)
      setMealPlanOpen(false)
    } catch (err) {
      toast.error('Failed to add to meal plan')
    } finally {
      setAddingToPlan(false)
    }
  }

  const handleToggleIngredient = (name) => {
    setSelectedIngredients(prev => ({ ...prev, [name]: !prev[name] }))
  }

  const handleSelectAllIngredients = () => {
    const next = {}
    recipe.extendedIngredients?.forEach(ing => {
      next[ing.name] = true
    })
    setSelectedIngredients(next)
  }

  const handleClearIngredients = () => {
    setSelectedIngredients({})
  }

  const handleSaveShoppingItems = async () => {
    const selected = recipe.extendedIngredients?.filter(ing => selectedIngredients[ing.name]) || []
    if (selected.length === 0) {
      toast.error('Select at least one ingredient to add')
      return
    }

    setSavingShoppingItems(true)
    try {
      await api.post('/meal-plan/shopping-list', {
        week: new Date().toISOString(),
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        ingredients: selected.map(ing => ({
          id: ing.id,
          name: ing.name,
          original: ing.original,
          amount: ing.measures?.metric?.amount || ing.amount || 0,
          unit: ing.measures?.metric?.unitShort || ing.unit || '',
          image: ing.image || '',
          category: ing.aisle || '',
        })),
      })
      toast.success('Selected ingredients added to shopping list! 🛒')
      setShoppingOpen(false)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save shopping list')
    } finally {
      setSavingShoppingItems(false)
    }
  }

  if (loading) return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div className="skeleton" style={{ height: 400, borderRadius: 'var(--radius-lg)', marginBottom: 24 }} />
      <div className="skeleton" style={{ height: 36, width: '60%', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 100 }} />
    </div>
  )

  if (!recipe) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>😞</div>
      <p style={{ color: 'var(--text-muted)' }}>Recipe not found.</p>
      <button className="btn btn-secondary" style={{ marginTop: 16 }} onClick={() => navigate(-1)}>← Go back</button>
    </div>
  )

  const nutrients = recipe.nutrition?.nutrients || []
  const getN = (name) => nutrients.find(n => n.name === name)

  const macros = [
    { label: 'Calories', value: recipe.nutrition?.calories, unit: '', color: '#e8966a' },
    { label: 'Protein', value: recipe.nutrition?.protein, unit: '', color: 'var(--green-light)' },
    { label: 'Carbs', value: recipe.nutrition?.carbs, unit: '', color: '#7ab4e8' },
    { label: 'Fat', value: recipe.nutrition?.fat, unit: '', color: '#e8c56a' },
  ]

  return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 20, paddingLeft: 0, color: 'var(--text-muted)' }}>
        ← Back
      </button>

      {/* Hero image */}
      <div style={{ position: 'relative', borderRadius: 'var(--radius-xl)', overflow: 'hidden', aspectRatio: '16/7', marginBottom: 28, background: 'var(--bg-elevated)' }}>
        {recipe.image && <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,10,4,0.85) 0%, rgba(15,10,4,0.2) 50%, transparent 100%)' }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 28 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
            {recipe.diets?.slice(0, 3).map(d => <span key={d} className="tag tag-green" style={{ fontSize: 11 }}>{d}</span>)}
            {recipe.cuisines?.slice(0, 1).map(c => <span key={c} className="tag tag-amber" style={{ fontSize: 11 }}>{c}</span>)}
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2.4rem)', fontWeight: 900, color: 'var(--cream)', lineHeight: 1.2 }}>
            {recipe.title}
          </h1>
        </div>
      </div>

      {/* Action bar */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
        <button
          className={`btn ${recipe.isStarred ? 'btn-primary' : 'btn-secondary'}`}
          onClick={handleStar} disabled={starring}
        >
          {recipe.isStarred ? '⭐ Saved' : '☆ Save Recipe'}
        </button>
        {user && (
          <button className="btn btn-secondary" onClick={() => setMealPlanOpen(!mealPlanOpen)}>
            📅 Add to Meal Plan
          </button>
        )}
        {recipe.sourceUrl && (
          <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
            🔗 Source
          </a>
        )}
        {user && (
          <button className="btn btn-secondary" onClick={() => {
            setShoppingOpen(!shoppingOpen)
            if (!shoppingOpen) handleSelectAllIngredients()
          }}>
            🛒 Choose Shopping Ingredients
          </button>
        )}
      </div>

      {/* Meal plan picker */}
      {mealPlanOpen && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <h3 style={{ fontWeight: 600, color: 'var(--cream)', marginBottom: 14 }}>Add to meal plan</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Day</label>
              <select className="input-field" value={selectedDay} onChange={e => setSelectedDay(e.target.value)} style={{ background: 'var(--bg-elevated)' }}>
                {['monday','tuesday','wednesday','thursday','friday','saturday','sunday'].map(d => (
                  <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Meal</label>
              <select className="input-field" value={selectedMealType} onChange={e => setSelectedMealType(e.target.value)} style={{ background: 'var(--bg-elevated)' }}>
                {['breakfast','lunch','dinner','snack'].map(m => <option key={m} value={m}>{m.charAt(0).toUpperCase() + m.slice(1)}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" onClick={handleAddToPlan} disabled={addingToPlan}>
            {addingToPlan ? 'Adding...' : '+ Add to Plan'}
          </button>
        </div>
      )}
      {shoppingOpen && (
        <div className="card" style={{ padding: 20, marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h3 style={{ fontWeight: 600, color: 'var(--cream)', margin: 0 }}>Choose ingredients for shopping</h3>
            <button className="btn btn-ghost btn-sm" onClick={() => setShoppingOpen(false)}>Close</button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
            <button className="btn btn-secondary btn-sm" onClick={handleSelectAllIngredients}>Select all</button>
            <button className="btn btn-secondary btn-sm" onClick={handleClearIngredients}>Clear all</button>
            <span style={{ color: 'var(--text-muted)', fontSize: 13, alignSelf: 'center' }}>
              Pick the ingredients you still need, then save them to your shopping list.
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
            {recipe.extendedIngredients?.map((ing, i) => {
              const checked = !!selectedIngredients[ing.name]
              return (
                <label key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, borderRadius: 12, border: `1px solid ${checked ? 'var(--amber)' : 'var(--border)'}`, background: checked ? 'rgba(200,131,42,0.08)' : 'var(--bg-card)', cursor: 'pointer' }}>
                  <input type="checkbox" checked={checked} onChange={() => handleToggleIngredient(ing.name)} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, color: 'var(--cream)' }}>{ing.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ing.original}</div>
                  </div>
                </label>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 18 }}>
            <button className="btn btn-primary" onClick={handleSaveShoppingItems} disabled={savingShoppingItems}>
              {savingShoppingItems ? 'Saving...' : 'Save selected ingredients'}
            </button>
            <button className="btn btn-secondary" onClick={() => setShoppingOpen(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Quick stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 12, marginBottom: 28 }}>
        {[
          { label: 'Prep time', value: `${recipe.readyInMinutes} min`, icon: '⏱️' },
          { label: 'Servings', value: recipe.servings, icon: '🍽️' },
          { label: 'Calories', value: recipe.nutrition?.calories ? `${Math.round(parseFloat(recipe.nutrition.calories))} kcal` : '—', icon: '🔥' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--cream)' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
        {macros.slice(1).map(m => (
          <div key={m.label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>
              {m.label === 'Protein' ? '💪' : m.label === 'Carbs' ? '🌾' : '🧈'}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: m.color }}>{m.value || '—'}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {['instructions', 'ingredients', 'nutrition'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 18px', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 14, fontWeight: 500, transition: 'var(--transition)',
              color: activeTab === tab ? 'var(--amber)' : 'var(--text-muted)',
              borderBottom: `2px solid ${activeTab === tab ? 'var(--amber)' : 'transparent'}`,
              marginBottom: -1,
            }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'instructions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {recipe.instructions?.length > 0 ? recipe.instructions.map((step) => (
            <div key={step.number} style={{ display: 'flex', gap: 16, padding: '16px 20px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--amber)', color: '#0f0a04', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                {step.number}
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, marginTop: 2 }}>{step.step}</p>
            </div>
          )) : (
            <p style={{ color: 'var(--text-muted)' }}>No step-by-step instructions available. <a href={recipe.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--amber)' }}>View original recipe →</a></p>
          )}
        </div>
      )}

      {activeTab === 'ingredients' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
          {recipe.extendedIngredients?.map((ing, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
              <img
                src={`https://spoonacular.com/cdn/ingredients_100x100/${ing.image}`}
                alt={ing.name} style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none' }}
              />
              <div>
                <div style={{ fontSize: 13, color: 'var(--cream)', fontWeight: 500 }}>{ing.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ing.original}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
          {nutrients.slice(0, 20).map(n => (
            <div key={n.name} style={{ padding: '12px 14px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{n.name}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--cream)' }}>{Math.round(n.amount)}{n.unit}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
