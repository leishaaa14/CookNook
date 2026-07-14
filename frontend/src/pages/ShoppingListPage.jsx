import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const getWeekStart = (offset = 0) => {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + offset * 7
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export default function ShoppingListPage() {
  const [weekOffset, setWeekOffset] = useState(0)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [checked, setChecked] = useState({})
  const [searchQuery, setSearchQuery] = useState('')
  const [collapsedCategories, setCollapsedCategories] = useState({})
  const printRef = useRef()

  const weekStart = getWeekStart(weekOffset)
  const weekLabel = weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })

  const fetchList = () => {
    setLoading(true)
    setChecked({})
    api.get(`/meal-plan/shopping-list?week=${weekStart.toISOString()}`)
      .then(({ data }) => setData(data))
      .catch(() => toast.error('Failed to load shopping list'))
      .finally(() => setLoading(false))
  }

  useEffect(fetchList, [weekOffset])

  const toggleItem = (key) => setChecked(prev => ({ ...prev, [key]: !prev[key] }))

  const toggleCategory = (cat) => setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }))

  const checkAllInCategory = (cat, items) => {
    const allChecked = items.every(i => checked[i.name])
    const updates = {}
    items.forEach(i => { updates[i.name] = !allChecked })
    setChecked(prev => ({ ...prev, ...updates }))
  }

  const clearAll = () => setChecked({})

  const handleClearShoppingList = async () => {
    try {
      await api.delete('/meal-plan/shopping-list', { data: { week: weekStart.toISOString() } })
      toast.success('Shopping list cleared')
      fetchList()
    } catch {
      toast.error('Failed to clear shopping list')
    }
  }

  const checkedCount = Object.values(checked).filter(Boolean).length
  const totalCount = data?.ingredients?.length || 0

  const filteredGrouped = () => {
    if (!data?.grouped) return {}
    if (!searchQuery.trim()) return data.grouped
    const q = searchQuery.toLowerCase()
    const result = {}
    for (const [cat, items] of Object.entries(data.grouped)) {
      const filtered = items.filter(i => i.name.toLowerCase().includes(q) || i.original.toLowerCase().includes(q))
      if (filtered.length > 0) result[cat] = filtered
    }
    return result
  }

  const copyToClipboard = () => {
    if (!data?.grouped) return
    const lines = []
    lines.push(`🛒 Shopping List — Week of ${weekLabel}`)
    lines.push(`${data.recipeCount} recipes · ${totalCount} items\n`)
    for (const [cat, items] of Object.entries(data.grouped)) {
      lines.push(cat)
      items.forEach(i => {
        const amt = i.amount ? `${Math.round(i.amount * 10) / 10}${i.unit ? ' ' + i.unit : ''}` : ''
        lines.push(`  • ${i.name}${amt ? ' — ' + amt : ''}`)
      })
      lines.push('')
    }
    navigator.clipboard.writeText(lines.join('\n'))
    toast.success('Copied to clipboard! 📋')
  }

  const handlePrint = () => {
    const content = printRef.current
    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>Shopping List — ${weekLabel}</title>
      <style>
        body { font-family: Georgia, serif; max-width: 700px; margin: 40px auto; color: #1a1206; }
        h1 { font-size: 1.8rem; margin-bottom: 4px; }
        .meta { color: #666; font-size: 0.9rem; margin-bottom: 24px; }
        .category { margin-bottom: 20px; }
        .category-title { font-size: 1rem; font-weight: bold; border-bottom: 2px solid #c8832a; padding-bottom: 4px; margin-bottom: 10px; color: #8a4a10; }
        .item { display: flex; align-items: center; gap: 10px; padding: 4px 0; font-size: 0.9rem; }
        .checkbox { width: 14px; height: 14px; border: 1.5px solid #999; border-radius: 3px; flex-shrink: 0; }
        .amount { color: #c8832a; font-weight: bold; min-width: 80px; }
        @media print { body { margin: 20px; } }
      </style></head><body>
      <h1>🛒 Shopping List</h1>
      <div class="meta">Week of ${weekLabel} · ${data?.recipeCount} recipes · ${totalCount} items</div>
      ${Object.entries(data?.grouped || {}).map(([cat, items]) => `
        <div class="category">
          <div class="category-title">${cat}</div>
          ${items.map(i => `
            <div class="item">
              <div class="checkbox"></div>
              <span class="amount">${i.amount ? (Math.round(i.amount * 10) / 10) + (i.unit ? ' ' + i.unit : '') : ''}</span>
              <span>${i.name}</span>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </body></html>`)
    win.document.close()
    win.print()
  }

  const grouped = filteredGrouped()
  const categoryCount = Object.keys(grouped).length

  return (
    <div className="page-enter" style={{ maxWidth: 900, margin: '0 auto', padding: '36px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 28 }}>
        <div>
          <h1 className="section-title">🛒 Shopping List</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: 6 }}>
            Ingredients from your meal plan — week of {weekLabel}
          </p>
        </div>

        {/* Week navigation */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w - 1)}>← Prev</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(0)} disabled={weekOffset === 0}>This week</button>
          <button className="btn btn-secondary btn-sm" onClick={() => setWeekOffset(w => w + 1)}>Next →</button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {Array(5).fill(0).map((_, i) => (
            <div key={i}>
              <div className="skeleton" style={{ height: 20, width: 160, borderRadius: 4, marginBottom: 10 }} />
              {Array(3).fill(0).map((_, j) => (
                <div key={j} className="skeleton" style={{ height: 48, borderRadius: 10, marginBottom: 8 }} />
              ))}
            </div>
          ))}
        </div>
      ) : !data || data.ingredients?.length === 0 ? (
        /* Empty state */
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🛒</div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', color: 'var(--cream)', marginBottom: 10 }}>
            No meals planned this week
          </h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 28, maxWidth: 400, margin: '0 auto 28px' }}>
            Add recipes to your meal plan first, then your shopping list will be auto-generated here.
          </p>
          <Link to="/meal-plan" className="btn btn-primary">📅 Go to Meal Plan</Link>
        </div>
      ) : (
        <>
          {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
            {[
              { icon: '🍽️', value: data.recipeCount, label: 'Recipes' },
              { icon: '📦', value: totalCount, label: 'Ingredients' },
              { icon: '✅', value: checkedCount, label: 'Checked off' },
              { icon: '🗂️', value: categoryCount, label: 'Categories' },
            ].map(s => (
              <div key={s.label} className="card" style={{ padding: '14px 16px', textAlign: 'center' }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--amber)' }}>{s.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          {checkedCount > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-muted)', marginBottom: 6 }}>
                <span>{checkedCount} of {totalCount} items picked up</span>
                <span style={{ color: 'var(--amber)' }}>{Math.round((checkedCount / totalCount) * 100)}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--bg-elevated)', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3,
                  width: `${(checkedCount / totalCount) * 100}%`,
                  background: 'linear-gradient(to right, var(--amber-dim), var(--amber))',
                  transition: 'width 0.3s ease',
                }} />
              </div>
              {checkedCount === totalCount && (
                <p style={{ textAlign: 'center', color: 'var(--green-light)', fontWeight: 600, marginTop: 8 }}>
                  🎉 All done! Happy cooking!
                </p>
              )}
            </div>
          )}

          {/* Toolbar */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
              <input
                className="input-field"
                placeholder="🔍 Search ingredients..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ paddingLeft: 14 }}
              />
            </div>
            <button className="btn btn-secondary btn-sm" onClick={copyToClipboard}>📋 Copy</button>
            <button className="btn btn-secondary btn-sm" onClick={handlePrint}>🖨️ Print</button>
            <button className="btn btn-ghost btn-sm" onClick={handleClearShoppingList} style={{ color: 'var(--text-muted)' }}>
              🗑️ Clear list
            </button>
            {checkedCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={clearAll} style={{ color: 'var(--text-muted)' }}>
                ✕ Clear checks
              </button>
            )}
          </div>

          {/* Ingredient list grouped by category */}
          <div ref={printRef} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {Object.entries(grouped).map(([category, items]) => {
              const allChecked = items.every(i => checked[i.name])
              const someChecked = items.some(i => checked[i.name])
              const isCollapsed = collapsedCategories[category]

              return (
                <div key={category} className="card" style={{ overflow: 'hidden' }}>
                  {/* Category header */}
                  <div
                    onClick={() => toggleCategory(category)}
                    style={{
                      padding: '14px 18px',
                      background: 'var(--bg-elevated)',
                      borderBottom: isCollapsed ? 'none' : '1px solid var(--border)',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      cursor: 'pointer', userSelect: 'none',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {/* Category checkbox */}
                      <div
                        onClick={e => { e.stopPropagation(); checkAllInCategory(category, items) }}
                        style={{
                          width: 20, height: 20, borderRadius: 6,
                          border: `2px solid ${allChecked ? 'var(--green-light)' : someChecked ? 'var(--amber)' : 'var(--border-light)'}`,
                          background: allChecked ? 'rgba(122,191,122,0.2)' : someChecked ? 'rgba(200,131,42,0.15)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'var(--transition)', flexShrink: 0,
                        }}
                      >
                        {allChecked && <span style={{ fontSize: 12, color: 'var(--green-light)' }}>✓</span>}
                        {someChecked && !allChecked && <span style={{ fontSize: 10, color: 'var(--amber)' }}>−</span>}
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--cream)', fontSize: '0.95rem' }}>{category}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {items.filter(i => checked[i.name]).length}/{items.length}
                      </span>
                    </div>
                    <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{isCollapsed ? '▼' : '▲'}</span>
                  </div>

                  {/* Items */}
                  {!isCollapsed && (
                    <div style={{ padding: '8px 0' }}>
                      {items.map((item, idx) => {
                        const isChecked = checked[item.name] || false
                        const amountStr = item.amount
                          ? `${Math.round(item.amount * 10) / 10}${item.unit ? ' ' + item.unit : ''}`
                          : ''

                        return (
                          <div
                            key={item.name + idx}
                            onClick={() => toggleItem(item.name)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 14,
                              padding: '10px 18px', cursor: 'pointer',
                              borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none',
                              background: isChecked ? 'rgba(122,191,122,0.04)' : 'transparent',
                              transition: 'background 0.15s',
                              opacity: isChecked ? 0.55 : 1,
                            }}
                            onMouseEnter={e => { if (!isChecked) e.currentTarget.style.background = 'var(--bg-elevated)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = isChecked ? 'rgba(122,191,122,0.04)' : 'transparent' }}
                          >
                            {/* Checkbox */}
                            <div style={{
                              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                              border: `2px solid ${isChecked ? 'var(--green-light)' : 'var(--border-light)'}`,
                              background: isChecked ? 'rgba(122,191,122,0.2)' : 'transparent',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'var(--transition)',
                            }}>
                              {isChecked && <span style={{ fontSize: 12, color: 'var(--green-light)', fontWeight: 700 }}>✓</span>}
                            </div>

                            {/* Ingredient image */}
                            {item.image && (
                              <img
                                src={`https://spoonacular.com/cdn/ingredients_100x100/${item.image}`}
                                alt={item.name}
                                style={{ width: 36, height: 36, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }}
                                onError={e => e.target.style.display = 'none'}
                              />
                            )}

                            {/* Name & original */}
                            <div style={{ flex: 1, overflow: 'hidden' }}>
                              <div style={{
                                fontWeight: 600, color: 'var(--cream)', fontSize: 14,
                                textDecoration: isChecked ? 'line-through' : 'none',
                                textTransform: 'capitalize',
                              }}>
                                {item.name}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                                {item.original}
                              </div>
                              {item.extra && (
                                <div style={{ fontSize: 11, color: 'var(--amber-dim)', marginTop: 2 }}>
                                  also: {item.extra}
                                </div>
                              )}
                            </div>

                            {/* Amount badge */}
                            {amountStr && (
                              <div style={{
                                padding: '4px 10px', borderRadius: 100, flexShrink: 0,
                                background: 'rgba(200,131,42,0.12)', border: '1px solid rgba(200,131,42,0.25)',
                                fontSize: 12, fontWeight: 600, color: 'var(--amber-light)',
                              }}>
                                {amountStr}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* No search results */}
          {searchQuery && categoryCount === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
              No ingredients match "<strong style={{ color: 'var(--cream)' }}>{searchQuery}</strong>"
            </div>
          )}

          {/* Bottom tip */}
          <div style={{ marginTop: 24, padding: '14px 18px', background: 'rgba(200,131,42,0.06)', border: '1px solid rgba(200,131,42,0.15)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--text-muted)' }}>
            💡 Tap any item to check it off as you shop. Click the category checkbox to check/uncheck all items in that section.
          </div>
        </>
      )}
    </div>
  )
}
