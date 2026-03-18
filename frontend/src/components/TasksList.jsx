import React, { useEffect, useState } from 'react'
import axios from 'axios'
import TaskForm from './TaskForm'

const formatDueDate = (value) => {
  if (!value) return '—'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatEstTime = (value) => {
  if (value === null || value === undefined || Number(value) <= 0) return '—'

  const total = Number(value)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60
  const parts = []

  if (hours > 0) parts.push(`${hours}hr`)
  if (minutes > 0) parts.push(`${minutes}mins`)
  if (seconds > 0) parts.push(`${seconds}secs`)

  return parts.length > 0 ? parts.join(' ') : '0secs'
}

const splitEstTime = (value) => {
  if (!value || Number(value) <= 0) {
    return { estHours: 0, estMinutes: 0, estSeconds: 0 }
  }

  const total = Number(value)

  return {
    estHours: Math.floor(total / 3600),
    estMinutes: Math.floor((total % 3600) / 60),
    estSeconds: total % 60,
  }
}

const toSeconds = (hours, minutes, seconds) =>
  Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0)

const toDateInputValue = (value) => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return date.toISOString().slice(0, 10)
}

const priorityClass = (priority) => {
  if (priority === 'HIGH') return 'bg-red-100 text-red-800'
  if (priority === 'LOW') return 'bg-sky-100 text-sky-800'
  return 'bg-orange-100 text-orange-800'
}

