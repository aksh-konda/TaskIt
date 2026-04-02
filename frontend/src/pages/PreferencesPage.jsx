import { useEffect, useState } from 'react'
import client from '../api/client'
import { useTheme } from '../contexts/ThemeContext'

export default function PreferencesPage() {
  const { themeId, setThemeId, themes } = useTheme()
  const [form, setForm] = useState({
    themeId,
    motionIntensity: 'normal',
    weekStartDay: 'monday',
    defaultReminderMinutesBefore: 15,
    notificationsEnabled: true,
    quietHoursStart: '23:00',
    quietHoursEnd: '07:00',
  })

  useEffect(() => {
    client.get('/preferences').then((res) => {
      setForm(res.data)
      if (res.data?.themeId) {
        setThemeId(res.data.themeId)
      }
    })
  }, [setThemeId])

  const save = async (e) => {
    e.preventDefault()
    const { data } = await client.put('/preferences', form)
    setForm(data)
    if (data.themeId) {
      setThemeId(data.themeId)
    }
  }

  return (
    <section className="stack">
      <h2>Preferences</h2>
      <form className="card grid two" onSubmit={save}>
        <label>
          Theme
          <select value={form.themeId} onChange={(e) => setForm((p) => ({ ...p, themeId: e.target.value }))}>
            {themes.map((theme) => (
              <option value={theme} key={theme}>{theme}</option>
            ))}
          </select>
        </label>
        <label>
          Motion
          <select value={form.motionIntensity} onChange={(e) => setForm((p) => ({ ...p, motionIntensity: e.target.value }))}>
            <option value="none">none</option>
            <option value="reduced">reduced</option>
            <option value="normal">normal</option>
          </select>
        </label>
        <label>
          Week start
          <select value={form.weekStartDay} onChange={(e) => setForm((p) => ({ ...p, weekStartDay: e.target.value }))}>
            <option value="monday">monday</option>
            <option value="sunday">sunday</option>
          </select>
        </label>
        <label>
          Reminder minutes before
          <input type="number" value={form.defaultReminderMinutesBefore} onChange={(e) => setForm((p) => ({ ...p, defaultReminderMinutesBefore: Number(e.target.value) }))} />
        </label>
        <label className="inline-check">
          <input type="checkbox" checked={form.notificationsEnabled} onChange={(e) => setForm((p) => ({ ...p, notificationsEnabled: e.target.checked }))} />
          Enable notifications
        </label>
        <label>
          Quiet start
          <input value={form.quietHoursStart || ''} onChange={(e) => setForm((p) => ({ ...p, quietHoursStart: e.target.value }))} />
        </label>
        <label>
          Quiet end
          <input value={form.quietHoursEnd || ''} onChange={(e) => setForm((p) => ({ ...p, quietHoursEnd: e.target.value }))} />
        </label>
        <button className="primary" type="submit">Save preferences</button>
      </form>
    </section>
  )
}
