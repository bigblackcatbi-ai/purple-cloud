import { DBSchema, IDBPDatabase, openDB } from "idb"

import type { Company, Customer, Design } from "./types"

interface PurpleCloudDB extends DBSchema {
  companies: { key: string; value: Company }
  customers: { key: string; value: Customer }
  designs: { key: string; value: Design }
}

type StoreName = "companies" | "customers" | "designs"

const DB_NAME = "purple-cloud"
const DB_VERSION = 1
const FALLBACK_PREFIX = "purple-cloud:"

let databasePromise: Promise<IDBPDatabase<PurpleCloudDB>> | undefined
let indexedDbFailed = false
let mutationQueue = Promise.resolve()

function enqueueMutation<T>(mutation: () => Promise<T>) {
  const result = mutationQueue.then(mutation, mutation)
  mutationQueue = result.then(() => undefined, () => undefined)
  return result
}

async function getDatabase() {
  if (typeof window === "undefined" || indexedDbFailed) return undefined
  databasePromise ??= openDB<PurpleCloudDB>(DB_NAME, DB_VERSION, {
    upgrade(database) {
      database.createObjectStore("companies", { keyPath: "id" })
      database.createObjectStore("customers", { keyPath: "id" })
      database.createObjectStore("designs", { keyPath: "id" })
    },
  })

  try {
    return await databasePromise
  } catch {
    indexedDbFailed = true
    return undefined
  }
}

function fallbackKey(storeName: string) {
  return `${FALLBACK_PREFIX}${storeName}`
}

function readFallback<T>(storeName: string): T[] {
  try {
    const value = window.localStorage.getItem(fallbackKey(storeName))
    return value ? (JSON.parse(value) as T[]) : []
  } catch {
    return []
  }
}

function writeFallback<T>(storeName: string, records: T[]) {
  window.localStorage.setItem(fallbackKey(storeName), JSON.stringify(records))
}

export async function listRecords<T>(storeName: StoreName) {
  const database = await getDatabase()
  if (database) return database.getAll(storeName) as Promise<T[]>
  return readFallback<T>(storeName)
}

export async function putRecord<T extends { id?: string }>(
  storeName: StoreName,
  record: T,
) {
  return enqueueMutation(async () => {
    const database = await getDatabase()
    if (database) {
      await database.put(storeName, record as never)
      return
    }

    const key = record.id
    const records = readFallback<T>(storeName).filter((item) => item.id !== key)
    writeFallback(storeName, [record, ...records])
  })
}

export async function deleteRecord(storeName: StoreName, key: string) {
  return enqueueMutation(async () => {
    const database = await getDatabase()
    if (database) {
      await database.delete(storeName, key)
      return
    }

    const records = readFallback<{ id?: string }>(storeName).filter(
      (item) => item.id !== key,
    )
    writeFallback(storeName, records)
  })
}

export async function replaceRecords<T>(storeName: StoreName, records: T[]) {
  const database = await getDatabase()
  if (database) {
    const transaction = database.transaction(storeName, "readwrite")
    await transaction.store.clear()
    for (const record of records) await transaction.store.put(record as never)
    await transaction.done
    return
  }
  writeFallback(storeName, records)
}

export async function clearDatabase() {
  const database = await getDatabase()
  if (database) {
    const transaction = database.transaction(
      ["companies", "customers", "designs"],
      "readwrite",
    )
    await Promise.all([
      transaction.objectStore("companies").clear(),
      transaction.objectStore("customers").clear(),
      transaction.objectStore("designs").clear(),
    ])
    await transaction.done
    return
  }

  for (const storeName of ["companies", "customers", "designs"]) {
    window.localStorage.removeItem(fallbackKey(storeName))
  }
}
