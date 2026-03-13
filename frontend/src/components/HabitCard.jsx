import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Flame, Sparkles, Loader2, Target, X, CheckCircle2 } from 'lucide-react'

// Helper: Get array of the last 7 days (including today)
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

// Helper: Check if a log exists for a specific date
function isCompletedOnDate(logs, dateObj) {
  if (!logs) return false;
  // Use local time zone for string comparison
  const dateStr = dateObj.toLocaleDateString();
  return logs.some(log => new Date(log.completed_at).toLocaleDateString() === dateStr);
}

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

export default function HabitCard({ habit, onComplete, aiNote, onDismissAiNote }) {
  const isThisNote = aiNote && aiNote.habitId === habit.id
  const icon = getHabitIcon(habit.title)
  const last7Days = getLast7Days();

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'default',
        gap: '2rem',
        width: '100%'
      }}
    >
      {/* Subtle left gradient accent */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: '4px',
        background: 'linear-gradient(180deg, var(--accent-primary), #8b5cf6)',
      }} />

      {/* Left section: Icon + Info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
        <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{icon}</span>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {habit.title}
          </h3>
          {habit.description && (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
              {habit.description}
            </p>
          )}
          
          {/* Streak indicator */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.3rem',
            background: 'rgba(245,158,11,0.12)', borderRadius: '20px',
            padding: '0.25rem 0.7rem', width: 'fit-content',
            marginTop: '0.5rem'
          }}>
            <Flame size={14} color="#f59e0b" />
            <span style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
              {(habit.logs?.length || 0)} total completions
            </span>
          </div>
        </div>
      </div>

      {/* Middle section: Weekly progress */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Last 7 Days</span>
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          {last7Days.map((date, i) => {
            const isCompleted = isCompletedOnDate(habit.logs, date);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' }); // S, M, T, W, T, F, S
            const isToday = i === 6;
            
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.7rem', color: isToday ? 'var(--accent-primary)' : 'var(--text-muted)', fontWeight: isToday ? 700 : 500 }}>
                  {dayName}
                </span>
                <div 
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isCompleted ? 'rgba(99,102,241,0.15)' : 'var(--bg-card-hover)',
                    border: isCompleted ? '2px solid var(--accent-primary)' : '2px solid transparent',
                    color: isCompleted ? 'var(--accent-primary)' : 'var(--text-muted)',
                    transition: 'all 0.2s ease'
                  }}
                  title={date.toLocaleDateString()}
                >
                  {isCompleted ? <CheckCircle2 size={16} strokeWidth={3} /> : <Circle size={10} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right section: Complete button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onComplete(habit.id)}
        className="btn btn-secondary"
        style={{ padding: '0.75rem 1.25rem', whiteSpace: 'nowrap' }}
      >
        <Target size={18} />
        <span>Complete</span>
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
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ position: 'relative', width: '100%' }}>
                <button 
                  onClick={onDismissAiNote}
                  style={{ position: 'absolute', top: '-1rem', right: '0', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer' }}
                >
                  <X size={24} />
                </button>
                <Sparkles size={32} color="#fcd34d" style={{ marginBottom: '0.75rem', margin: '0 auto' }} />
                <p style={{ color: 'white', fontWeight: 500, fontSize: '1rem', lineHeight: 1.5, maxWidth: '80%', margin: '0 auto' }}>
                  {aiNote.text}
                </p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', marginTop: '0.75rem' }}>
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
