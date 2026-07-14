import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const NavIcon = ({ path }) => {
  const icons = {
    home: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>,
    search: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    star: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>,
    calendar: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    user: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
    logout: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    cart: <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 001.99 1.61h9.72a2 2 0 001.99-1.45l1.65-7.55H6"/></svg>,
    menu: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
    close: <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  }
  return icons[path] || null
}

export default function Navbar() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const isActive = (path) => location.pathname === path

  const navLinks = user
    ? [
        { to: '/search', label: 'Find Recipes', icon: 'search' },
        { to: '/saved', label: 'Saved', icon: 'star' },
        { to: '/meal-plan', label: 'Meal Plan', icon: 'calendar' },
        { to: '/shopping-list', label: 'Shopping', icon: 'cart' },
        { to: '/profile', label: 'Profile', icon: 'user' },
      ]
    : [
        { to: '/search', label: 'Browse', icon: 'search' },
      ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(15,10,4,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', height: 64, gap: 8 }}>

        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginRight: 'auto', textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: 'linear-gradient(135deg, var(--amber), #8a4a10)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🍳</div>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--cream)' }}>
            Cook<span style={{ color: 'var(--amber)' }}>Nook</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 'var(--radius-md)',
                fontSize: 14, fontWeight: 500,
                color: isActive(link.to) ? 'var(--amber)' : 'var(--text-secondary)',
                background: isActive(link.to) ? 'rgba(200,131,42,0.12)' : 'transparent',
                transition: 'var(--transition)',
              }}
            >
              <NavIcon path={link.icon} />
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth buttons */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 12px', borderRadius: 'var(--radius-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'linear-gradient(135deg, var(--amber), #8a4a10)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#0f0a04' }}>
                {user.name[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/') }} title="Logout">
              <NavIcon path="logout" />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, marginLeft: 8 }}>
            <Link to="/login" className="btn btn-secondary btn-sm">Log in</Link>
            <Link to="/signup" className="btn btn-primary btn-sm">Sign up</Link>
          </div>
        )}

        {/* Mobile menu button */}
        <button className="btn btn-ghost" style={{ display: 'none' }} onClick={() => setMenuOpen(!menuOpen)} id="mobile-menu-btn">
          <NavIcon path={menuOpen ? 'close' : 'menu'} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 24px 16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {navLinks.map(link => (
            <Link key={link.to} to={link.to} onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 'var(--radius-md)', color: isActive(link.to) ? 'var(--amber)' : 'var(--text-secondary)', background: isActive(link.to) ? 'rgba(200,131,42,0.1)' : 'transparent' }}>
              <NavIcon path={link.icon} />{link.label}
            </Link>
          ))}
          {user ? (
            <button className="btn btn-secondary" style={{ marginTop: 8 }} onClick={() => { logout(); navigate('/'); setMenuOpen(false) }}>
              <NavIcon path="logout" /> Logout
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link to="/login" className="btn btn-secondary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link to="/signup" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setMenuOpen(false)}>Sign up</Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          #mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </nav>
  )
}
