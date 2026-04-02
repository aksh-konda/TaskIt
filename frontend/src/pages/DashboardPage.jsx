import { useEffect, useState } from 'react'
import client from '../api/client'

export default function DashboardPage() {
  const [summary, setSummary] = useState(null)

  useEffect(() => {
    client.get('/gamification/summary').then((res) => setSummary(res.data)).catch(() => setSummary(null))
  }, [])

  return (
    <section className="stack">
      <h2>Dashboard</h2>
      <div className="grid three">
        <article className="card">
          <h3>Total XP</h3>
          <p className="metric">{summary?.totalXp ?? 0}</p>
        </article>
        <article className="card">
          <h3>Level</h3>
          <p className="metric">{summary?.level ?? 1}</p>
        </article>
        <article className="card">
          <h3>Habit Streak</h3>
          <p className="metric">{summary?.currentStreaks?.habit ?? 0}</p>
        </article>
      </div>
    </section>
  )
}
