import type { Person, ProjectSnapshot, Task } from './types'

const STORAGE_KEY = 'project-tracker.snapshot.v1'

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

export function loadProjectSnapshot(): ProjectSnapshot | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const snapshot = JSON.parse(raw) as Partial<ProjectSnapshot>
    if (
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
  } catch {
    return null
  }
}

export function saveProjectSnapshot(tasks: Task[], people: Person[]): boolean {
  const snapshot: ProjectSnapshot = {
    version: 1,
    tasks,
    people,
    updatedAt: new Date().toISOString(),
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    return true
  } catch {
    return false
  }
}
