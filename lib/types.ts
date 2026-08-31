export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Person {
  id: string
  name: string
  role: string
  color: string
}

export interface Task {
  id: string
  parentId: string | null
  title: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  dueDate: string | null // ISO yyyy-mm-dd
}

export interface ProjectSnapshot {
  version: 1
  tasks: Task[]
  people: Person[]
  updatedAt: string
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  blocked: 'Bloqueada',
  done: 'Completada',
}

export const STATUS_ORDER: TaskStatus[] = [
  'todo',
  'in_progress',
  'blocked',
  'done',
]

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
  urgent: 'Urgente',
}

export const PRIORITY_ORDER: TaskPriority[] = [
  'low',
  'medium',
  'high',
  'urgent',
]
