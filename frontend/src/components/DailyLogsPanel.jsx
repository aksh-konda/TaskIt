import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'

const inputClass =
  'w-full rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white'

const emptyForm = {
  logDate: new Date().toISOString().slice(0, 10),
  mood: '',
  energy: 70,
  sleepHours: 7,
  wins: '',
  blockers: '',
  notes: '',
}

const CALENDAR_HINT_KEY = 'taskit-hint-calendar'

export default function DailyLogsPanel() {
  const [logs, setLogs] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [calendarExpanded, setCalendarExpanded] = useState(false)
  const [showCalendarHint, setShowCalendarHint] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(CALENDAR_HINT_KEY) !== 'dismissed'
  })
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const selectedDate = form.logDate ? new Date(form.logDate) : new Date()

  const weekDays = (() => {
    const cursor = new Date(selectedDate)
    const weekStartOffset = cursor.getDay()
    cursor.setDate(cursor.getDate() - weekStartOffset)
    const days = []
    for (let index = 0; index < 7; index += 1) {
      const day = new Date(cursor)
      day.setDate(cursor.getDate() + index)
      days.push(day)
    }
    return days
  })()

  const monthDays = (() => {
    const year = calendarCursor.getFullYear()
    const month = calendarCursor.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const prefixCount = firstDay.getDay()
    const cells = []

    for (let i = 0; i < prefixCount; i += 1) {
      cells.push(null)
    }

    for (let day = 1; day <= lastDay.getDate(); day += 1) {
      cells.push(new Date(year, month, day))
    }

    return cells
  })()

  const pickDate = (date) => {
    const next = date.toISOString().slice(0, 10)
    setForm((prev) => ({ ...prev, logDate: next }))
  }

  const isSelected = (date) => date.toISOString().slice(0, 10) === form.logDate

  const isToday = (date) => date.toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10)

  const dismissCalendarHint = () => {
    setShowCalendarHint(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(CALENDAR_HINT_KEY, 'dismissed')
    }
  }

  const fetchLogs = async () => {
    setLoading(true)
    try {
      const response = await api.get('/daily-logs')
      setLogs(Array.isArray(response.data) ? response.data : [])
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch daily logs'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLogs()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await api.post('/daily-logs', {
        logDate: form.logDate,
        mood: form.mood.trim() || null,
        energy: Number(form.energy),
        sleepHours: Number(form.sleepHours),
        wins: form.wins.trim() || null,
        blockers: form.blockers.trim() || null,
        notes: form.notes.trim() || null,
      })
      setForm({ ...emptyForm, logDate: new Date().toISOString().slice(0, 10) })
      await fetchLogs()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create daily log'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (logId) => {
    try {
      await api.delete(`/daily-logs/${logId}`)
      setLogs((prev) => prev.filter((log) => log.id !== logId))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete daily log'))
    }
  }

  return (
    <section className="space-y-4">
      {showCalendarHint && (
        <div className="hint-card rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-black">Calendar tip</p>
              <p className="mt-1 text-xs text-black/55">Keep week view for fast check-ins. Expand to month for broader review.</p>
            </div>
            <button
              type="button"
              onClick={dismissCalendarHint}
              className="rounded-md border border-black/10 px-2 py-1 text-xs text-black/60"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
      >
        <h2 className="text-lg font-medium text-black">Daily Reflection</h2>
        <p className="mt-1 text-sm text-black/45">Capture mood, energy, wins, blockers, and notes.</p>

        <div className="mt-3 rounded-xl border border-black/10 bg-[#fafafa] p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-black/45">
              {calendarExpanded ? 'Month view' : 'Week view'}
            </p>
            <button
              type="button"
              onClick={() => setCalendarExpanded((prev) => !prev)}
              className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs text-black/70"
            >
              {calendarExpanded ? 'Collapse to week' : 'Expand to month'}
            </button>
          </div>

          {!calendarExpanded && (
            <div className="mt-3 grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pickDate(day)}
                  className={`rounded-md px-1 py-2 text-xs transition ${
                    isSelected(day)
                      ? 'bg-black text-white'
                      : isToday(day)
                        ? 'bg-black/10 text-black'
                        : 'bg-white text-black/65'
                  }`}
                >
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  <div className="text-sm font-medium">{day.getDate()}</div>
                </button>
              ))}
            </div>
          )}

          {calendarExpanded && (
            <div className="mt-3">
              <div className="mb-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() =>
                    setCalendarCursor(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1),
                    )
                  }
                  className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-black/65"
                >
                  Prev
                </button>
                <p className="text-sm font-medium text-black">
                  {calendarCursor.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setCalendarCursor(
                      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1),
                    )
                  }
                  className="rounded-md border border-black/10 bg-white px-2 py-1 text-xs text-black/65"
                >
                  Next
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-xs text-black/45">
                <span>Sun</span>
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {monthDays.map((day, index) =>
                  day ? (
                    <button
                      key={day.toISOString()}
                      type="button"
                      onClick={() => pickDate(day)}
                      className={`rounded-md py-2 text-xs transition ${
                        isSelected(day)
                          ? 'bg-black text-white'
                          : isToday(day)
                            ? 'bg-black/10 text-black'
                            : 'bg-white text-black/65'
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  ) : (
                    <span key={`empty-${index}`} className="py-2" />
                  ),
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input type="date" className={inputClass} required value={form.logDate} readOnly />
          <input
            className={inputClass}
            placeholder="Mood"
            value={form.mood}
            onChange={(event) => setForm((prev) => ({ ...prev, mood: event.target.value }))}
          />
          <input
            type="number"
            min={0}
            max={100}
            className={inputClass}
            placeholder="Energy"
            value={form.energy}
            onChange={(event) => setForm((prev) => ({ ...prev, energy: event.target.value }))}
          />
          <input
            type="number"
            min={0}
            max={24}
            step={0.5}
            className={inputClass}
            placeholder="Sleep hours"
            value={form.sleepHours}
            onChange={(event) => setForm((prev) => ({ ...prev, sleepHours: event.target.value }))}
          />
        </div>

        <textarea
          rows={2}
          className={`mt-2 min-h-16 ${inputClass}`}
          placeholder="Wins"
          value={form.wins}
          onChange={(event) => setForm((prev) => ({ ...prev, wins: event.target.value }))}
        />
        <textarea
          rows={2}
          className={`mt-2 min-h-16 ${inputClass}`}
          placeholder="Blockers"
          value={form.blockers}
          onChange={(event) => setForm((prev) => ({ ...prev, blockers: event.target.value }))}
        />
        <textarea
          rows={2}
          className={`mt-2 min-h-20 ${inputClass}`}
          placeholder="Notes"
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
        />

        <button
          type="submit"
          disabled={saving}
          className="mt-3 rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Add reflection'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-black/65">{error}</div>
      )}

      {loading && <div className="text-sm text-black/45">Loading logs...</div>}

      {!loading && logs.length === 0 && (
        <div className="rounded-xl border border-black/10 bg-white px-5 py-8 text-sm text-black/45 shadow-sm">
          No daily logs yet.
        </div>
      )}

      {!loading && logs.length > 0 && (
        <div className="space-y-3">
          {logs.map((log) => (
            <article
              key={log.id}
              className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-black">{log.logDate}</h3>
                  <p className="mt-1 text-xs text-black/45">
                    Mood: {log.mood || 'N/A'} | Energy: {log.energy ?? 'N/A'} | Sleep: {log.sleepHours ?? 'N/A'}h
                  </p>
                  {log.wins && <p className="mt-2 text-sm text-black/65">Wins: {log.wins}</p>}
                  {log.blockers && <p className="mt-1 text-sm text-black/65">Blockers: {log.blockers}</p>}
                  {log.notes && <p className="mt-1 text-sm text-black/65">Notes: {log.notes}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(log.id)}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 hover:bg-black/[0.03]"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
