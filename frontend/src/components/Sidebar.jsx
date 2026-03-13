import { motion } from 'framer-motion'
import { LayoutDashboard, Flame, BarChart2, Settings, Star, LogOut, User } from 'lucide-react'

export default function Sidebar({ habitsCount, completedToday, userEmail, onLogout, activeTab, onTabChange }) {
  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { id: 'stats', icon: <BarChart2 size={20} />, label: 'Stats' },
    { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
  ]

  return (
    <motion.aside
      initial={{ x: -80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      style={{
        width: '240px',
        minHeight: '100vh',
        background: 'var(--bg-secondary)',
        borderRight: '1px solid var(--border)',
        padding: '2rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
    >
      {/* User profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.75rem',
        background: 'var(--bg-primary)', borderRadius: '10px', marginBottom: '0.5rem' }}>
        <div style={{ background: 'var(--accent-light)', borderRadius: '50%', width: '32px', height: '32px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={16} color="var(--accent-primary)" />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-primary)', fontWeight: 600,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userEmail || 'User'}
          </p>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Habit Tracker</p>
        </div>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem' }}>
          <div style={{ background: 'var(--accent-primary)', borderRadius: '10px', padding: '6px', display: 'flex' }}>
            <Flame size={20} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.25rem' }} className="text-gradient">Habitify</span>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '2.4rem' }}>AI Habit Coach</p>
      </div>

      {/* Stats pills */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        <div style={{ background: 'var(--accent-light)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Total Habits</span>
          <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{habitsCount}</span>
        </div>
        <div style={{ background: 'rgba(16,185,129,0.12)', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Done Today</span>
          <span style={{ fontWeight: 700, color: 'var(--success)' }}>{completedToday}</span>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {navItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onTabChange(item.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.7rem 1rem', borderRadius: '10px', cursor: 'pointer',
              background: activeTab === item.id ? 'var(--accent-light)' : 'transparent',
              color: activeTab === item.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
              transition: 'all 0.2s',
              fontWeight: activeTab === item.id ? 600 : 400,
            }}
          >
            {item.icon}
            {item.label}
          </div>
        ))}
      </nav>

      {/* Bottom section */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
          <Star size={20} color="#fcd34d" style={{ marginBottom: '0.5rem' }} />
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>AI Coach Active</p>
          <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.6)', marginTop: '0.2rem' }}>Powered by Gemini</p>
        </div>
        <button
          onClick={onLogout}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-secondary)',
            borderRadius: '10px', padding: '0.65rem', cursor: 'pointer',
            fontFamily: 'Outfit, sans-serif', fontSize: '0.875rem', fontWeight: 500,
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.target.style.borderColor = '#ef4444'; e.target.style.color = '#ef4444' }}
          onMouseLeave={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-secondary)' }}
        >
          <LogOut size={16} />
          Log Out
        </button>
      </div>
    </motion.aside>
  )
}

