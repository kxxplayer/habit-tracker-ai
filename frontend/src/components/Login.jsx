import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Mail, Lock, Loader2, ArrowRight } from 'lucide-react'
import { supabase } from '../supabase'

export default function Login({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onAuth(data.session)
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setMessage('Check your email to confirm your account!')
      }
    } catch (err) {
      setError(err.message)
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at 60% 20%, rgba(99,102,241,0.15) 0%, var(--bg-primary) 60%)',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: '420px', padding: '1rem' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            background: 'var(--accent-primary)', borderRadius: '16px',
            width: '56px', height: '56px', marginBottom: '1rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
          }}>
            <Flame size={28} color="white" />
          </div>
          <h1 className="text-gradient" style={{ fontSize: '2rem', fontWeight: 700 }}>Habitify AI</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.4rem', fontSize: '0.9rem' }}>
            Your personal AI-powered habit coach
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ border: '1px solid rgba(99,102,241,0.2)' }}>
          {/* Toggle tabs */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            background: 'var(--bg-secondary)', borderRadius: '10px',
            padding: '4px', marginBottom: '1.75rem',
          }}>
            {['Login', 'Sign Up'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setIsLogin(tab === 'Login'); setError(''); setMessage('') }}
                style={{
                  padding: '0.5rem', border: 'none', cursor: 'pointer', borderRadius: '8px',
                  background: (isLogin ? tab === 'Login' : tab === 'Sign Up')
                    ? 'var(--accent-primary)' : 'transparent',
                  color: (isLogin ? tab === 'Login' : tab === 'Sign Up')
                    ? 'white' : 'var(--text-secondary)',
                  fontWeight: 600, fontSize: '0.9rem',
                  fontFamily: 'Outfit, sans-serif',
                  transition: 'all 0.2s',
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-base"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
                required
                autoFocus
              />
            </div>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                className="input-base"
                type="password"
                placeholder="Password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
                required
                minLength={6}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ color: '#ef4444', fontSize: '0.85rem', textAlign: 'center' }}>
                  {error}
                </motion.p>
              )}
              {message && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ color: '#10b981', fontSize: '0.85rem', textAlign: 'center' }}>
                  {message}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              className="btn"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              style={{ width: '100%', padding: '0.8rem', fontSize: '1rem', marginTop: '0.5rem' }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              <span>{loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}</span>
            </motion.button>
          </form>
        </div>

        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          Secured by Supabase Auth 🔐
        </p>
      </motion.div>
    </div>
  )
}
