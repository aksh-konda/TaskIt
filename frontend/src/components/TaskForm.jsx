import React, { useState } from 'react'

const toMinutes = (hours, minutes) =>
  Number(hours || 0) * 60 + Number(minutes || 0)

const inputClass =
  'w-full rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white'

export default function TaskForm({ onSubmit, submitting, submitError }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
    estHours: 0,
    estMinutes: 0,
    progress: 0,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({
      ...prev,
      [name]:
        name === 'progress' || name === 'estHours' || name === 'estMinutes'
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
      estTime: toMinutes(form.estHours, form.estMinutes),
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
        progress: 0,
      })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-medium text-black">
          New task
          </h2>
          <p className="mt-0.5 text-xs text-black/45">Compact and quick.</p>
        </div>
      </div>

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-[minmax(0,2fr)_repeat(5,minmax(0,1fr))]">
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Title"
          className={`xl:col-span-2 ${inputClass}`}
          required
        />

        <select
          name="status"
          value={form.status}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="TODO">To do</option>
          <option value="IN_PROGRESS">In progress</option>
          <option value="COMPLETED">Completed</option>
        </select>

        <select
          name="priority"
          value={form.priority}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="LOW">Low</option>
          <option value="MEDIUM">Medium</option>
          <option value="HIGH">High</option>
        </select>

        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className={inputClass}
        />

        <div className="grid grid-cols-3 gap-3 xl:col-span-2">
          <input
            type="number"
            name="estHours"
            value={form.estHours}
            onChange={handleChange}
            min={0}
            placeholder="Hours"
            className={inputClass}
          />
          <input
            type="number"
            name="estMinutes"
            value={form.estMinutes}
            onChange={handleChange}
            min={0}
            max={59}
            placeholder="Minutes"
            className={inputClass}
          />
          <input
            type="number"
            name="progress"
            value={form.progress}
            onChange={handleChange}
            min={0}
            max={100}
            placeholder="Progress %"
            className={inputClass}
          />
        </div>
      </div>

      <textarea
        name="description"
        value={form.description}
        onChange={handleChange}
        placeholder="Description"
        className={`mt-2 min-h-20 w-full ${inputClass}`}
        rows={2}
      />

      {submitError && <div className="mt-2 text-sm text-black/65">{submitError}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-3 rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
      >
        {submitting ? 'Adding…' : 'Add task'}
      </button>
    </form>
  )
}
