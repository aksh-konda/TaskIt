import React, { useEffect, useState } from 'react'
import TaskForm from './TaskForm'
import { api, getApiErrorMessage } from '../lib/api'

const emptyEditForm = {
  title: '',
  description: '',
  status: 'TODO',
  priority: 'MEDIUM',
  dueDate: '',
  estHours: 0,
  estMinutes: 0,
  progress: 0,
}

const inputClass =
  'w-full rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white'

const formatDueDate = (value) => {
  if (!value) return 'No date'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'No date'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatEstTime = (value) => {
  if (value === null || value === undefined || Number(value) <= 0) return 'No estimate'

  const totalMinutes = Number(value)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const parts = []

  if (hours > 0) parts.push(`${hours}h`)
  if (minutes > 0) parts.push(`${minutes}m`)

  return parts.join(' ') || '0m'
}

const splitEstTime = (value) => {
  if (!value || Number(value) <= 0) {
    return { estHours: 0, estMinutes: 0 }
  }

  const totalMinutes = Number(value)

  return {
    estHours: Math.floor(totalMinutes / 60),
    estMinutes: totalMinutes % 60,
  }
}

const toMinutes = (hours, minutes) =>
  Number(hours || 0) * 60 + Number(minutes || 0)

const toDateInputValue = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
}

const statusLabel = (status) => {
  if (status === 'IN_PROGRESS') return 'In progress'
  if (status === 'COMPLETED') return 'Completed'
  return 'To do'
}

const chipClass = (tone) => {
  if (tone === 'status-completed') return 'bg-black text-white'
  if (tone === 'status-progress') return 'bg-[#f1f1f1] text-black'
  return 'bg-[#f6f6f6] text-black/65'
}

