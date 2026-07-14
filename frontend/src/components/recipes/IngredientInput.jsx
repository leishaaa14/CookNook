import { useState, useRef, useEffect, useCallback } from 'react'
import api from '../../utils/api'

const XIcon = () => <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const PlusIcon = () => <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

export default function IngredientInput({ ingredients, onChange }) {
  const [inputValue, setInputValue] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)

  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) { setSuggestions([]); return }
    setLoadingSuggestions(true)
    try {
      const { data } = await api.get(`/recipes/autocomplete?query=${encodeURIComponent(query)}`)
      setSuggestions(data.slice(0, 6))
    } catch {
      setSuggestions([])
    } finally {
      setLoadingSuggestions(false)
    }
  }, [])

  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchSuggestions(inputValue), 300)
    return () => clearTimeout(debounceRef.current)
  }, [inputValue, fetchSuggestions])

  const addIngredient = (name) => {
    const trimmed = name.trim().toLowerCase()
    if (!trimmed || ingredients.includes(trimmed)) return
    onChange([...ingredients, trimmed])
    setInputValue('')
    setSuggestions([])
    setShowSuggestions(false)
    inputRef.current?.focus()
  }

  const removeIngredient = (ing) => onChange(ingredients.filter(i => i !== ing))

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      if (suggestions.length > 0) addIngredient(suggestions[0].name)
      else if (inputValue.trim()) addIngredient(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && ingredients.length > 0) {
      removeIngredient(ingredients[ingredients.length - 1])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Tag input area */}
      <div
        onClick={() => inputRef.current?.focus()}
        style={{
          minHeight: 52, padding: '8px 12px',
          background: 'var(--bg-elevated)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center',
          cursor: 'text', transition: 'var(--transition)',
        }}
        onFocus={() => setShowSuggestions(true)}
      >
        {ingredients.map(ing => (
          <span key={ing} style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '4px 10px', borderRadius: 100,
            background: 'rgba(200,131,42,0.15)', border: '1px solid rgba(200,131,42,0.35)',
            color: 'var(--amber-light)', fontSize: 13, fontWeight: 500,
          }}>
            {ing}
            <button onClick={() => removeIngredient(ing)} style={{ background: 'none', border: 'none', color: 'inherit', display: 'flex', padding: 0, opacity: 0.7, cursor: 'pointer' }}>
              <XIcon />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={inputValue}
          onChange={e => { setInputValue(e.target.value); setShowSuggestions(true) }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          placeholder={ingredients.length === 0 ? 'e.g. chicken, tomatoes, garlic...' : 'Add more...'}
          style={{
            flex: 1, minWidth: 140, background: 'none', border: 'none', outline: 'none',
            color: 'var(--text-primary)', fontSize: 14, padding: '2px 4px',
          }}
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0, zIndex: 50,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-md)', overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        }}>
          {loadingSuggestions ? (
            <div style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: 13 }}>Searching...</div>
          ) : (
            suggestions.map(s => (
              <button
                key={s.name}
                onMouseDown={() => addIngredient(s.name)}
                style={{
                  width: '100%', padding: '10px 16px', background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center', gap: 10,
                  color: 'var(--text-primary)', fontSize: 14, textAlign: 'left', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                onMouseLeave={e => e.currentTarget.style.background = 'none'}
              >
                {s.image && (
                  <img src={`https://spoonacular.com/cdn/ingredients_100x100/${s.image}`} alt=""
                    style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover' }} />
                )}
                <span>{s.name}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--amber)', opacity: 0.6 }}><PlusIcon /></span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Quick add chips */}
      {ingredients.length === 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {['chicken', 'pasta', 'eggs', 'tomatoes', 'garlic', 'rice'].map(s => (
            <button key={s} onClick={() => addIngredient(s)}
              className="tag" style={{ cursor: 'pointer', fontSize: 12, transition: 'var(--transition)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--amber)'; e.currentTarget.style.color = 'var(--amber)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.color = '' }}>
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
