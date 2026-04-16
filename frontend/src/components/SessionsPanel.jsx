import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'

const inputClass =
  'w-full rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white'

const emptyForm = {
  taskId: '',
  startTime: '',
  endTime: '',
  focusScore: 70,
  distractionCount: 0,
  notes: '',
}

const toIso = (value) => (value ? new Date(value).toISOString() : null)

export default function SessionsPanel() {
  const [sessions, setSessions] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const fetchSessions = async () => {
    setLoading(true)
    try {
      const response = await api.get('/sessions')
      setSessions(Array.isArray(response.data) ? response.data : [])
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch sessions'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSessions()
  }, [])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await api.post('/sessions', {
        taskId: form.taskId ? Number(form.taskId) : null,
        startTime: toIso(form.startTime),
        endTime: toIso(form.endTime),
        focusScore: Number(form.focusScore),
        distractionCount: Number(form.distractionCount),
        notes: form.notes.trim() || null,
      })
      setForm(emptyForm)
      await fetchSessions()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create session'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (sessionId) => {
    try {
      await api.delete(`/sessions/${sessionId}`)
      setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete session'))
    }
  }

  return (
    <section className="space-y-4">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
      >
        <h2 className="text-lg font-medium text-black">Work Sessions</h2>
        <p className="mt-1 text-sm text-black/45">Capture focused work sessions and reflection notes.</p>

        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input
            className={inputClass}
            type="number"
            min={1}
            placeholder="Task ID (optional)"
            value={form.taskId}
            onChange={(event) => setForm((prev) => ({ ...prev, taskId: event.target.value }))}
          />
          <input
            required
            className={inputClass}
            type="datetime-local"
            value={form.startTime}
            onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))}
          />
          <input
            className={inputClass}
            type="datetime-local"
            value={form.endTime}
            onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))}
          />
          <input
            className={inputClass}
            type="number"
            min={0}
            max={100}
            value={form.focusScore}
            onChange={(event) => setForm((prev) => ({ ...prev, focusScore: event.target.value }))}
            placeholder="Focus score"
          />
          <input
            className={inputClass}
            type="number"
            min={0}
            value={form.distractionCount}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, distractionCount: event.target.value }))
            }
            placeholder="Distractions"
          />
        </div>

        <textarea
          rows={2}
          className={`mt-2 min-h-20 ${inputClass}`}
          value={form.notes}
          onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))}
          placeholder="Session notes"
        />

        <button
          type="submit"
          disabled={saving}
          className="mt-3 rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Add session'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-black/65">{error}</div>
      )}

      {loading && <div className="text-sm text-black/45">Loading sessions...</div>}

      {!loading && sessions.length === 0 && (
        <div className="rounded-xl border border-black/10 bg-white px-5 py-8 text-sm text-black/45 shadow-sm">
          No sessions yet.
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="space-y-3">
          {sessions.map((session) => (
            <article
              key={session.id}
              className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-sm font-medium text-black">Session #{session.id}</h3>
                  <p className="mt-1 text-sm text-black/55">
                    {new Date(session.startTime).toLocaleString()} {'->'}{' '}
                    {session.endTime ? new Date(session.endTime).toLocaleString() : 'ongoing'}
                  </p>
                  <p className="mt-1 text-xs text-black/45">
                    Focus {session.focusScore ?? 'N/A'} | Distractions {session.distractionCount ?? 0}
                  </p>
                  {session.notes && <p className="mt-2 text-sm text-black/65">{session.notes}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(session.id)}
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