export default function TasksList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [deletingTaskId, setDeletingTaskId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [viewingTaskId, setViewingTaskId] = useState(null)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    estHours: 0,
    estMinutes: 0,
    estSeconds: 0,
    progress: 0,
  })
  const [updatingTaskId, setUpdatingTaskId] = useState(null)
  const [updateError, setUpdateError] = useState(null)

  const fetchTasks = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/tasks')
      setTasks(Array.isArray(res.data) ? res.data : [])
      setError(null)
    } catch (err) {
      setError(err.message || 'Failed to fetch tasks')
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
      await axios.post('/tasks', taskPayload)

      await fetchTasks()
      return true
    } catch (err) {
      setSubmitError(err.message || 'Failed to create task')
      return false
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    setDeleteError(null)
    setDeletingTaskId(taskId)

    try {
      await axios.delete(`/tasks/${taskId}`)
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId))
      if (viewingTaskId === taskId) {
        setViewingTaskId(null)
      }
      if (editingTaskId === taskId) {
        setEditingTaskId(null)
      }
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete task')
    } finally {
      setDeletingTaskId(null)
    }
  }

  const toggleViewTask = (taskId) => {
    setUpdateError(null)
    setEditingTaskId(null)
    setUpdatingTaskId(null)
    setViewingTaskId((prev) => (prev === taskId ? null : taskId))
  }

  const startEditingTask = (task) => {
    setUpdateError(null)
    setViewingTaskId(null)
    setEditingTaskId(task.id)
    const estTimeParts = splitEstTime(task.estTime)
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'TODO',
      priority: task.priority || 'MEDIUM',
      dueDate: toDateInputValue(task.dueDate),
      estHours: estTimeParts.estHours,
      estMinutes: estTimeParts.estMinutes,
      estSeconds: estTimeParts.estSeconds,
      progress: task.progress ?? 0,
    })
  }

  const cancelEditingTask = () => {
    setEditingTaskId(null)
    setUpdatingTaskId(null)
    setEditForm({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: '',
      estHours: 0,
      estMinutes: 0,
      estSeconds: 0,
      progress: 0,
    })
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]:
        name === 'progress' || name === 'estHours' || name === 'estMinutes' || name === 'estSeconds'
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
      estTime: toSeconds(editForm.estHours, editForm.estMinutes, editForm.estSeconds),
      progress: editForm.progress,
    }

    try {
      const res = await axios.put(`/tasks/${taskId}`, payload)
      const updatedTask = res.data

      setTasks((prevTasks) =>
        prevTasks.map((task) => (task.id === taskId ? updatedTask : task))
      )
      cancelEditingTask()
    } catch (err) {
      setUpdateError(err.message || 'Failed to update task')
    } finally {
      setUpdatingTaskId(null)
    }
  }

  return (
    <div className="space-y-6">
      <TaskForm
        onSubmit={handleCreateTask}
        submitting={submitting}
        submitError={submitError}
      />

      {loading && <div className="text-gray-600">Loading tasks…</div>}
      {error && <div className="text-red-600">Error: {error}</div>}
      {deleteError && <div className="text-red-600">Error: {deleteError}</div>}
      {updateError && <div className="text-red-600">Error: {updateError}</div>}

      {!loading && !error && (!tasks || tasks.length === 0) && (
        <div className="text-gray-600">No tasks yet.</div>
      )}

      {!loading && !error && tasks.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-4 py-2 text-sm font-medium">#</th>
                <th className="px-4 py-2 text-sm font-medium">Title</th>
                <th className="px-4 py-2 text-sm font-medium">Due Date</th>
                <th className="px-4 py-2 text-sm font-medium">Status</th>
                <th className="px-4 py-2 text-sm font-medium">Estimated Time</th>
                <th className="px-4 py-2 text-sm font-medium">Progress</th>
                <th className="px-4 py-2 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const isViewing = viewingTaskId === t.id
                const isEditing = editingTaskId === t.id
                const isUpdating = updatingTaskId === t.id
                const detailMode = isEditing ? 'edit' : isViewing ? 'view' : null

                return (
                  <React.Fragment key={t.id}>
                    <tr className={detailMode ? 'border-t bg-blue-50/60' : 'border-t'}>
                      <td className="px-4 py-2 text-sm text-gray-700">#{t.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{t.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">{formatDueDate(t.dueDate)}</td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={
                            'inline-block px-2 py-1 rounded text-xs font-medium ' +
                            (t.status && t.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800')
                          }
                        >
                          {t.status || 'TODO'}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {formatEstTime(t.estTime)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-700">{t.progress ?? 0}%</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="p-2 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() => toggleViewTask(t.id)}
                            disabled={deletingTaskId === t.id || isUpdating}
                            aria-label={isViewing ? `Close details for task #${t.id}` : `View task #${t.id}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/>
                              <circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>

                          <button
                            type="button"
                            className="p-2 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() => (isEditing ? cancelEditingTask() : startEditingTask(t))}
                            disabled={deletingTaskId === t.id || isUpdating}
                            aria-label={isEditing ? `Close edit for task #${t.id}` : `Edit task #${t.id}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M12 20h9"/>
                              <path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
                            </svg>
                          </button>

                          <button
                            type="button"
                            className="p-2 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteTask(t.id)}
                            disabled={deletingTaskId === t.id || isEditing || isUpdating}
                            aria-label={`Delete task #${t.id}`}
                          >
                            {deletingTaskId === t.id ? (
                              '…'
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6l-1 14H6L5 6"/>
                                <path d="M10 11v6"/>
                                <path d="M14 11v6"/>
                                <path d="M9 6V4h6v2"/>
                              </svg>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr className={detailMode ? 'border-t-0 bg-blue-50/40' : 'border-t-0'}>
                      <td colSpan={7} className="p-0">
                        <div
                          className={
                            'overflow-hidden transition-all duration-300 ease-out ' +
                            (detailMode ? 'max-h-[55rem] opacity-100' : 'max-h-0 opacity-0')
                          }
                          aria-hidden={!detailMode}
                        >
                          <div className="px-4 py-4">
                            <div className="rounded-md border border-blue-200 bg-white p-4 shadow-sm">
                              <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-blue-900">
                                  {detailMode === 'view' ? `Task Details #${t.id}` : `Editing task #${t.id}`}
                                </h3>
                              </div>

                              {detailMode === 'view' ? (
                                <div className="flex flex-col gap-6 p-2">
                                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                    <div className="space-y-3">
                                      <h4 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                        <svg className="w-7 h-7 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        {t.title || 'Untitled Task'}
                                      </h4>
                                      <div className="flex flex-wrap gap-2">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${t.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : t.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
                                          {t.status?.replace('_', ' ') || 'TODO'}
                                        </span>
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${priorityClass(t.priority || 'MEDIUM')}`}>
                                          {t.priority || 'MEDIUM'} Priority
                                        </span>
                                      </div>
                                    </div>
                                    
                                    <div className="w-full md:w-1/3 bg-white p-3 rounded-lg border shadow-sm">
                                      <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-semibold text-gray-600 uppercase tracking-widest">Progress</span>
                                        <span className="text-sm font-bold text-blue-600">{t.progress ?? 0}%</span>
                                      </div>
                                      <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                        <div 
                                          className={`h-2.5 rounded-full transition-all duration-500 ease-out ${t.progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                          style={{ width: `${Math.max(0, Math.min(100, t.progress ?? 0))}%` }}
                                        ></div>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="flex items-center gap-4 p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                      <div className="p-3 bg-rose-50 text-rose-500 rounded-lg">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Due Date</p>
                                        <p className="text-md font-semibold text-gray-800">{formatDueDate(t.dueDate)}</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-4 p-4 bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow">
                                      <div className="p-3 bg-indigo-50 text-indigo-500 rounded-lg">
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                      </div>
                                      <div>
                                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-0.5">Estimated Time</p>
                                        <p className="text-md font-semibold text-gray-800">{formatEstTime(t.estTime)}</p>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-2">
                                    <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                      </svg>
                                      Description
                                    </h5>
                                    <div className="bg-gray-50/50 rounded-xl p-5 text-sm text-gray-700 whitespace-pre-wrap break-words border border-gray-100 shadow-inner">
                                      {t.description ? t.description : <span className="text-gray-400 italic">No description provided for this task.</span>}
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <div className="grid gap-4 md:grid-cols-2">
                                    <div>
                                      <label className="block text-sm text-gray-700 mb-1">Title</label>
                                      <input
                                        type="text"
                                        name="title"
                                        value={editForm.title}
                                        onChange={handleEditFormChange}
                                        className="w-full border rounded px-3 py-2"
                                        required
                                        disabled={!isEditing || isUpdating}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-700 mb-1">Status</label>
                                      <select
                                        name="status"
                                        value={editForm.status}
                                        onChange={handleEditFormChange}
                                        className="w-full border rounded px-3 py-2"
                                        disabled={!isEditing || isUpdating}
                                      >
                                        <option value="TODO">TODO</option>
                                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                                        <option value="COMPLETED">COMPLETED</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-700 mb-1">Priority</label>
                                      <select
                                        name="priority"
                                        value={editForm.priority}
                                        onChange={handleEditFormChange}
                                        className="w-full border rounded px-3 py-2"
                                        disabled={!isEditing || isUpdating}
                                      >
                                        <option value="LOW">LOW</option>
                                        <option value="MEDIUM">MEDIUM</option>
                                        <option value="HIGH">HIGH</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-700 mb-1">Due date</label>
                                      <input
                                        type="date"
                                        name="dueDate"
                                        value={editForm.dueDate}
                                        onChange={handleEditFormChange}
                                        className="w-full border rounded px-3 py-2"
                                        disabled={!isEditing || isUpdating}
                                      />
                                    </div>

                                    <div className="md:col-span-2">
                                      <label className="block text-sm text-gray-700 mb-1">Description</label>
                                      <textarea
                                        name="description"
                                        value={editForm.description}
                                        onChange={handleEditFormChange}
                                        rows={4}
                                        className="w-full border rounded px-3 py-2"
                                        disabled={!isEditing || isUpdating}
                                      />
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-700 mb-1">Estimated time</label>
                                      <div className="grid gap-2 grid-cols-3">
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Hours</span>
                                          <input
                                            type="number"
                                            name="estHours"
                                            value={editForm.estHours}
                                            onChange={handleEditFormChange}
                                            min={0}
                                            placeholder="Hours"
                                            className="w-full border rounded px-3 py-2"
                                            disabled={!isEditing || isUpdating}
                                          />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Minutes</span>
                                          <input
                                            type="number"
                                            name="estMinutes"
                                            value={editForm.estMinutes}
                                            onChange={handleEditFormChange}
                                            min={0}
                                            max={59}
                                            placeholder="Minutes"
                                            className="w-full border rounded px-3 py-2"
                                            disabled={!isEditing || isUpdating}
                                          />
                                        </div>
                                        <div className="flex flex-col">
                                          <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Seconds</span>
                                          <input
                                            type="number"
                                            name="estSeconds"
                                            value={editForm.estSeconds}
                                            onChange={handleEditFormChange}
                                            min={0}
                                            max={59}
                                            placeholder="Seconds"
                                            className="w-full border rounded px-3 py-2"
                                            disabled={!isEditing || isUpdating}
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    <div>
                                      <label className="block text-sm text-gray-700 mb-1">Progress (%)</label>
                                      <div className="flex flex-col">
                                        <span className="text-[10px] text-transparent uppercase tracking-wide mb-1 opacity-0">&nbsp;</span>
                                        <input
                                          type="number"
                                          name="progress"
                                          value={editForm.progress}
                                          onChange={handleEditFormChange}
                                          min={0}
                                          max={100}
                                          className="w-full border rounded px-3 py-2"
                                          disabled={!isEditing || isUpdating}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <div className="mt-4 flex gap-2">
                                    <button
                                      type="button"
                                      className="px-4 py-2 rounded bg-black text-white hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
                                      onClick={() => handleUpdateTask(t.id)}
                                      disabled={!isEditing || isUpdating}
                                    >
                                      {isUpdating ? 'Saving…' : 'Save Changes'}
                                    </button>
                                    <button
                                      type="button"
                                      className="px-4 py-2 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed"
                                      onClick={cancelEditingTask}
                                      disabled={!isEditing || isUpdating}
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
