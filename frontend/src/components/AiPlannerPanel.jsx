import { useEffect, useState } from 'react'
import { api, getApiErrorMessage } from '../lib/api'

export default function AiPlannerPanel() {
  const [plan, setPlan] = useState([])
  const [logs, setLogs] = useState([])
  const [loadingPlan, setLoadingPlan] = useState(false)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [error, setError] = useState(null)

  const loadLogs = async () => {
    setLoadingLogs(true)
    try {
      const response = await api.get('/ai-logs')
      setLogs(Array.isArray(response.data) ? response.data : [])
    } catch {
      setLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }

  useEffect(() => {
    loadLogs()
  }, [])

  const generatePlan = async () => {
    setLoadingPlan(true)
    setError(null)

    try {
      const response = await api.post('/ai/plan', {
        dateTime: new Date().toISOString().slice(0, 19),
      })
      setPlan(Array.isArray(response.data?.plan) ? response.data.plan : [])
      await loadLogs()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to generate AI plan'))
    } finally {
      setLoadingPlan(false)
    }
  }

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
        <h2 className="text-lg font-medium text-black">AI Planner</h2>
        <p className="mt-1 text-sm text-black/45">
          Generates a context-aware execution order using RAG retrieval + task context.
        </p>
        <button
          type="button"
          onClick={generatePlan}
          disabled={loadingPlan}
          className="mt-3 rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-60"
        >
          {loadingPlan ? 'Generating...' : 'Generate plan'}
        </button>

        {error && <p className="mt-3 text-sm text-black/65">{error}</p>}

        {plan.length > 0 && (
          <ol className="mt-4 list-decimal space-y-1 pl-5 text-sm text-black/75">
            {plan.map((step, index) => (
              <li key={`${step}-${index}`}>{step}</li>
            ))}
          </ol>
        )}
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-4 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
        <h3 className="text-base font-medium text-black">AI Interaction Logs</h3>
        <p className="mt-1 text-sm text-black/45">Recent planner prompts and outputs from MongoDB.</p>

        {loadingLogs && <p className="mt-3 text-sm text-black/45">Loading AI logs...</p>}

        {!loadingLogs && logs.length === 0 && (
          <p className="mt-3 text-sm text-black/45">No AI logs found yet.</p>
        )}

        {!loadingLogs && logs.length > 0 && (
          <div className="mt-3 space-y-2">
            {logs.map((log) => (
              <article key={log.id} className="rounded-lg border border-black/10 bg-[#fafafa] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-black/45">
                  {new Date(log.createdAt).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-black/70">
                  <strong>Input:</strong> {log.input}
                </p>
                <p className="mt-1 text-sm text-black/70 whitespace-pre-line">
                  <strong>Output:</strong> {log.output}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
