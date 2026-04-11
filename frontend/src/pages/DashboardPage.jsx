import { useState } from 'react'
import TasksList from '../components/TasksList'
import { useAuth } from '../context/useAuth'

const sections = [
  { id: 'tasks', label: 'Tasks' },
  { id: 'habits', label: 'Habits' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'logs', label: 'Daily Logs' },
  { id: 'memory', label: 'Memory' },
  { id: 'ai', label: 'AI' },
]

function PlaceholderPanel({ title, description }) {
  return (
    <section className="rounded-xl border border-black/10 bg-white px-5 py-8 shadow-[0_10px_24px_rgba(0,0,0,0.05)]">
      <h2 className="text-lg font-medium text-black">{title}</h2>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">{description}</p>
    </section>
  )
}

export default function DashboardPage() {
  const { currentUser, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('tasks')

  const renderSection = () => {
    if (activeSection === 'tasks') {
      return <TasksList />
    }

    if (activeSection === 'habits') {
      return (
        <PlaceholderPanel
          title="Habits"
          description="The backend now has habit and habit-log foundations. The next UI pass can turn this into a real habit tracker with streaks, completion logging, and review."
        />
      )
    }

    if (activeSection === 'sessions') {
      return (
        <PlaceholderPanel
          title="Work Sessions"
          description="Work session APIs are now scaffolded for focus score, distraction count, and notes. This section is the right place for timers and session history next."
        />
      )
    }

    if (activeSection === 'logs') {
      return (
        <PlaceholderPanel
          title="Daily Logs"
          description="Daily reflections, wins, blockers, mood, energy, and sleep fields are wired in the backend foundation so the app can start building real behavioral context."
        />
      )
    }

    if (activeSection === 'memory') {
      return (
        <PlaceholderPanel
          title="Vector Memory"
          description="TaskIt now has a memory domain and a simple retrieval layer in the backend. This is the base for RAG-powered personalization and future pgvector integration."
        />
      )
    }

    return (
      <PlaceholderPanel
        title="AI Workspace"
        description="The planner can now retrieve relevant memories before generating a task order. This section can grow into daily planning, coaching, warnings, and insights."
      />
    )
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-4 py-8 text-black">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="rounded-xl border border-black/10 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">TaskIt</p>
              <h1 className="mt-2 text-3xl font-medium text-black">
                Tasks
              </h1>
              <p className="mt-1 text-sm text-black/45">
                {currentUser?.email || 'Authenticated user'}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 transition hover:bg-black/[0.03]"
            >
              Log out
            </button>
          </div>
        </header>

        <nav className="flex flex-wrap gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`rounded-lg border px-3 py-2 text-sm transition ${
                activeSection === section.id
                  ? 'border-black bg-black text-white'
                  : 'border-black/10 bg-white text-black/70 hover:bg-black/[0.03]'
              }`}
            >
              {section.label}
            </button>
          ))}
        </nav>

        {renderSection()}
      </div>
    </div>
  )
}
