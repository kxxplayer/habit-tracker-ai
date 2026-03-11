import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Flame, Sparkles, Loader2, Target } from 'lucide-react'

// Pick an icon based on habit title
function getHabitIcon(title) {
  const t = title.toLowerCase()
  if (t.includes('water') || t.includes('drink')) return '💧'
  if (t.includes('read') || t.includes('book')) return '📚'
  if (t.includes('walk') || t.includes('run') || t.includes('exercise') || t.includes('gym')) return '🏃'
  if (t.includes('meditat') || t.includes('mindful')) return '🧘'
  if (t.includes('sleep') || t.includes('rest')) return '😴'
  if (t.includes('learn') || t.includes('study') || t.includes('japanese') || t.includes('code')) return '🎓'
  if (t.includes('eat') || t.includes('diet') || t.includes('vegetable')) return '🥗'
  if (t.includes('write') || t.includes('journal')) return '✍️'
  return '⭐'
}

export default function HabitCard({ habit, onComplete, aiNote }) {
  const isThisNote = aiNote && aiNote.habitId === habit.id
  const icon = getHabitIcon(habit.title)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -4, boxShadow: '0 8px 32px rgba(99,102,241,0.2)' }}
      transition={{ duration: 0.3 }}
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: '200px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
      }}
    >
      {/* Subtle top gradient accent */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, var(--accent-primary), #8b5cf6)',
      }} />

      <div>
        {/* Icon + Title */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>{icon}</span>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
              {habit.title}
            </h3>
            {habit.description && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                {habit.description}
              </p>
            )}
          </div>
        </div>

        {/* Streak indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            background: 'rgba(245,158,11,0.12)', borderRadius: '20px',
            padding: '0.25rem 0.7rem', width: 'fit-content',
          }}>
            <Flame size={14} color="#f59e0b" />
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
              {(habit.logs?.length || 0)} completions
            </span>
          </div>
        </div>
      </div>

      {/* Complete button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => onComplete(habit.id)}
        className="btn btn-secondary"
        style={{ marginTop: '1.25rem', width: '100%', justifyContent: 'center', padding: '0.65rem' }}
      >
        <Target size={16} />
        <span>Complete & Get AI Coach</span>
      </motion.button>

      {/* AI Note Overlay */}
      <AnimatePresence>
        {isThisNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.97), rgba(139,92,246,0.97))',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center', alignItems: 'center',
              textAlign: 'center', padding: '1.5rem',
            }}
          >
            {aiNote.loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                <Loader2 size={32} color="white" />
              </motion.div>
            ) : (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Sparkles size={32} color="#fcd34d" style={{ marginBottom: '0.75rem' }} />
                <p style={{ color: 'white', fontWeight: 500, fontSize: '0.95rem', lineHeight: 1.5 }}>
                  {aiNote.text}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem', marginTop: '0.75rem' }}>
                  — Your AI Coach
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
