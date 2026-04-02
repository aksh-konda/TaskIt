import React, { useState } from 'react'

const toSeconds = (hours, minutes, seconds) =>
  Number(hours || 0) * 3600 + Number(minutes || 0) * 60 + Number(seconds || 0)

export default function TaskForm({ onSubmit, submitting, submitError }) {
  const [form, setForm] = useState({
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

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'progress' || name === 'estHours' || name === 'estMinutes' || name === 'estSeconds'
          ? Number(value)
          : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const created = await onSubmit({
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? `${form.dueDate}T00:00:00Z` : null,
      estTime: toSeconds(form.estHours, form.estMinutes, form.estSeconds),
      progress: form.progress,
    })

    if (created) {
      setForm({
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

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="border rounded px-3 py-2"
        />
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className="w-full border rounded px-3 py-2"
        rows={3}
      />

      <div className="grid gap-4 md:grid-cols-2 lg:items-end">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Progress (%)</label>
          <div className="flex flex-col">
            <span className="text-[10px] text-transparent uppercase tracking-wide mb-1 opacity-0">&nbsp;</span>
            <div className="flex items-center gap-3 w-full h-[42px] px-1">
              <input
                type="range"
                name="progress"
                value={form.progress}
                onChange={handleChange}
                min={0}
                max={100}
                className="flex-grow h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-sm font-medium text-gray-700 w-8">{form.progress}%</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-700 mb-1">Estimated time</label>
          <div className="grid gap-2 grid-cols-3">
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Hours</span>
              <input
                type="number"
                name="estHours"
                value={form.estHours}
                onChange={handleChange}
                min={0}
                placeholder="Hours"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Minutes</span>
              <input
                type="number"
                name="estMinutes"
                value={form.estMinutes}
                onChange={handleChange}
                min={0}
                max={59}
                placeholder="Minutes"
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-gray-500 uppercase tracking-wide mb-1">Seconds</span>
              <input
                type="number"
                name="estSeconds"
                value={form.estSeconds}
                onChange={handleChange}
                min={0}
                max={59}
                placeholder="Seconds"
                className="w-full border rounded px-3 py-2"
              />
            </div>
          </div>
        </div>
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
