import { useState } from 'react'
import client from '../api/client'
import useResourceCrud from '../utils/useResourceCrud'

export default function HabitsPage() {
  const { items, loading, error, createItem, deleteItem, fetchItems } = useResourceCrud('/habits')
  const [form, setForm] = useState({
    name: '',
    description: '',
    frequencyType: 'DAILY',
    targetCountPerPeriod: 1,
    difficulty: 'MEDIUM',
  })

  const submit = async (e) => {
    e.preventDefault()
    await createItem({ ...form, recurrence: null })
    setForm((prev) => ({ ...prev, name: '', description: '' }))
  }

  const checkin = async (id) => {
    await client.post(`/habits/${id}/checkins`, {
      count: 1,
      localDateKey: new Date().toISOString().slice(0, 10),
    })
    await fetchItems()
  }

  return (
    <section className="stack">
      <h2>Habits</h2>
      <form className="card row" onSubmit={submit}>
        <input placeholder="Habit name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <select value={form.frequencyType} onChange={(e) => setForm((p) => ({ ...p, frequencyType: e.target.value }))}>
          <option>DAILY</option>
          <option>WEEKLY</option>
        </select>
        <select value={form.difficulty} onChange={(e) => setForm((p) => ({ ...p, difficulty: e.target.value }))}>
          <option>EASY</option>
          <option>MEDIUM</option>
          <option>HARD</option>
        </select>
        <button type="submit" className="primary">Add</button>
      </form>
      {loading ? <p className="subtle">Loading...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <div className="stack">
        {items.map((habit) => (
          <article className="card between" key={habit.id}>
            <div>
              <h3>{habit.name}</h3>
              <p className="subtle">Streak: {habit.streakCurrent}</p>
              <p className="pill">{habit.difficulty}</p>
            </div>
            <div className="row">
              <button className="ghost" onClick={() => checkin(habit.id)}>Check-in</button>
              <button className="ghost danger" onClick={() => deleteItem(habit.id)}>Trash</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
