import { useState } from 'react'
import AiPlannerPanel from '../components/AiPlannerPanel'
import AnalyticsPanel from '../components/AnalyticsPanel'
import DailyLogsPanel from '../components/DailyLogsPanel'
import HabitsPanel from '../components/HabitsPanel'
import MemoryPanel from '../components/MemoryPanel'
import SessionsPanel from '../components/SessionsPanel'
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

const mobileActions = [
  { id: 'sessions', label: 'Log' },
  { id: 'logs', label: 'Calendar' },
  { id: 'habits', label: 'Add Habit' },
  { id: 'memory', label: 'Profile' },
]

export default function DashboardPage() {
  const { currentUser, logout } = useAuth()
  const [activeSection, setActiveSection] = useState('tasks')

  const renderSection = () => {
    if (activeSection === 'tasks') {
      return <TasksList />
    }

    if (activeSection === 'habits') {
      return <HabitsPanel />
    }

    if (activeSection === 'sessions') {
      return <SessionsPanel />
    }

    if (activeSection === 'logs') {
      return <DailyLogsPanel />
    }

    if (activeSection === 'memory') {
      return <MemoryPanel />
    }

    return <AiPlannerPanel />
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] px-3 py-4 text-black md:px-5 md:py-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)_320px] xl:grid-cols-[260px_minmax(0,1fr)_340px]">
          <aside className="hidden lg:block">
            <div className="sticky top-4 rounded-2xl border border-black/10 bg-white p-4 shadow-[0_10px_20px_rgba(0,0,0,0.05)]">
              <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">TaskIt</p>
              <h1 className="mt-2 text-2xl font-semibold text-black">Control Panel</h1>
              <p className="mt-1 text-sm text-black/45">{currentUser?.email || 'Authenticated user'}</p>

              <nav className="mt-4 space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                      activeSection === section.id
                        ? 'border-black bg-black text-white'
                        : 'border-black/10 bg-white text-black/70 hover:bg-black/[0.03]'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </nav>

              <button
                type="button"
                onClick={logout}
                className="mt-4 w-full rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 transition hover:bg-black/[0.03]"
              >
                Log out
              </button>
            </div>
          </aside>

          <main className="space-y-4 pb-20 lg:pb-0">
            <header className="rounded-xl border border-black/10 bg-white px-5 py-4 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.28em] text-black/45">TaskIt</p>
                  <h1 className="mt-2 text-3xl font-medium text-black">TaskIt Workspace</h1>
                  <p className="mt-1 text-sm text-black/45">
                    {currentUser?.email || 'Authenticated user'}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="rounded-lg border border-black/10 px-3 py-2 text-sm text-black/75 transition hover:bg-black/[0.03] lg:hidden"
                >
                  Log out
                </button>
              </div>
            </header>

            <nav className="flex flex-wrap gap-2 lg:hidden">
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
          </main>

          <div className="hidden lg:block">
            <AnalyticsPanel />
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-black/10 bg-white/95 p-2 backdrop-blur lg:hidden">
          <div className="mx-auto grid max-w-xl grid-cols-4 gap-2">
            {mobileActions.map((action) => (
              <button
                key={action.id}
                type="button"
                onClick={() => setActiveSection(action.id)}
                className={`rounded-lg px-2 py-3 text-xs font-medium transition ${
                  activeSection === action.id
                    ? 'bg-black text-white'
                    : 'bg-[#f3f3f3] text-black/70 hover:bg-black/[0.06]'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}
