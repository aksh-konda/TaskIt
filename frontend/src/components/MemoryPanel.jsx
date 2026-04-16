import { useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'

const inputClass =
  'w-full rounded-lg border border-black/10 bg-[#fafafa] px-3 py-2 text-sm text-black outline-none transition placeholder:text-black/35 focus:border-black focus:bg-white'

export default function MemoryPanel() {
  const [query, setQuery] = useState('task completion struggles')
  const [memories, setMemories] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const searchMemories = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.get('/memory', {
        params: {
          query,
          limit: 10,
        },
      })
      setMemories(Array.isArray(response.data) ? response.data : [])
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to load memory results'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
      <div>
        <h2 className="text-lg font-medium text-black">Vector Memory Search</h2>
        <p className="mt-1 text-sm text-black/45">
          Query personalized semantic memory retrieved through the RAG layer.
        </p>
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <input
          className={inputClass}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask: Why am I skipping deep work tasks?"
        />
        <button
          type="button"
          disabled={loading}
          onClick={searchMemories}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {loading ? 'Searching...' : 'Search memory'}
        </button>
      </div>

      {error && <p className="text-sm text-black/65">{error}</p>}

      {memories.length > 0 && (
        <div className="space-y-2">
          {memories.map((memory) => (
            <article key={memory.id} className="rounded-lg border border-black/10 bg-[#fafafa] px-4 py-3">
              <p className="text-sm text-black/75">{memory.content}</p>
              <p className="mt-1 text-xs text-black/45">
                {memory.type} | {memory.referenceType || 'n/a'}#{memory.referenceId || 'n/a'}
              </p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}
