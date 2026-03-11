import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function StatsChart({ habits }) {
  // Build a simple chart: one bar per day of the week, showing how many habits were completed
  const today = new Date()
  const data = DAYS.map((day, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (today.getDay() - 1 - i + 7) % 7)
    const dateStr = d.toISOString().split('T')[0]
    
    let count = 0
    habits.forEach(habit => {
      (habit.logs || []).forEach(log => {
        if (log.completed_at?.startsWith(dateStr)) count++
      })
    })
    
    return { day, count }
  })

  const maxVal = Math.max(...data.map(d => d.count), 1)

  return (
    <div className="card" style={{ marginBottom: '2rem' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-secondary)' }}>
        This Week's Activity
      </h3>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={data} barSize={28}>
          <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis hide allowDecimals={false} domain={[0, maxVal + 1]} />
          <Tooltip
            cursor={{ fill: 'rgba(99,102,241,0.08)' }}
            contentStyle={{ background: '#222630', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', color: 'white', fontSize: '0.85rem' }}
          />
          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.count > 0 ? '#6366f1' : '#2d3142'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
