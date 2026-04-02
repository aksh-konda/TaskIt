import { useCallback, useEffect, useState } from 'react'
import client from '../api/client'
import { enqueueOperation } from './offlineQueue'

export default function useResourceCrud(basePath) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchItems = useCallback(async () => {
    setLoading(true)
    try {
      const { data } = await client.get(basePath)
      setItems(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [basePath])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  const createItem = async (payload) => {
    if (!navigator.onLine) {
      await enqueueOperation({ method: 'POST', path: basePath, payload })
      const local = { ...payload, id: Date.now(), _queued: true }
      setItems((prev) => [local, ...prev])
      return local
    }
    const { data } = await client.post(basePath, payload)
    setItems((prev) => [data, ...prev])
    return data
  }

  const updateItem = async (id, payload) => {
    if (!navigator.onLine) {
      await enqueueOperation({ method: 'PUT', path: `${basePath}/${id}`, payload })
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...payload, _queued: true } : item)))
      return { ...payload, id, _queued: true }
    }
    const { data } = await client.put(`${basePath}/${id}`, payload)
    setItems((prev) => prev.map((item) => (item.id === id ? data : item)))
    return data
  }

  const deleteItem = async (id) => {
    if (!navigator.onLine) {
      await enqueueOperation({ method: 'DELETE', path: `${basePath}/${id}` })
      setItems((prev) => prev.filter((item) => item.id !== id))
      return
    }
    await client.delete(`${basePath}/${id}`)
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  return {
    items,
    loading,
    error,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
  }
}
