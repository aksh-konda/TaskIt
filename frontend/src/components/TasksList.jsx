import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'
import TaskForm from './TaskForm'

const TASK_SHORTCUTS_HINT_KEY = 'taskit-hint-task-shortcuts'

const statusLabel = (status) => {
  if (status === 'COMPLETED') return 'Done'
  if (status === 'IN_PROGRESS') return 'In progress'
  return 'To do'
}

const typeLabel = (type) => {
  if (!type) return 'General'
  return type.replace('_', ' ').toLowerCase()
}

const chipClass = (status) => {
  if (status === 'COMPLETED') return 'bg-black text-white'
  if (status === 'IN_PROGRESS') return 'bg-black/10 text-black'
  return 'bg-[#f3f3f3] text-black/70'
}

export default function TasksList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [busyTaskId, setBusyTaskId] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [showShortcutHint, setShowShortcutHint] = useState(() => {
    if (typeof window === 'undefined') return true
    return localStorage.getItem(TASK_SHORTCUTS_HINT_KEY) !== 'dismissed'
  })

  const dismissShortcutHint = () => {
    setShowShortcutHint(false)
    if (typeof window !== 'undefined') {
      localStorage.setItem(TASK_SHORTCUTS_HINT_KEY, 'dismissed')
    }
  }

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const response = await api.get('/tasks')
      const nextTasks = Array.isArray(response.data) ? response.data : []
      nextTasks.sort((left, right) => {
        const score = (task) => {
          if (task.status === 'IN_PROGRESS') return 0
          if (task.status === 'TODO') return 1
          return 2
        }

        return score(left) - score(right)
      })
      setTasks(nextTasks)
      setError(null)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to fetch tasks'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    if (tasks.length === 0) {
      setSelectedTaskId(null)
      return
    }

    if (!tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(tasks[0].id)
    }
  }, [tasks, selectedTaskId])

  const handleCreateTask = async (taskPayload) => {
    setSubmitError(null)
    setSubmitting(true)

    try {
      await api.post('/tasks', taskPayload)
      await fetchTasks()
      return true
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Failed to create task'))
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const updateTaskStatus = async (task, nextStatus) => {
    setBusyTaskId(task.id)
    setError(null)

    try {
      const payload = {
        title: task.title,
        description: task.description,
        status: nextStatus,
        priority: task.priority,
        type: task.type,
        dueDate: task.dueDate,
        scheduledAt: task.scheduledAt,
        completedAt:
          nextStatus === 'COMPLETED' ? new Date().toISOString() : null,
        estTime: task.estTime,
        actualMinutes: task.actualMinutes,
        progress: nextStatus === 'COMPLETED' ? 100 : task.progress ?? 0,
        tags: task.tags || [],
      }

      const response = await api.put(`/tasks/${task.id}`, payload)
      const updated = response.data

      setTasks((prev) =>
        prev.map((item) => (item.id === task.id ? updated : item)),
      )
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to update task status'))
    } finally {
      setBusyTaskId(null)
    }
  }

  const deleteTask = async (taskId) => {
    setBusyTaskId(taskId)
    setError(null)

    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks((prev) => prev.filter((task) => task.id !== taskId))
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to delete task'))
    } finally {
      setBusyTaskId(null)
    }
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (window.innerWidth < 1024) {
        return
      }

      const tagName = event.target?.tagName?.toLowerCase()
      if (tagName === 'input' || tagName === 'textarea' || tagName === 'select' || event.target?.isContentEditable) {
        return
      }

      if (tasks.length === 0) {
        return
      }

      const currentIndex = Math.max(0, tasks.findIndex((task) => task.id === selectedTaskId))

      if (event.key === 'j' || event.key === 'ArrowDown') {
        event.preventDefault()
        const nextIndex = Math.min(tasks.length - 1, currentIndex + 1)
        setSelectedTaskId(tasks[nextIndex].id)
        return
      }

      if (event.key === 'k' || event.key === 'ArrowUp') {
        event.preventDefault()
        const prevIndex = Math.max(0, currentIndex - 1)
        setSelectedTaskId(tasks[prevIndex].id)
        return
      }

      const selectedTask = tasks.find((task) => task.id === selectedTaskId)
      if (!selectedTask || busyTaskId) {
        return
      }

      if (event.key === 'c' && selectedTask.status !== 'COMPLETED') {
        event.preventDefault()
        updateTaskStatus(selectedTask, 'COMPLETED')
      }

      if (event.key === 's' && selectedTask.status === 'TODO') {
        event.preventDefault()
        updateTaskStatus(selectedTask, 'IN_PROGRESS')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [tasks, selectedTaskId, busyTaskId])

  return (
    <section className="space-y-4">
      {showShortcutHint && (
        <div className="hint-card hidden rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)] lg:block">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-black">Desktop shortcuts</p>
              <p className="mt-1 text-xs text-black/55">Use J/K (or arrow keys) to move, C to complete, S to start.</p>
            </div>
            <button
              type="button"
              onClick={dismissShortcutHint}
              className="rounded-md border border-black/10 px-2 py-1 text-xs text-black/60"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <TaskForm
        onSubmit={handleCreateTask}
        submitting={submitting}
        submitError={submitError}
      />

      {error && (
        <div className="rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black/70">
          {error}
        </div>
      )}

      {loading && <div className="text-sm text-black/45">Loading tasks...</div>}

      {!loading && tasks.length === 0 && (
        <div className="rounded-xl border border-black/10 bg-white px-5 py-8 text-center text-sm text-black/45 shadow-sm">
          No tasks yet. Add one quick task to get moving.
        </div>
      )}

      {!loading && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isBusy = busyTaskId === task.id
            const isSelected = selectedTaskId === task.id

            return (
              <article
                key={task.id}
                onClick={() => setSelectedTaskId(task.id)}
                className={`rounded-2xl border bg-white px-4 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)] transition ${
                  isSelected ? 'border-black/50 ring-1 ring-black/25' : 'border-black/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-medium text-black">{task.title}</h3>
                      <span className={`rounded-full px-2.5 py-1 text-xs ${chipClass(task.status)}`}>
                        {statusLabel(task.status)}
                      </span>
                      <span className="rounded-full bg-[#f3f3f3] px-2.5 py-1 text-xs text-black/60">
                        {typeLabel(task.type)}
                      </span>
                    </div>
                    {task.dueDate && (
                      <p className="mt-1 text-xs text-black/45">
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {task.status !== 'COMPLETED' && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateTaskStatus(task, 'COMPLETED')}
                        className="rounded-lg bg-black px-3 py-2 text-xs font-medium text-white disabled:opacity-50"
                      >
                        Done
                      </button>
                    )}
                    {task.status === 'TODO' && (
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => updateTaskStatus(task, 'IN_PROGRESS')}
                        className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-black/75 disabled:opacity-50"
                      >
                        Start
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => deleteTask(task.id)}
                      className="rounded-lg border border-black/10 px-3 py-2 text-xs font-medium text-black/75 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
