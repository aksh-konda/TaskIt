import { useEffect, useState } from 'react'
import client from '../api/client'

export default function InsightsPage() {
  const [summary, setSummary] = useState(null)
  const [events, setEvents] = useState([])

  useEffect(() => {
    Promise.all([client.get('/gamification/summary'), client.get('/gamification/xp-events')])
      .then(([summaryRes, eventsRes]) => {
        setSummary(summaryRes.data)
        setEvents(eventsRes.data || [])
      })
      .catch(() => {
        setSummary(null)
        setEvents([])
      })
  }, [])

  return (
    <section className="stack">
      <h2>Insights</h2>
      <div className="grid two">
        <article className="card">
          <h3>Level Progress</h3>
          <p className="metric">Level {summary?.level ?? 1}</p>
          <p className="subtle">XP to next level: {summary?.xpToNextLevel ?? 0}</p>
        </article>
        <article className="card">
          <h3>Badges</h3>
          <ul className="list">
            {(summary?.badges || []).map((badge) => (
              <li key={`${badge.code}-${badge.earnedAt}`}>{badge.code}</li>
            ))}
          </ul>
        </article>
      </div>
      <article className="card">
        <h3>Recent XP Events</h3>
        <ul className="list">
          {events.slice(0, 10).map((event) => (
            <li key={event.id}>+{event.xp} XP via {event.sourceType}</li>
          ))}
        </ul>
      </article>
    </section>
  )
}
