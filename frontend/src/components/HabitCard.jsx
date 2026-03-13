import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Circle, Flame, CheckCircle2, Target, Trash2, RotateCcw } from 'lucide-react'

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
  const dateStr = dateObj.toLocaleDateString();
  return logs.some(log => new Date(log.completed_at).toLocaleDateString() === dateStr);
}

// Check if completed today
function isCompletedToday(logs) {
  if (!logs || logs.length === 0) return false;
  return isCompletedOnDate(logs, new Date());
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

export default function HabitCard({ habit, onComplete, onUndo, onDelete }) {
  const [loading, setLoading] = useState(false)
  const icon = getHabitIcon(habit.title)
  const last7Days = getLast7Days()
  const done = isCompletedToday(habit.logs)

  const handleToggle = async () => {
    setLoading(true)
    try {
      if (done) {
        await onUndo(habit.id)
      } else {
        await onComplete(habit.id)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2, boxShadow: done ? '0 8px 32px rgba(16,185,129,0.15)' : '0 8px 32px rgba(99,102,241,0.15)' }}
      transition={{ duration: 0.25 }}
      style={{
        background: 'var(--bg-card)',
        border: done ? '1px solid rgba(16,185,129,0.3)' : '1px solid var(--border)',
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
        width: '100%',
        transition: 'border-color 0.3s ease'
      }}
    >
      {/* Left accent stripe — changes color when done */}
      <div style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: '4px',
        background: done
          ? 'linear-gradient(180deg, #10b981, #34d399)'
          : 'linear-gradient(180deg, var(--accent-primary), #8b5cf6)',
        transition: 'background 0.3s ease'
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
            const dayName = date.toLocaleDateString('en-US', { weekday: 'narrow' });
            const isToday = i === 6;

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                <span style={{ fontSize: '0.7rem', color: isToday ? (done ? '#10b981' : 'var(--accent-primary)') : 'var(--text-muted)', fontWeight: isToday ? 700 : 500 }}>
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
                    background: isCompleted ? (isToday && done ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)') : 'var(--bg-card-hover)',
                    border: isCompleted ? (isToday && done ? '2px solid #10b981' : '2px solid var(--accent-primary)') : '2px solid transparent',
                    color: isCompleted ? (isToday && done ? '#10b981' : 'var(--accent-primary)') : 'var(--text-muted)',
                    transition: 'all 0.3s ease'
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

      {/* Right section: Toggle button + Delete */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleToggle}
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            borderRadius: 'var(--radius)',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'Outfit, sans-serif',
            fontSize: '0.9rem',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            background: done ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
            color: done ? '#10b981' : 'var(--accent-primary)',
            border: done ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(99,102,241,0.3)',
            transition: 'all 0.3s ease',
            opacity: loading ? 0.7 : 1,
          }}
        >
          <AnimatePresence mode="wait">
            {done ? (
              <motion.span key="done" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Completed ✓
              </motion.span>
            ) : (
              <motion.span key="todo" initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Target size={16} /> Complete
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>

        {/* Undo label — shown below the button when completed */}
        <AnimatePresence>
          {done && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleToggle}
              disabled={loading}
              title="Mark as not completed"
              style={{
                background: 'transparent',
                border: '1px solid rgba(239,68,68,0.3)',
                borderRadius: 'var(--radius)',
                padding: '0.6rem 0.9rem',
                cursor: 'pointer',
                color: '#ef4444',
                fontSize: '0.8rem',
                fontWeight: 600,
                fontFamily: 'Outfit, sans-serif',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                whiteSpace: 'nowrap',
              }}
            >
              <RotateCcw size={14} /> Not Done?
            </motion.button>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05, backgroundColor: 'rgba(239,68,68,0.15)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            if (window.confirm(`Delete "${habit.title}"? This cannot be undone.`)) {
              onDelete(habit.id)
            }
          }}
          title="Delete habit"
          style={{
            background: 'transparent',
            border: '1px solid rgba(239,68,68,0.25)',
            borderRadius: 'var(--radius)',
            padding: '0.75rem',
            cursor: 'pointer',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <Trash2 size={18} />
        </motion.button>
      </div>
    </motion.div>
  )
}
