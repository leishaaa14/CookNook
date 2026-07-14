import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack']
const MEAL_COLORS = { breakfast: '#e8c56a', lunch: 'var(--green-light)', dinner: 'var(--amber)', snack: '#7ab4e8' }

const getWeekStart = (offset = 0) => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function MealPlanPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [removing, setRemoving] = useState(null)

  const weekStart = getWeekStart(weekOffset)
  const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })

  const fetchPlan = () => {
    setLoading(true)
    api.get(`/meal-plan?week=${weekStart.toISOString()}`)
      .then(({ data }) => setPlan(data))
      .catch(() => toast.error('Failed to load meal plan'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchPlan, [weekOffset])

  const removeMeal = async (day, mealId) => {
    setRemoving(mealId)
    try {
      const { data } = await api.delete('/meal-plan/remove', {
        data: { day, mealId, week: weekStart.toISOString() }
      })
      setPlan(data.plan)
      toast.success('Removed from plan')
    } catch { toast.error('Failed to remove') }
    finally { setRemoving(null) }
  }

  const totalCaloriesForDay = (day) => {
    return (plan?.days?.[day] || []).reduce((sum, m) => sum + (m.calories || 0), 0)
  }

  return (
    <div className="page-enter" style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 32 }}>
        <div>
          <h1 className="section-title">📅 Meal Plan</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Week of {weekLabel}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w - 1)}>← Prev</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>Today</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w + 1)}>Next →</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10 }}>
          {DAYS.map(d => <div key={d} className="skeleton" style={{ height: 300, borderRadius: 'var(--radius-lg)' }} />)}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
          {DAYS.map(day => {
            const meals = plan?.days?.[day] || []
            const dayCalories = Math.round(totalCaloriesForDay(day))
            return (
              <div key={day} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                {/* Day header */}
                <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg-elevated)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--cream)', fontSize: 14 }}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </div>
                  {dayCalories > 0 && (
                    <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 2 }}>🔥 {dayCalories} kcal</div>
                  )}
                </div>

                {/* Meals */}
                <div style={{ padding: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {MEAL_TYPES.map(mealType => {
                    const typeMeals = meals.filter(m => m.mealType === mealType)
                    if (typeMeals.length === 0) return (
                      <div key={mealType} style={{ padding: '6px 0' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, color: MEAL_COLORS[mealType] }}>
                          {mealType}
                        </div>
                        <div style={{ height: 28, border: '1px dashed var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'var(--text-muted)' }}>
                          empty
                        </div>
                      </div>
                    )
                    return (
                      <div key={mealType}>
                        <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4, color: MEAL_COLORS[mealType] }}>
                          {mealType}
                        </div>
                        {typeMeals.map(meal => (
                          <div key={meal._id} style={{
                            background: 'var(--bg-elevated)', borderRadius: 8, overflow: 'hidden',
                            border: '1px solid var(--border)', marginBottom: 4
                          }}>
                            <Link to={`/recipe/${meal.recipeId}`} style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
                              {meal.image && (
                                <img src={meal.image} alt={meal.title} style={{ width: '100%', height: 60, objectFit: 'cover' }} />
                              )}
                              <div style={{ padding: '6px 8px' }}>
                                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--cream)', lineHeight: 1.3,
                                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                  {meal.title}
                                </p>
                                {meal.calories > 0 && (
                                  <p style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{Math.round(meal.calories)} kcal</p>
                                )}
                              </div>
                            </Link>
                            <div style={{ padding: '0 8px 8px' }}>
                              <button
                                onClick={() => removeMeal(day, meal._id)}
                                disabled={removing === meal._id}
                                style={{ marginTop: 4, fontSize: 10, color: 'var(--red)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.7 }}
                              >
                                ✕ remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Info tip */}
      <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(200,131,42,0.06)', border: '1px solid rgba(200,131,42,0.15)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <span>💡 To add recipes to your plan, open any recipe and click <strong style={{ color: 'var(--amber)' }}>Add to Meal Plan</strong></span>
        <Link to="/shopping-list" className="btn btn-primary btn-sm">🛒 View Shopping List</Link>
      </div>
    </div>
  )
}
