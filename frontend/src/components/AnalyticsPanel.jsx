import { useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const dayKey = (date) => date.toISOString().slice(0, 10)

const buildHeatmapDays = (logs) => {
  const completedByDay = new Set((logs || []).map((log) => log.logDate).filter(Boolean))
  const days = []

  for (let i = 55; i >= 0; i -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = dayKey(date)
    days.push({
      key,
      active: completedByDay.has(key),
    })
  }

  return days
}

export default function AnalyticsPanel() {
  const [tasks, setTasks] = useState([])
  const [dailyLogs, setDailyLogs] = useState([])
  const [sessions, setSessions] = useState([])
  const [habits, setHabits] = useState([])

  useEffect(() => {
    const load = async () => {
      const [tasksRes, logsRes, sessionsRes, habitsRes] = await Promise.allSettled([
        api.get('/tasks'),
        api.get('/daily-logs'),
        api.get('/sessions'),
        api.get('/habits'),
      ])

      setTasks(tasksRes.status === 'fulfilled' && Array.isArray(tasksRes.value.data) ? tasksRes.value.data : [])
      setDailyLogs(logsRes.status === 'fulfilled' && Array.isArray(logsRes.value.data) ? logsRes.value.data : [])
      setSessions(
        sessionsRes.status === 'fulfilled' && Array.isArray(sessionsRes.value.data)
          ? sessionsRes.value.data
          : [],
      )
      setHabits(habitsRes.status === 'fulfilled' && Array.isArray(habitsRes.value.data) ? habitsRes.value.data : [])
    }

    load()
  }, [])

  const completedTasks = tasks.filter((task) => task.status === 'COMPLETED').length

  const weeklyFocusMinutes = useMemo(() => {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    return sessions
      .filter((session) => session.startTime)
      .filter((session) => new Date(session.startTime) >= sevenDaysAgo)
      .reduce((total, session) => {
        if (!session.endTime || !session.startTime) return total
        const start = new Date(session.startTime)
        const end = new Date(session.endTime)
        const diff = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 60000))
        return total + diff
      }, 0)
  }, [sessions])

  const completionRate = tasks.length === 0 ? 0 : Math.round((completedTasks / tasks.length) * 100)

  const activeStreak = useMemo(() => {
    const daySet = new Set(dailyLogs.map((log) => log.logDate).filter(Boolean))
    let streak = 0

    for (let offset = 0; offset < 30; offset += 1) {
      const date = new Date()
      date.setDate(date.getDate() - offset)
      const key = dayKey(date)
      if (!daySet.has(key)) break
      streak += 1
    }

    return streak
  }, [dailyLogs])

  const heatmapDays = useMemo(() => buildHeatmapDays(dailyLogs), [dailyLogs])

  return (
    <aside className="sticky top-4 space-y-3">
      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Live Metrics</h3>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-lg bg-[#f7f7f7] p-3">
            <p className="text-black/45">Tasks done</p>
            <p className="mt-1 text-xl font-semibold text-black">{completedTasks}</p>
          </div>
          <div className="rounded-lg bg-[#f7f7f7] p-3">
            <p className="text-black/45">Habits</p>
            <p className="mt-1 text-xl font-semibold text-black">{habits.length}</p>
          </div>
          <div className="rounded-lg bg-[#f7f7f7] p-3">
            <p className="text-black/45">Streak</p>
            <p className="mt-1 text-xl font-semibold text-black">{activeStreak}d</p>
          </div>
          <div className="rounded-lg bg-[#f7f7f7] p-3">
            <p className="text-black/45">Focus / 7d</p>
            <p className="mt-1 text-xl font-semibold text-black">{weeklyFocusMinutes}m</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Activity Heatmap</h3>
        <div className="mt-3 grid grid-cols-8 gap-1">
          {heatmapDays.map((day) => (
            <div
              key={day.key}
              title={day.key}
              className={`h-4 rounded-sm ${day.active ? 'bg-black/85' : 'bg-black/10'}`}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
        <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-black/45">Weekly Completion</h3>
        <div className="mt-4">
          <div className="h-2 w-full rounded-full bg-black/10">
            <div
              className="h-2 rounded-full bg-black transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-black/65">{completionRate}% of tasks completed</p>
        </div>
      </section>
    </aside>
  )
}
