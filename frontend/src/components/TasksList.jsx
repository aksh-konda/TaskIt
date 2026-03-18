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
              {tasks.map((t) => (
                <tr key={t.id} className="border-t">
                  <td className="px-4 py-2 text-sm text-gray-700">{t.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{t.title}</td>
                  <td className="px-4 py-2 text-sm text-gray-700">{t.description}</td>
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
                    <button
                      type="button"
                      className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                      onClick={() => handleDeleteTask(t.id)}
                      disabled={deletingTaskId === t.id}
                    >
                      {deletingTaskId === t.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
