import { openDB } from 'idb'
import client from '../api/client'

const DB_NAME = 'taskit-offline'
const STORE_NAME = 'queue'

async function db() {
  return openDB(DB_NAME, 1, {
    upgrade(upgradeDb) {
      if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
        upgradeDb.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
      }
    },
  })
}

export async function enqueueOperation(operation) {
  const database = await db()
  await database.add(STORE_NAME, {
    ...operation,
    createdAt: Date.now(),
  })
}

export async function getQueuedOperations() {
  const database = await db()
  return database.getAll(STORE_NAME)
}

export async function clearOperation(id) {
  const database = await db()
  await database.delete(STORE_NAME, id)
}

export async function flushQueue() {
  const operations = await getQueuedOperations()
  for (const op of operations) {
    try {
      if (op.method === 'POST') {
        await client.post(op.path, op.payload)
      }
      if (op.method === 'PUT') {
        await client.put(op.path, op.payload)
      }
      if (op.method === 'DELETE') {
        await client.delete(op.path)
      }
      await clearOperation(op.id)
    } catch {
      // Keep failed operations in queue for retry.
    }
  }
}
