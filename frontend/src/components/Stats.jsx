import { motion } from 'framer-motion'
import { Target, TrendingUp, Calendar, Zap } from 'lucide-react'
import StatsChart from './StatsChart'

export default function Stats({ habits }) {
  const totalCompletions = habits.reduce((acc, h) => acc + (h.logs?.length || 0), 0)
  
  // Find most consistent habit
  const mostConsistent = habits.length > 0 
    ? [...habits].sort((a, b) => (b.logs?.length || 0) - (a.logs?.length || 0))[0]
    : null

  const statsPills = [
    { label: 'Total Logs', value: totalCompletions, icon: <Target size={18} />, color: '#6366f1' },
    { label: 'Active habits', value: habits.length, icon: <Zap size={18} />, color: '#f59e0b' },
    { label: 'Completion rate', value: habits.length > 0 ? `${Math.round((totalCompletions / (habits.length * 7)) * 100)}%` : '0%', icon: <TrendingUp size={18} />, color: '#10b981' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
        {statsPills.map((p) => (
          <div key={p.label} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem' }}>
            <div style={{ background: `${p.color}20`, borderRadius: '12px', padding: '10px', display: 'flex', color: p.color }}>
              {p.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{p.label}</p>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{p.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: '1.5rem', fontWeight: 600 }}>Activity Overview</h3>
        <StatsChart habits={habits} />
      </div>

      {mostConsistent && (
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Most Consistent Habit</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              You've logged <strong>{mostConsistent.title}</strong> {mostConsistent.logs?.length} times!
            </p>
          </div>
          <div style={{ fontSize: '2.5rem' }}>🏆</div>
        </div>
      )}
    </motion.div>
  )
}
