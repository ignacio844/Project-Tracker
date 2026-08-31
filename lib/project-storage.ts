import type { Person, ProjectSnapshot, Task } from './types'

const STORAGE_KEY = 'project-tracker.snapshot.v1'
const SUPABASE_ROW_ID = 'project-tracker'

type SupabaseSnapshotRow = {
  snapshot: unknown
}

function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '')
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return url && anonKey ? { url, anonKey } : null
}

function isStringOrNull(value: unknown): value is string | null {
  return typeof value === 'string' || value === null
}

function isTask(value: unknown): value is Task {
  if (!value || typeof value !== 'object') return false
  const task = value as Record<string, unknown>
  return (
    typeof task.id === 'string' &&
    isStringOrNull(task.parentId) &&
    typeof task.title === 'string' &&
    ['todo', 'in_progress', 'blocked', 'done'].includes(String(task.status)) &&
    ['low', 'medium', 'high', 'urgent'].includes(String(task.priority)) &&
    isStringOrNull(task.assigneeId) &&
    isStringOrNull(task.dueDate)
  )
}

function isPerson(value: unknown): value is Person {
  if (!value || typeof value !== 'object') return false
  const person = value as Record<string, unknown>
  return (
    typeof person.id === 'string' &&
    typeof person.name === 'string' &&
    typeof person.role === 'string' &&
    typeof person.color === 'string'
  )
}

function parseSnapshot(value: unknown): ProjectSnapshot | null {
  const snapshot = value as Partial<ProjectSnapshot>
  if (
    !snapshot ||
    snapshot.version !== 1 ||
    !Array.isArray(snapshot.tasks) ||
    !snapshot.tasks.every(isTask) ||
    !Array.isArray(snapshot.people) ||
    !snapshot.people.every(isPerson)
  ) {
    return null
  }

  return {
    version: 1,
    tasks: snapshot.tasks,
    people: snapshot.people,
    updatedAt:
      typeof snapshot.updatedAt === 'string'
        ? snapshot.updatedAt
        : new Date(0).toISOString(),
  }
}

function loadLocalProjectSnapshot(): ProjectSnapshot | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return parseSnapshot(JSON.parse(raw))
  } catch {
    return null
  }
}

function saveLocalProjectSnapshot(snapshot: ProjectSnapshot): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    return true
  } catch {
    return false
  }
}

/**
 * Loads the shared Supabase snapshot when configured. Local storage is kept as
 * an offline copy and lets existing browser-only data migrate on first setup.
 */
export async function loadProjectSnapshot(): Promise<ProjectSnapshot | null> {
  const localSnapshot = loadLocalProjectSnapshot()
  const config = getSupabaseConfig()
  if (!config) return localSnapshot

  try {
    const response = await fetch(
      `${config.url}/rest/v1/project_snapshots?id=eq.${SUPABASE_ROW_ID}&select=snapshot`,
      {
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
        },
      }
    )
    if (!response.ok) {
      throw new Error(`Supabase respondió con estado ${response.status}`)
    }

    const rows = (await response.json()) as SupabaseSnapshotRow[]
    const remoteSnapshot = rows[0] ? parseSnapshot(rows[0].snapshot) : null
    if (remoteSnapshot) {
      saveLocalProjectSnapshot(remoteSnapshot)
      return remoteSnapshot
    }
  } catch (error) {
    throw error instanceof Error
      ? error
      : new Error('No se pudo leer el proyecto desde Supabase')
  }

  return localSnapshot
}

export async function saveProjectSnapshot(
  tasks: Task[],
  people: Person[]
): Promise<boolean> {
  const snapshot: ProjectSnapshot = {
    version: 1,
    tasks,
    people,
    updatedAt: new Date().toISOString(),
  }

  const savedLocally = saveLocalProjectSnapshot(snapshot)
  const config = getSupabaseConfig()
  if (!config) return savedLocally

  try {
    const response = await fetch(
      `${config.url}/rest/v1/project_snapshots?on_conflict=id`,
      {
        method: 'POST',
        headers: {
          apikey: config.anonKey,
          Authorization: `Bearer ${config.anonKey}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates,return=minimal',
        },
        body: JSON.stringify({ id: SUPABASE_ROW_ID, snapshot }),
      }
    )
    return response.ok
  } catch {
    return false
  }
}
