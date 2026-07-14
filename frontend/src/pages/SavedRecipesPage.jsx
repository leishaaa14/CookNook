import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function SavedRecipesPage() {
  const [recipes, setRecipes] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingNotes, setEditingNotes] = useState(null)
  const [noteText, setNoteText] = useState('')

  const fetchStarred = () => {
    setLoading(true)
    api.get('/user/starred')
      .then(({ data }) => setRecipes(data.recipes))
      .catch(() => toast.error('Failed to load saved recipes'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchStarred, [])

  const unstar = async (recipeId) => {
    try {
      await api.delete(`/user/star/${recipeId}`)
      setRecipes(prev => prev.filter(r => r.recipeId !== recipeId))
      toast.success('Removed from saved')
    } catch { toast.error('Failed') }
  }

  const saveNotes = async (recipeId) => {
    try {
      await api.patch(`/user/starred/${recipeId}/notes`, { notes: noteText })
      setRecipes(prev => prev.map(r => r.recipeId === recipeId ? { ...r, notes: noteText } : r))
      setEditingNotes(null)
      toast.success('Notes saved!')
    } catch { toast.error('Failed to save notes') }
  }

  if (loading) return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="card" style={{ overflow: 'hidden' }}>
            <div className="skeleton" style={{ height: 180 }} />
            <div style={{ padding: 16 }}>
              <div className="skeleton" style={{ height: 18, marginBottom: 10, borderRadius: 4 }} />
              <div className="skeleton" style={{ height: 14, width: '60%', borderRadius: 4 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="page-enter" style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 32 }}>
        <h1 className="section-title">⭐ Saved Recipes</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>{recipes.length} recipe{recipes.length !== 1 ? 's' : ''} saved</p>
      </div>

      {recipes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 80 }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>⭐</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: 10 }}>No saved recipes yet</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Search for recipes and star the ones you love</p>
          <Link to="/search" className="btn btn-primary">Find Recipes →</Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {recipes.map(recipe => (
            <div key={recipe.recipeId} className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <Link to={`/recipe/${recipe.recipeId}`} style={{ display: 'block', position: 'relative' }}>
                {recipe.image ? (
                  <img src={recipe.image} alt={recipe.title} style={{ width: '100%', height: 180, objectFit: 'cover' }} />
                ) : (
                  <div style={{ height: 180, background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48 }}>🍽️</div>
                )}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,10,4,0.6) 0%, transparent 60%)' }} />
              </Link>

              <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to={`/recipe/${recipe.recipeId}`}>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', fontWeight: 600, color: 'var(--cream)', lineHeight: 1.3 }}>
                    {recipe.title}
                  </h3>
                </Link>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {recipe.calories > 0 && <span className="tag tag-amber" style={{ fontSize: 11 }}>🔥 {Math.round(recipe.calories)} kcal</span>}
                  {recipe.readyInMinutes > 0 && <span className="tag" style={{ fontSize: 11 }}>⏱️ {recipe.readyInMinutes} min</span>}
                  {recipe.diets?.slice(0, 1).map(d => <span key={d} className="tag tag-green" style={{ fontSize: 11 }}>{d}</span>)}
                </div>

                {/* Notes section */}
                {editingNotes === recipe.recipeId ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <textarea
                      value={noteText}
                      onChange={e => setNoteText(e.target.value)}
                      placeholder="Add your notes..."
                      rows={2}
                      className="input-field"
                      style={{ resize: 'vertical', fontSize: 13 }}
                    />
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-primary btn-sm" onClick={() => saveNotes(recipe.recipeId)}>Save</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditingNotes(null)}>Cancel</button>
                    </div>
                  </div>
                ) : recipe.notes ? (
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', fontStyle: 'italic', cursor: 'pointer', borderLeft: '2px solid var(--amber-dim)', paddingLeft: 8 }}
                    onClick={() => { setEditingNotes(recipe.recipeId); setNoteText(recipe.notes) }}>
                    📝 {recipe.notes}
                  </p>
                ) : null}

                <div style={{ display: 'flex', gap: 6, marginTop: 'auto' }}>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, flex: 1 }}
                    onClick={() => { setEditingNotes(recipe.recipeId); setNoteText(recipe.notes || '') }}
                  >
                    📝 Notes
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ fontSize: 12, color: 'var(--red)' }}
                    onClick={() => unstar(recipe.recipeId)}
                  >
                    ✕ Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
