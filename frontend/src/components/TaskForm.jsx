import { useState } from 'react'

const inputClass =
  'w-full rounded-xl border border-black/10 bg-[#f8f8f8] px-4 py-3 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white'

const typeOptions = [
  { value: 'DEEP_WORK', label: 'Deep' },
  { value: 'SHALLOW', label: 'Shallow' },
  { value: 'HABIT', label: 'Habit' },
  { value: 'BREAK', label: 'Break' },
]

const dueOptions = [
  { value: 'none', label: 'No date' },
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
]

const makeDueDate = (duePreset) => {
  if (duePreset === 'none') {
    return null
  }

  const date = new Date()
  if (duePreset === 'tomorrow') {
    date.setDate(date.getDate() + 1)
  }

  date.setHours(0, 0, 0, 0)
  return date.toISOString()
}

export default function TaskForm({ onSubmit, submitting, submitError }) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState('DEEP_WORK')
  const [duePreset, setDuePreset] = useState('today')

  const handleSubmit = async (event) => {
    event.preventDefault()

    const created = await onSubmit({
      title: title.trim(),
      status: 'TODO',
      priority: 'MEDIUM',
      type,
      dueDate: makeDueDate(duePreset),
      progress: 0,
      description: null,
      estTime: null,
      actualMinutes: null,
      tags: [],
    })

    if (created) {
      setTitle('')
      setType('DEEP_WORK')
      setDuePreset('today')
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
    >
      <h2 className="text-lg font-semibold text-black">Quick Task</h2>
      <p className="mt-1 text-sm text-black/45">Type once. Enter once. Done.</p>

      <div className="mt-3 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="What needs to get done?"
          className={inputClass}
          required
        />

        <div className="flex flex-wrap gap-2">
          {typeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setType(option.value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                type === option.value
                  ? 'bg-black text-white'
                  : 'border border-black/10 bg-[#f6f6f6] text-black/70 hover:bg-black/[0.05]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {dueOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setDuePreset(option.value)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                duePreset === option.value
                  ? 'bg-black text-white'
                  : 'border border-black/10 bg-[#f6f6f6] text-black/70 hover:bg-black/[0.05]'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {submitError && <div className="mt-3 text-sm text-black/65">{submitError}</div>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-60"
      >
        {submitting ? 'Adding...' : 'Add task'}
      </button>
    </form>
  )
}
