import { CalendarDays, CalendarSync, ChartNoAxesColumn, ClipboardCheck, LogOut, UserCircle2, Settings2, Trash2 } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useSyncQueue } from '../contexts/SyncQueueContext'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: ChartNoAxesColumn },
  { to: '/tasks', label: 'Tasks', icon: ClipboardCheck },
  { to: '/habits', label: 'Habits', icon: CalendarSync },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/insights', label: 'Insights', icon: ChartNoAxesColumn },
  { to: '/trash', label: 'Trash', icon: Trash2 },
  { to: '/profile', label: 'Profile', icon: UserCircle2 },
  { to: '/preferences', label: 'Preferences', icon: Settings2 },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { queueSize, syncNow } = useSyncQueue()

  return (
    <div className="app-root">
      <aside className="sidebar">
        <h1 className="brand">TaskIt</h1>
        <p className="subtle">{user?.displayName || user?.email}</p>
        <nav>
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              <Icon size={16} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <button type="button" className="ghost danger" onClick={logout}>
          <LogOut size={16} />
          <span>Logout</span>
        </button>
        <button type="button" className="ghost" onClick={syncNow}>
          <span>Sync queue ({queueSize})</span>
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
