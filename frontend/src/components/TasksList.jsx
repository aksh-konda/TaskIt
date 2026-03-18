import React, { useEffect, useState } from 'react'
import axios from 'axios'
import TaskForm from './TaskForm'

export default function TasksList() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [deletingTaskId, setDeletingTaskId] = useState(null)
  const [deleteError, setDeleteError] = useState(null)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
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
    } catch (err) {
      setDeleteError(err.message || 'Failed to delete task')
    } finally {
      setDeletingTaskId(null)
    }
  }

  const startEditingTask = (task) => {
    setUpdateError(null)
    setEditingTaskId(task.id)
    setEditForm({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'TODO',
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
      progress: 0,
    })
  }

  const handleEditFormChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({
      ...prev,
      [name]: name === 'progress' ? Number(value) : value,
    }))
  }

  const handleUpdateTask = async (taskId) => {
    setUpdateError(null)
    setUpdatingTaskId(taskId)

    const payload = {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      status: editForm.status,
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
                <th className="px-4 py-2 text-sm font-medium">ID</th>
                <th className="px-4 py-2 text-sm font-medium">Title</th>
                <th className="px-4 py-2 text-sm font-medium">Description</th>
                <th className="px-4 py-2 text-sm font-medium">Status</th>
                <th className="px-4 py-2 text-sm font-medium">Progress</th>
                <th className="px-4 py-2 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map((t) => {
                const isEditing = editingTaskId === t.id
                const isUpdating = updatingTaskId === t.id

                return (
                  <React.Fragment key={t.id}>
                      <tr className={isEditing ? 'border-t bg-blue-50/60' : 'border-t'}>
                      <td className="px-4 py-2 text-sm text-gray-700">{t.id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{t.title}</td>
                      <td className="px-4 py-2 text-sm text-gray-700 whitespace-pre-wrap break-words">
                        {t.description}
                      </td>
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
                      <td className="px-4 py-2 text-sm text-gray-700">{t.progress ?? 0}%</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() =>
                              isEditing ? cancelEditingTask() : startEditingTask(t)
                            }
                            disabled={deletingTaskId === t.id || isUpdating}
                          >
                            {isEditing ? 'Close' : 'Edit'}
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteTask(t.id)}
                            disabled={deletingTaskId === t.id || isEditing || isUpdating}
                          >
                            {deletingTaskId === t.id ? 'Deleting…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>

                    <tr className={isEditing ? 'border-t-0 bg-blue-50/40' : 'border-t-0'}>
                      <td colSpan={6} className="p-0">
                        <div
                          className={
                            'overflow-hidden transition-all duration-300 ease-out ' +
                            (isEditing ? 'max-h-[40rem] opacity-100' : 'max-h-0 opacity-0')
                          }
                          aria-hidden={!isEditing}
                        >
                          <div className="px-4 py-4">
                            <div className="rounded-md border border-blue-200 bg-white p-4 shadow-sm">
                              <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-blue-900">
                                  Editing task #{t.id}
                                </h3>
                              </div>

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

                                <div className="max-w-xs">
                                  <label className="block text-sm text-gray-700 mb-1">Progress (%)</label>
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
