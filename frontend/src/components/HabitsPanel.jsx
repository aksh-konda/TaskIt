import { useEffect, useRef, useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'

const inputClass =
  'w-full rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white'

const emptyForm = {
  name: '',
  frequency: '',
  target: '',
  difficulty: '',
}

const SWIPE_HINT_KEY = 'taskit-hint-swipe'

export default function HabitsPanel() {
  const [habits, setHabits] = useState([])
  const [logsByHabit, setLogsByHabit] = useState({})
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [batchFrequency, setBatchFrequency] = useState('')
  const [batchDifficulty, setBatchDifficulty] = useState('')
  const [skipTargetHabit, setSkipTargetHabit] = useState(null)
  const [skipReason, setSkipReason] = useState('')
  const [touchStart, setTouchStart] = useState({ x: 0, y: 0 })
  const [burstByHabit, setBurstByHabit] = useState({})
  const [showSwipeHint, setShowSwipeHint] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(SWIPE_HINT_KEY) !== 'dismissed'
  })
  const [undoToast, setUndoToast] = useState(null)
  const [undoRemainingMs, setUndoRemainingMs] = useState(0)

  const undoTimeoutRef = useRef(null)
  const undoTickRef = useRef(null)

  const dismissSwipeHint = () => {
    setShowSwipeHint(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(SWIPE_HINT_KEY, 'dismissed')
    }
  }

  const clearUndoTimers = () => {
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current)
      undoTimeoutRef.current = null
    }
    if (undoTickRef.current) {
      clearInterval(undoTickRef.current)
      undoTickRef.current = null
    }
  }

  useEffect(() => () => clearUndoTimers(), [])

  const openUndoToast = (toast) => {
    clearUndoTimers()
    const expiresAt = Date.now() + 3000
    setUndoToast({ ...toast, expiresAt })
    setUndoRemainingMs(3000)

    undoTickRef.current = setInterval(() => {
      setUndoRemainingMs(Math.max(0, expiresAt - Date.now()))
    }, 100)

    undoTimeoutRef.current = setTimeout(() => {
      setUndoToast(null)
      setUndoRemainingMs(0)
      clearUndoTimers()
    }, 3000)
  }

  const fetchHabits = async () => {
    setLoading(true)
    try {
      const response = await api.get('/habits')
      const nextHabits = Array.isArray(response.data) ? response.data : []
      setHabits(nextHabits)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch habits'))
    } finally {
      setLoading(false)
    }
  }

  const fetchLogs = async (habitId) => {
    try {
      const response = await api.get(`/habits/${habitId}/logs`)
      setLogsByHabit((prev) => ({
        ...prev,
        [habitId]: Array.isArray(response.data) ? response.data : [],
      }))
    } catch {
      // Keep logs section resilient if per-habit fetch fails.
    }
  }

  useEffect(() => {
    fetchHabits()
  }, [])

  useEffect(() => {
    habits.forEach((habit) => {
      fetchLogs(habit.id)
    })
  }, [habits])

  const handleCreate = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      await api.post('/habits', {
        name: form.name.trim(),
        frequency: form.frequency.trim() || null,
        target: form.target.trim() || null,
        difficulty: form.difficulty.trim() || null,
      })
      setForm(emptyForm)
      await fetchHabits()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create habit'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (habitId) => {
    try {
      await api.delete(`/habits/${habitId}`)
      setHabits((prev) => prev.filter((habit) => habit.id !== habitId))
      setLogsByHabit((prev) => {
        const next = { ...prev }
        delete next[habitId]
        return next
      })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete habit'))
    }
  }

  const handleUpdate = async (habit) => {
    try {
      await api.put(`/habits/${habit.id}`, {
        name: habit.name,
        frequency: habit.frequency,
        target: habit.target,
        difficulty: habit.difficulty,
      })
      setEditingId(null)
      await fetchHabits()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update habit'))
    }
  }

  const triggerReward = (habitId) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([14, 24, 14])
    }

    const burstId = Date.now()
    setBurstByHabit((prev) => ({ ...prev, [habitId]: burstId }))
    setTimeout(() => {
      setBurstByHabit((prev) => {
        if (prev[habitId] !== burstId) return prev
        const next = { ...prev }
        delete next[habitId]
        return next
      })
    }, 900)
  }

  const isStreakMaintained = (habit) => {
    const logs = logsByHabit[habit.id] || []
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayKey = yesterday.toISOString().slice(0, 10)
    const todayKey = new Date().toISOString().slice(0, 10)

    const hasYesterday = logs.some((log) => log.date === yesterdayKey && log.completed)
    const hasToday = logs.some((log) => log.date === todayKey && log.completed)
    return hasYesterday && !hasToday
  }

  const submitHabitLog = async (habit, completed, reason = '', options = { withUndo: false }) => {
    try {
      const maintained = completed ? isStreakMaintained(habit) : false
      const response = await api.post(`/habits/${habit.id}/logs`, {
        date: new Date().toISOString().slice(0, 10),
        completed,
        skipReason: completed ? null : reason,
      })

      const createdLog = response.data
      await fetchLogs(habit.id)

      if (completed && maintained) {
        triggerReward(habit.id)
      }

      if (options.withUndo && createdLog?.id) {
        openUndoToast({
          habitId: habit.id,
          logId: createdLog.id,
          label: completed ? `${habit.name} completed` : `${habit.name} skipped`,
        })
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to log habit action'))
    }
  }

  const undoLastSwipeAction = async () => {
    if (!undoToast) return

    try {
      await api.delete(`/habits/${undoToast.habitId}/logs/${undoToast.logId}`)
      await fetchLogs(undoToast.habitId)
      setUndoToast(null)
      setUndoRemainingMs(0)
      clearUndoTimers()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to undo habit action'))
    }
  }

  const toggleTodayCompletion = async (habit) => {
    await submitHabitLog(habit, true)
  }

  const handleTouchStart = (event) => {
    const touch = event.touches[0]
    setTouchStart({ x: touch.clientX, y: touch.clientY })
  }

  const handleTouchEnd = (event, habit) => {
    const touch = event.changedTouches[0]
    const deltaX = touch.clientX - touchStart.x
    const deltaY = Math.abs(touch.clientY - touchStart.y)

    if (deltaY > 40 || Math.abs(deltaX) < 60) {
      return
    }

    if (deltaX > 0) {
      submitHabitLog(habit, true, '', { withUndo: true })
      return
    }

    setSkipTargetHabit(habit)
    setSkipReason('')
  }

  const toggleSelection = (habitId) => {
    setSelectedIds((prev) =>
      prev.includes(habitId) ? prev.filter((id) => id !== habitId) : [...prev, habitId],
    )
  }

  const applyBatchEdit = async () => {
    if (selectedIds.length === 0) {
      return
    }

    setError(null)

    try {
      const selectedHabits = habits.filter((habit) => selectedIds.includes(habit.id))
      await Promise.all(
        selectedHabits.map((habit) =>
          api.put(`/habits/${habit.id}`, {
            name: habit.name,
            frequency: batchFrequency.trim() || habit.frequency || null,
            target: habit.target || null,
            difficulty: batchDifficulty.trim() || habit.difficulty || null,
          }),
        ),
      )

      setSelectedIds([])
      setBatchFrequency('')
      setBatchDifficulty('')
      await fetchHabits()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to apply batch update'))
    }
  }

  const renderLastSevenBars = (habitId) => {
    const logs = logsByHabit[habitId] || []
    const byDate = new Map(logs.map((log) => [log.date, log.completed]))
    const bars = []

    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date()
      date.setDate(date.getDate() - offset)
      const key = date.toISOString().slice(0, 10)
      bars.push({ key, completed: byDate.get(key) === true })
    }

    return (
      <div className="mt-2 flex gap-1">
        {bars.map((bar) => (
          <span
            key={bar.key}
            title={bar.key}
            className={`h-2 w-5 rounded-sm ${bar.completed ? 'bg-black' : 'bg-black/10'}`}
          />
        ))}
      </div>
    )
  }

  return (
    <section className="space-y-4">
      {showSwipeHint && (
        <div className="hint-card rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)] md:hidden">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-black">Swipe shortcuts</p>
              <p className="mt-1 text-xs text-black/55">Swipe right to complete. Swipe left to skip with reason.</p>
            </div>
            <button
              type="button"
              onClick={dismissSwipeHint}
              className="rounded-md border border-black/10 px-2 py-1 text-xs text-black/60"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <form
        onSubmit={handleCreate}
        className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
      >
        <h2 className="text-lg font-medium text-black">Habits</h2>
        <p className="mt-1 text-sm text-black/45">Track recurring routines and completion logs.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          <input
            required
            name="name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Habit name"
            className={inputClass}
          />
          <input
            name="frequency"
            value={form.frequency}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, frequency: event.target.value }))
            }
            placeholder="Frequency (daily, weekly)"
            className={inputClass}
          />
          <input
            name="target"
            value={form.target}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, target: event.target.value }))
            }
            placeholder="Target"
            className={inputClass}
          />
          <input
            name="difficulty"
            value={form.difficulty}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, difficulty: event.target.value }))
            }
            placeholder="Difficulty"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="mt-3 rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Add habit'}
        </button>
      </form>

      {error && (
        <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-black/65">{error}</div>
      )}

      <div className="hidden rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)] md:block">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-black">Batch edit selected habits</p>
          <span className="text-xs text-black/45">{selectedIds.length} selected</span>
        </div>
        <div className="mt-3 grid gap-2 lg:grid-cols-[1fr_1fr_auto]">
          <input
            className={inputClass}
            placeholder="Set frequency for selected"
            value={batchFrequency}
            onChange={(event) => setBatchFrequency(event.target.value)}
          />
          <input
            className={inputClass}
            placeholder="Set difficulty for selected"
            value={batchDifficulty}
            onChange={(event) => setBatchDifficulty(event.target.value)}
          />
          <button
            type="button"
            onClick={applyBatchEdit}
            disabled={selectedIds.length === 0}
            className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-45"
          >
            Apply
          </button>
        </div>
      </div>

      {loading && <div className="text-sm text-black/45">Loading habits...</div>}

      {!loading && habits.length === 0 && (
        <div className="rounded-xl border border-black/10 bg-white px-5 py-8 text-sm text-black/45 shadow-sm">
          No habits yet.
        </div>
      )}

      {!loading && habits.length > 0 && (
        <div className="space-y-3">
          {habits.map((habit) => {
            const isEditing = editingId === habit.id
            const logs = logsByHabit[habit.id] || []
            const isSelected = selectedIds.includes(habit.id)

            return (
              <article
                key={habit.id}
                className={`group relative rounded-xl border bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition ${
                  isSelected ? 'border-black/40' : 'border-black/10'
                }`}
                onTouchStart={handleTouchStart}
                onTouchEnd={(event) => handleTouchEnd(event, habit)}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {isEditing ? (
                      <div className="grid gap-2 md:grid-cols-2">
                        <input
                          className={inputClass}
                          value={habit.name || ''}
                          onChange={(event) =>
                            setHabits((prev) =>
                              prev.map((item) =>
                                item.id === habit.id ? { ...item, name: event.target.value } : item,
                              ),
                            )
                          }
                        />
                        <input
                          className={inputClass}
                          value={habit.frequency || ''}
                          onChange={(event) =>
                            setHabits((prev) =>
                              prev.map((item) =>
                                item.id === habit.id
                                  ? { ...item, frequency: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                        <input
                          className={inputClass}
                          value={habit.target || ''}
                          onChange={(event) =>
                            setHabits((prev) =>
                              prev.map((item) =>
                                item.id === habit.id ? { ...item, target: event.target.value } : item,
                              ),
                            )
                          }
                        />
                        <input
                          className={inputClass}
                          value={habit.difficulty || ''}
                          onChange={(event) =>
                            setHabits((prev) =>
                              prev.map((item) =>
                                item.id === habit.id
                                  ? { ...item, difficulty: event.target.value }
                                  : item,
                              ),
                            )
                          }
                        />
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSelection(habit.id)}
                            className={`hidden h-5 w-5 items-center justify-center rounded border text-xs md:inline-flex ${
                              isSelected
                                ? 'border-black bg-black text-white'
                                : 'border-black/20 bg-white text-black/70'
                            }`}
                            aria-label="Toggle habit selection"
                          >
                            {isSelected ? 'x' : '+'}
                          </button>
                          <h3 className="text-base font-medium text-black">{habit.name}</h3>
                        </div>
                        <p className="mt-1 text-sm text-black/55 md:hidden">
                          {habit.frequency || 'No frequency'}
                        </p>
                        <p className="mt-1 hidden text-sm text-black/55 md:block">
                          {habit.frequency || 'No frequency'} | {habit.target || 'No target'} |{' '}
                          {habit.difficulty || 'No difficulty'}
                        </p>
                        <div className="hidden md:block">{renderLastSevenBars(habit.id)}</div>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isEditing ? (
                      <button
                        type="button"
                        onClick={() => handleUpdate(habit)}
                        className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 hover:bg-black/[0.03]"
                      >
                        Save
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleTodayCompletion(habit)}
                        className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 hover:bg-black/[0.03]"
                      >
                        Complete today
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setEditingId(isEditing ? null : habit.id)}
                      className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 hover:bg-black/[0.03]"
                    >
                      {isEditing ? 'Close' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(habit.id)}
                      className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 hover:bg-black/[0.03]"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {logs.length > 0 && (
                  <p className="mt-3 text-xs text-black/45 md:hidden">
                    Recent logs: {logs.slice(0, 3).map((log) => `${log.date} (${log.completed ? 'done' : 'missed'})`).join(', ')}
                  </p>
                )}

                <div className="mt-3 hidden rounded-lg border border-black/10 bg-[#fafafa] p-3 text-sm text-black/65 md:block md:opacity-0 md:transition md:duration-200 md:group-hover:opacity-100">
                  <p className="font-medium text-black/70">Hover Insight</p>
                  <p className="mt-1">
                    Recent performance: {logs.filter((log) => log.completed).length}/{logs.length} completions.
                  </p>
                  {logs.length > 0 && (
                    <p className="mt-1 text-xs text-black/50">
                      Last updates: {logs.slice(0, 3).map((log) => log.date).join(', ')}
                    </p>
                  )}
                </div>

                {burstByHabit[habit.id] && (
                  <div className="reward-burst">
                    <span className="reward-particle" style={{ left: '16%', bottom: '18%', background: '#111' }} />
                    <span className="reward-particle" style={{ left: '28%', bottom: '15%', background: '#444' }} />
                    <span className="reward-particle" style={{ left: '42%', bottom: '12%', background: '#222' }} />
                    <span className="reward-particle" style={{ left: '56%', bottom: '15%', background: '#666' }} />
                    <span className="reward-particle" style={{ left: '70%', bottom: '14%', background: '#111' }} />
                    <span className="reward-particle" style={{ left: '84%', bottom: '18%', background: '#333' }} />
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}

      {skipTargetHabit && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/25 p-3 md:hidden">
          <div className="w-full rounded-2xl bg-white p-4 shadow-[0_16px_40px_rgba(0,0,0,0.2)]">
            <h3 className="text-base font-semibold text-black">Skip habit</h3>
            <p className="mt-1 text-sm text-black/55">Why are you skipping {skipTargetHabit.name} today?</p>

            <textarea
              rows={3}
              value={skipReason}
              onChange={(event) => setSkipReason(event.target.value)}
              placeholder="Sick, travel, overloaded, etc."
              className={`mt-3 ${inputClass}`}
            />

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-sm text-black/70"
                onClick={() => {
                  setSkipTargetHabit(null)
                  setSkipReason('')
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 rounded-lg bg-black px-3 py-2 text-sm text-white"
                onClick={async () => {
                  await submitHabitLog(skipTargetHabit, false, skipReason.trim(), { withUndo: true })
                  setSkipTargetHabit(null)
                  setSkipReason('')
                }}
              >
                Skip with reason
              </button>
            </div>
          </div>
        </div>
      )}

      {undoToast && (
        <div className="undo-toast fixed inset-x-3 bottom-4 z-40 md:bottom-6 md:left-auto md:right-6 md:w-[360px]">
          <div className="rounded-xl border border-black/10 bg-white px-4 py-3 shadow-[0_14px_34px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-black/75">{undoToast.label}</p>
              <button
                type="button"
                onClick={undoLastSwipeAction}
                className="rounded-md border border-black/15 px-2 py-1 text-xs font-medium text-black"
              >
                Undo
              </button>
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-black/10">
              <div
                className="h-1.5 rounded-full bg-black transition-all duration-100"
                style={{ width: `${Math.round((undoRemainingMs / 3000) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
