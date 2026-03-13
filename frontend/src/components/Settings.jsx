import { motion } from 'framer-motion'
import { User, Shield, Palette, Bell, Trash2 } from 'lucide-react'

export default function Settings({ userEmail }) {
  const sections = [
    { label: 'Profile', icon: <User size={20} />, description: 'Manage your account details and email.' },
    { label: 'Privacy', icon: <Shield size={20} />, description: 'Security settings and data permissions.' },
    { label: 'Appearance', icon: <Palette size={20} />, description: 'Customize themes and visual preferences.' },
    { label: 'Notifications', icon: <Bell size={20} />, description: 'Configure email and push alerts.' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1rem' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={32} color="var(--accent-primary)" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{userEmail}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Pro Member</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {sections.map((s) => (
          <div key={s.label} className="card" style={{ cursor: 'pointer', transition: 'transform 0.2s' }} onClick={() => alert('Settings coming soon!')}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{ background: 'var(--bg-secondary)', borderRadius: '10px', padding: '10px', display: 'flex' }}>
                {s.icon}
              </div>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>{s.label}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem', lineHeight: 1.4 }}>{s.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.02)' }}>
        <h3 style={{ color: '#ef4444', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Trash2 size={18} /> Danger Zone
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Permanently delete your account and all habit data. This action cannot be undone.
        </p>
        <button className="btn" style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444', marginTop: '1rem', width: 'fit-content' }}>
          Delete Account
        </button>
      </div>
    </motion.div>
  )
}
