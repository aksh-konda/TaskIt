import { useState } from 'react'
import client from '../api/client'
import useResourceCrud from '../utils/useResourceCrud'

export default function EventsPage() {
  const { items, loading, error, createItem, deleteItem, fetchItems } = useResourceCrud('/events')
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    allDay: false,
    startAtUtc: new Date().toISOString().slice(0, 16),
    endAtUtc: new Date(Date.now() + 30 * 60000).toISOString().slice(0, 16),
    sourceTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  })

  const submit = async (e) => {
    e.preventDefault()
    await createItem({
      ...form,
      startAtUtc: new Date(form.startAtUtc).toISOString(),
      endAtUtc: new Date(form.endAtUtc).toISOString(),
      recurrence: null,
    })
    setForm((prev) => ({ ...prev, title: '', description: '', location: '' }))
  }

  const markDone = async (id) => {
    await client.post(`/events/${id}/mark-done`)
    await fetchItems()
  }

  return (
    <section className="stack">
      <h2>Events</h2>
      <form className="card grid two" onSubmit={submit}>
        <input placeholder="Event title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
        <input placeholder="Location" value={form.location} onChange={(e) => setForm((p) => ({ ...p, location: e.target.value }))} />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
        <label className="inline-check"><input type="checkbox" checked={form.allDay} onChange={(e) => setForm((p) => ({ ...p, allDay: e.target.checked }))} />All day</label>
        <input type="datetime-local" value={form.startAtUtc} onChange={(e) => setForm((p) => ({ ...p, startAtUtc: e.target.value }))} required />
        <input type="datetime-local" value={form.endAtUtc} onChange={(e) => setForm((p) => ({ ...p, endAtUtc: e.target.value }))} required />
        <button type="submit" className="primary">Add Event</button>
      </form>
      {loading ? <p className="subtle">Loading...</p> : null}
      {error ? <p className="error">{error}</p> : null}
      <div className="stack">
        {items.map((event) => (
          <article className="card between" key={event.id}>
            <div>
              <h3>{event.title}</h3>
              <p className="subtle">{new Date(event.startAtUtc).toLocaleString()} - {new Date(event.endAtUtc).toLocaleString()}</p>
              <p className="pill">{event.status}</p>
            </div>
            <div className="row">
              {event.status !== 'DONE' ? <button className="ghost" onClick={() => markDone(event.id)}>Mark done</button> : null}
              <button className="ghost danger" onClick={() => deleteItem(event.id)}>Trash</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
