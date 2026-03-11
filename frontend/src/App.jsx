import { useState, useEffect } from 'react'
import { PlusCircle, CheckCircle2, Circle, Loader2, Sparkles } from 'lucide-react'
import { getOrCreateUser, fetchHabits, createHabit, logHabitComplete } from './api'
import './index.css'

function App() {
  const [user, setUser] = useState(null);
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiNote, setAiNote] = useState(null);
  const [creating, setCreating] = useState(false);
  
  // New habit form state
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  useEffect(() => {
    const initData = async () => {
      const dbUser = await getOrCreateUser();
      if (dbUser) {
        setUser(dbUser);
        const dbHabits = await fetchHabits(dbUser.id);
        setHabits(dbHabits);
      }
      setLoading(false);
    };
    initData();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    setCreating(true);
    const newHabit = await createHabit(user.id, { title: newTitle, description: newDesc });
    setHabits([...habits, newHabit]);
    setNewTitle('');
    setNewDesc('');
    setShowForm(false);
    setCreating(false);
  };

  const handleComplete = async (habitId) => {
    // Optimistic UI updates could go here, but let's just wait for the AI response
    try {
      setAiNote({ habitId, text: "AI is thinking...", loading: true });
      const log = await logHabitComplete(user.id, habitId);
      
      setAiNote({ habitId, text: log.notes, loading: false });
      
      // Auto dismiss note after 5 seconds
      setTimeout(() => {
        setAiNote(null);
      }, 5000);
      
    } catch (e) {
      console.error(e);
      setAiNote(null);
    }
  };

  if (loading) {
    return <div className="container flex items-center justify-center" style={{ height: '100vh' }}><Loader2 className="animate-spin" size={32} /></div>
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '3rem' }}>
      <header className="animate-slide-up flex justify-between items-center" style={{ marginBottom: '3rem' }}>
        <div>
          <h1 className="text-gradient" style={{ fontSize: '2.5rem', fontWeight: 700, margin: 0 }}>Habitify AI</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>Your personal AI-powered habit coach.</p>
        </div>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          <PlusCircle size={20} />
          <span>{showForm ? 'Cancel' : 'New Habit'}</span>
        </button>
      </header>

      <main className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
        
        {showForm && (
          <div className="card animate-slide-up" style={{ marginBottom: '2rem', border: '1px solid var(--accent-primary)' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>Create New Habit</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <input type="text" className="input-base" placeholder="Habit Title (e.g., Read 10 pages)" value={newTitle} onChange={e => setNewTitle(e.target.value)} required />
              <input type="text" className="input-base" placeholder="Description (Optional)" value={newDesc} onChange={e => setNewDesc(e.target.value)} />
              <div className="flex justify-between items-center" style={{ marginTop: '0.5rem' }}>
                <span className="text-muted text-sm">Powered by AI Coaching</span>
                <button type="submit" className="btn" disabled={creating}>
                 {creating ? <Loader2 className="animate-spin" size={18} /> : <span>Create Habit</span>}
                </button>
              </div>
            </form>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {habits.length === 0 && !showForm && (
             <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
               <p>No habits aligned yet. Click "New Habit" to start.</p>
             </div>
          )}

          {habits.map(habit => (
            <div key={habit.id} className="card flex flex-col justify-between" style={{ minHeight: '180px', position: 'relative' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{habit.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>{habit.description}</p>
              </div>
              
              <div className="flex items-center justify-between" style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                 <button className="btn btn-secondary" onClick={() => handleComplete(habit.id)} style={{ padding: '0.5rem 1rem', width: '100%' }}>
                    <Circle size={18} />
                    <span>Complete & Get AI Coach</span>
                 </button>
              </div>

              {/* AI Coaching Toast for this habit */}
              {aiNote && aiNote.habitId === habit.id && (
                <div className="animate-slide-up" style={{ 
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                  background: 'rgba(99, 102, 241, 0.95)', 
                  backdropFilter: 'blur(8px)',
                  padding: '1.5rem', borderRadius: 'var(--radius-lg)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center',
                  zIndex: 10
                }}>
                   {aiNote.loading ? (
                      <Loader2 className="animate-spin" size={32} color="white" />
                   ) : (
                      <>
                        <Sparkles size={32} color="#fcd34d" style={{ marginBottom: '1rem' }} />
                        <p style={{ color: 'white', fontWeight: 500, lineHeight: 1.4 }}>{aiNote.text}</p>
                      </>
                   )}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App
