import { useEffect, useState } from 'react'
import client from '../api/client'

export default function TrashPage() {
  const [items, setItems] = useState([])

  const load = async () => {
    const { data } = await client.get('/trash')
    setItems(data || [])
  }

  useEffect(() => {
    load()
  }, [])

  const restore = async (item) => {
    await client.post('/trash/restore', { entityType: item.entityType, entityId: item.id })
    await load()
  }

  const purge = async (item) => {
    await client.delete(`/trash/purge/${item.entityType}/${item.id}`)
    await load()
  }

  return (
    <section className="stack">
      <h2>Trash</h2>
      <div className="stack">
        {items.map((item) => (
          <article key={`${item.entityType}-${item.id}`} className="card between">
            <div>
              <h3>{item.title}</h3>
              <p className="subtle">{item.entityType}</p>
            </div>
            <div className="row">
              <button className="ghost" onClick={() => restore(item)}>Restore</button>
              <button className="ghost danger" onClick={() => purge(item)}>Purge</button>
            </div>
          </article>
        ))}
        {items.length === 0 ? <p className="subtle">Trash is empty.</p> : null}
      </div>
    </section>
  )
}
