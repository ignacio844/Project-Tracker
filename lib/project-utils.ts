import type { Person, Task, TaskStatus } from './types'

export function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function findPerson(people: Person[], id: string | null): Person | null {
  if (!id) return null
  return people.find((p) => p.id === id) ?? null
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  const date = new Date(`${iso}T00:00:00`)
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function isOverdue(task: Task, now = new Date()): boolean {
  if (!task.dueDate || task.status === 'done') return false
  const due = new Date(`${task.dueDate}T23:59:59`)
  return due.getTime() < now.getTime()
}

export interface Kpis {
  total: number
  done: number
  inProgress: number
  todo: number
  blocked: number
  overdue: number
  completionRate: number
}

export function computeKpis(tasks: Task[]): Kpis {
  const total = tasks.length
  const count = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).length
  const done = count('done')
  const overdue = tasks.filter((t) => isOverdue(t)).length
  return {
    total,
    done,
    inProgress: count('in_progress'),
    todo: count('todo'),
    blocked: count('blocked'),
    overdue,
    completionRate: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

/** Progreso (0-100) de las subtareas completadas de una tarea padre. */
export function subtaskProgress(
  tasks: Task[],
  parentId: string
): { done: number; total: number; percent: number } {
  const children = tasks.filter((t) => t.parentId === parentId)
  const total = children.length
  const done = children.filter((t) => t.status === 'done').length
  return {
    done,
    total,
    percent: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

export function createId(): string {
  return `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}
