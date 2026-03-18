import React, { useState } from 'react'

export default function TaskForm({ onSubmit, submitting, submitError }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    progress: 0,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: name === 'progress' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const created = await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      progress: form.progress,
    })

    if (created) {
      setForm({
        title: '',
        description: '',
        status: 'TODO',
        progress: 0,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-white space-y-4">
      <h2 className="text-lg font-semibold">Add Task</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className="border rounded px-3 py-2"
          required
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border rounded px-3 py-2"
        rows={3}
      />

      <div className="max-w-xs">
        <label className="block text-sm text-gray-700 mb-1">Progress (%)</label>
        <input
          type="number"
          name="progress"
          value={form.progress}
          onChange={handleChange}
          min={0}
          max={100}
          className="w-full border rounded px-3 py-2"
        />
      </div>

      {submitError && <div className="text-red-600 text-sm">Error: {submitError}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="px-4 py-2 bg-black text-white rounded disabled:opacity-60"
      >
        {submitting ? 'Adding…' : 'Add Task'}
      </button>
    </form>
  )
}
