import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { flushQueue, getQueuedOperations } from '../utils/offlineQueue'

const SyncQueueContext = createContext(null)

export function SyncQueueProvider({ children }) {
  const [queueSize, setQueueSize] = useState(0)

  const refreshSize = async () => {
    const ops = await getQueuedOperations()
    setQueueSize(ops.length)
  }

  const syncNow = async () => {
    await flushQueue()
    await refreshSize()
  }

  useEffect(() => {
    refreshSize()
    const onOnline = () => {
      syncNow()
    }
    window.addEventListener('online', onOnline)
    return () => window.removeEventListener('online', onOnline)
  }, [])

  const value = useMemo(() => ({ queueSize, syncNow, refreshSize }), [queueSize])

  return <SyncQueueContext.Provider value={value}>{children}</SyncQueueContext.Provider>
}

export function useSyncQueue() {
  const ctx = useContext(SyncQueueContext)
  if (!ctx) {
    throw new Error('useSyncQueue must be used inside SyncQueueProvider')
  }
  return ctx
}
