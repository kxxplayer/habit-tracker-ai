import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Toaster, toast } from 'react-hot-toast'
import { PlusCircle, X, Loader2 } from 'lucide-react'
import { supabase } from './supabase'
import { getMe, fetchHabits, createHabit, logHabitComplete } from './api'
import Sidebar from './components/Sidebar'
import HabitCard from './components/HabitCard'
import StatsChart from './components/StatsChart'
import Login from './components/Login'
import './index.css'

function App() {
  const [session, setSession] = useState(undefined) // undefined = loading, null = logged out
  const [user, setUser] = useState(null)
  const [habits, setHabits] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiNote, setAiNote] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')

  // Listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  // When logged in, load data
  useEffect(() => {
    if (!session) {
      setLoading(false)
      return
    }
    const loadData = async () => {
      setLoading(true)
      try {
        const dbUser = await getMe()
        setUser(dbUser)
        const dbHabits = await fetchHabits()
        setHabits(dbHabits)
      } catch (err) {
        console.error('Failed to load data:', err)
        // If backend isn't ready yet, still show the dashboard (empty state)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [session])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setHabits([])
    toast.success('Logged out!', { style: { background: '#222630', color: 'white', border: '1px solid rgba(255,255,255,0.08)' } })
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const newHabit = await createHabit({ title: newTitle, description: newDesc })
      setHabits(prev => [...prev, newHabit])
      setNewTitle('')
      setNewDesc('')
      setShowForm(false)
      toast.success('Habit created! 🎯', { style: { background: '#222630', color: 'white', border: '1px solid rgba(255,255,255,0.08)' } })
    } catch {
      toast.error('Failed to create habit')
    }
    setCreating(false)
  }

  const handleComplete = async (habitId) => {
    setAiNote({ habitId, text: '', loading: true })
    try {
      const log = await logHabitComplete(habitId)
      setAiNote({ habitId, text: log.notes, loading: false })
      toast.success('Habit completed! 🔥', { style: { background: '#222630', color: 'white', border: '1px solid rgba(255,255,255,0.08)' } })
      setTimeout(() => setAiNote(null), 6000)
    } catch {
      toast.error('Something went wrong')
      setAiNote(null)
    }
  }

  // Auth loading (checking session)
  if (session === undefined || (session && loading)) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
          <Loader2 size={40} color="#6366f1" />
        </motion.div>
      </div>
    )
  }

  // Not logged in → show Login screen
  if (!session) {
    return <Login onAuth={setSession} />
  }

  // Dashboard
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Toaster position="top-right" />
      <Sidebar
        habitsCount={habits.length}
        completedToday={0}
        userEmail={session.user?.email}
        onLogout={handleLogout}
      />

      <main style={{ flex: 1, padding: '2.5rem', maxWidth: '960px', overflowY: 'auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}
        >
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }} className="text-gradient">Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} className="btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? <X size={18} /> : <PlusCircle size={18} />}
            <span>{showForm ? 'Cancel' : 'New Habit'}</span>
          </motion.button>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <StatsChart habits={habits} />
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: '2rem' }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="card"
              style={{ border: '1px solid var(--accent-primary)', overflow: 'hidden' }}
            >
              <h3 style={{ marginBottom: '1.25rem', fontSize: '1.1rem', fontWeight: 600 }}>Create New Habit</h3>
              <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input className="input-base" placeholder="Habit title (e.g., Read 10 pages)" value={newTitle} onChange={e => setNewTitle(e.target.value)} required autoFocus />
                <input className="input-base" placeholder="Short description (optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  <button type="submit" className="btn" disabled={creating}>
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <PlusCircle size={16} />}
                    <span>{creating ? 'Creating...' : 'Create Habit'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div layout style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <AnimatePresence>
            {habits.length === 0 && !showForm && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ gridColumn: '1/-1', textAlign: 'center', padding: '4rem 2rem' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
                <h3 style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>No habits yet</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Click "New Habit" to plant your first one!</p>
              </motion.div>
            )}
            {habits.map(habit => (
              <HabitCard key={habit.id} habit={habit} onComplete={handleComplete} aiNote={aiNote} />
            ))}
          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  )
}

export default App
