import { useEffect, useState } from 'react'
import client from '../api/client'

export default function ProfilePage() {
  const [form, setForm] = useState({ displayName: '', avatarUrl: '', bio: '', locale: 'en-US', timezone: 'UTC', email: '' })

  useEffect(() => {
    client.get('/profile').then((res) => setForm(res.data))
  }, [])

  const save = async (e) => {
    e.preventDefault()
    const { data } = await client.put('/profile', form)
    setForm(data)
  }

  return (
    <section className="stack">
      <h2>Profile</h2>
      <form className="card grid two" onSubmit={save}>
        <label>
          Display name
          <input value={form.displayName || ''} onChange={(e) => setForm((p) => ({ ...p, displayName: e.target.value }))} />
        </label>
        <label>
          Email
          <input value={form.email || ''} disabled />
        </label>
        <label>
          Avatar URL
          <input value={form.avatarUrl || ''} onChange={(e) => setForm((p) => ({ ...p, avatarUrl: e.target.value }))} />
        </label>
        <label>
          Locale
          <input value={form.locale || ''} onChange={(e) => setForm((p) => ({ ...p, locale: e.target.value }))} />
        </label>
        <label>
          Timezone
          <input value={form.timezone || ''} onChange={(e) => setForm((p) => ({ ...p, timezone: e.target.value }))} />
        </label>
        <label className="full">
          Bio
          <textarea value={form.bio || ''} onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))} />
        </label>
        <button className="primary" type="submit">Save profile</button>
      </form>
    </section>
  )
}
