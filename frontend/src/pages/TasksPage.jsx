import { useState } from 'react'
import client from '../api/client'
import useResourceCrud from '../utils/useResourceCrud'

export default function TasksPage() {
  const { items, loading, error, createItem, deleteItem, fetchItems } = useResourceCrud('/tasks')
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', sourceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone })

  const submit = async (e) => {
    e.preventDefault()
    await createItem({
      ...form,
      status: 'TODO',
      recurrence: null,
    })
    setForm((prev) => ({ ...prev, title: '', description: '' }))
  }

  const completeTask = async (id) => {
    await client.post(`/tasks/${id}/complete`)
    await fetchItems()
  }

  return (
    <section className="stack">
      <h2>Tasks</h2>
      <form className="card row" onSubmit={submit}>
        <input placeholder="Task title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <input placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <select value={form.priority} onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value }))}>
          <option>LOW</option>
          <option>MEDIUM</option>
          <option>HIGH</option>
        </select>
        <button type="submit" className="primary">Add</button>
      </form>
      {loading ? <p className="subtle">Loading...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <div className="stack">
        {items.map((task) => (
          <article className="card between" key={task.id}>
            <div>
              <h3>{task.title}</h3>
              <p className="subtle">{task.description || 'No description'}</p>
              <p className="pill">{task.status}</p>
            </div>
            <div className="row">
              {task.status !== 'DONE' ? <button className="ghost" onClick={() => completeTask(task.id)}>Complete</button> : null}
              <button className="ghost danger" onClick={() => deleteItem(task.id)}>Trash</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