export default function TasksList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [deletingTaskId, setDeletingTaskId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState(emptyEditForm)
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [updateError, setUpdateError] = useState(null)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await api.get('/tasks')
      setTasks(Array.isArray(res.data) ? res.data : [])
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

  const handleDeleteTask = async (taskId) => {
    setDeleteError(null)
    setDeletingTaskId(taskId)

    try {
      await api.delete(`/tasks/${taskId}`)
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
      if (editingTaskId === taskId) {
        setEditingTaskId(null)
        setEditForm(emptyEditForm)
      }
    } catch (err) {
      setDeleteError(getApiErrorMessage(err, 'Failed to delete task'))
    } finally {
      setDeletingTaskId(null)
    }
  }

  const startEditingTask = (task) => {
    const estTimeParts = splitEstTime(task.estTime)
    setUpdateError(null)
    setEditingTaskId(task.id)
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      dueDate: toDateInputValue(task.dueDate),
      estHours: estTimeParts.estHours,
      estMinutes: estTimeParts.estMinutes,
      progress: task.progress ?? 0,
    })
  }

  const cancelEditingTask = () => {
    setEditingTaskId(null)
    setUpdatingTaskId(null)
    setEditForm(emptyEditForm)
  }

  const handleEditFormChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === 'progress' || name === 'estHours' || name === 'estMinutes'
          ? Number(value)
          : value,
    }))
  }

  const handleUpdateTask = async (taskId) => {
    setUpdateError(null)
    setUpdatingTaskId(taskId)

    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      status: editForm.status,
      priority: editForm.priority,
      dueDate: editForm.dueDate ? `${editForm.dueDate}T00:00:00Z` : null,
      estTime: toMinutes(editForm.estHours, editForm.estMinutes),
      progress: editForm.progress,
    }

    try {
      const res = await api.put(`/tasks/${taskId}`, payload)
      const updatedTask = res.data

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task)),
      )
      cancelEditingTask()
    } catch (err) {
      setUpdateError(getApiErrorMessage(err, 'Failed to update task'))
    } finally {
      setUpdatingTaskId(null)
    }
  }

  return (
    <div className="space-y-4">
      <TaskForm
        onSubmit={handleCreateTask}
        submitting={submitting}
        submitError={submitError}
      />

      {(error || deleteError || updateError) && (
        <div className="rounded-lg border border-black/10 bg-white px-4 py-3 text-sm text-black/70 shadow-sm">
          {error || deleteError || updateError}
        </div>
      )}

      {loading && <div className="text-sm text-black/45">Loading tasks…</div>}

      {!loading && !error && tasks.length === 0 && (
        <div className="rounded-xl border border-black/10 bg-white px-5 py-8 text-center text-sm text-black/45 shadow-sm">
          No tasks yet.
        </div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((task) => {
            const isEditing = editingTaskId === task.id
            const isUpdating = updatingTaskId === task.id
            const isDeleting = deletingTaskId === task.id

            return (
              <article
                key={task.id}
                className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-medium text-black">{task.title}</h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${chipClass(
                          task.status === 'COMPLETED' ? 'status-completed' : task.status === 'IN_PROGRESS' ? 'status-progress' : 'priority-medium',
                        )}`}
                      >
                        {statusLabel(task.status)}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs ${chipClass('priority-medium')}`}
                      >
                        {task.priority?.toLowerCase() || 'medium'}
                      </span>
                    </div>

                    {task.description && (
                      <p className="mt-2 text-sm leading-6 text-black/58">{task.description}</p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-black/45">
                      <span>{formatDueDate(task.dueDate)}</span>
                      <span>{formatEstTime(task.estTime)}</span>
                      <span>{task.progress ?? 0}% progress</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 transition hover:bg-black/[0.03] disabled:opacity-60"
                      onClick={() => (isEditing ? cancelEditingTask() : startEditingTask(task))}
                      disabled={isDeleting || isUpdating}
                    >
                      {isEditing ? 'Close' : 'Edit'}
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 transition hover:bg-black/[0.03] disabled:opacity-60"
                      onClick={() => handleDeleteTask(task.id)}
                      disabled={isDeleting || isUpdating}
                    >
                      {isDeleting ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 border-t border-black/10 pt-4">
                    <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(5,minmax(0,1fr))]">
                      <input
                        type="text"
                        name="title"
                        value={editForm.title}
                        onChange={handleEditFormChange}
                        className={`xl:col-span-2 ${inputClass}`}
                        required
                        disabled={isUpdating}
                      />

                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditFormChange}
                        className={inputClass}
                        disabled={isUpdating}
                      >
                        <option value="TODO">To do</option>
                        <option value="IN_PROGRESS">In progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>

                      <select
                        name="priority"
                        value={editForm.priority}
                        onChange={handleEditFormChange}
                        className={inputClass}
                        disabled={isUpdating}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>

                      <input
                        type="date"
                        name="dueDate"
                        value={editForm.dueDate}
                        onChange={handleEditFormChange}
                        className={inputClass}
                        disabled={isUpdating}
                      />

                      <div className="grid grid-cols-3 gap-3 xl:col-span-2">
                        <input
                          type="number"
                          name="estHours"
                          value={editForm.estHours}
                          onChange={handleEditFormChange}
                          min={0}
                          placeholder="Hours"
                          className={inputClass}
                          disabled={isUpdating}
                        />
                        <input
                          type="number"
                          name="estMinutes"
                          value={editForm.estMinutes}
                          onChange={handleEditFormChange}
                          min={0}
                          max={59}
                          placeholder="Minutes"
                          className={inputClass}
                          disabled={isUpdating}
                        />
                        <input
                          type="number"
                          name="progress"
                          value={editForm.progress}
                          onChange={handleEditFormChange}
                          min={0}
                          max={100}
                          placeholder="Progress %"
                          className={inputClass}
                          disabled={isUpdating}
                        />
                      </div>
                    </div>

                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditFormChange}
                      rows={2}
                      className={`mt-2 min-h-20 w-full ${inputClass}`}
                      disabled={isUpdating}
                    />

                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
                        onClick={() => handleUpdateTask(task.id)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        className="rounded-lg border border-black/10 px-4 py-2 text-sm text-black/75 transition hover:bg-black/[0.03] disabled:opacity-60"
                        onClick={cancelEditingTask}
                        disabled={isUpdating}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </article>
            )
          })}
        </div>
      )}
    </div>
  )
}
