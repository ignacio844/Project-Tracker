import type { Person, Task } from './types'

export const PEOPLE: Person[] = [
  { id: 'p1', name: 'Lucía Fernández', role: 'Project Manager', color: 'var(--color-person-1)' },
  { id: 'p2', name: 'Mateo Rossi', role: 'Frontend', color: 'var(--color-person-2)' },
  { id: 'p3', name: 'Sofía Herrera', role: 'Backend', color: 'var(--color-person-3)' },
  { id: 'p4', name: 'Diego Navarro', role: 'Diseño UX', color: 'var(--color-person-4)' },
  { id: 'p5', name: 'Elena Castro', role: 'QA', color: 'var(--color-person-5)' },
]

export const INITIAL_TASKS: Task[] = [
  // Descubrimiento
  { id: 't1', parentId: null, title: 'Fase de descubrimiento', status: 'done', priority: 'high', assigneeId: 'p1', dueDate: '2026-08-01' },
  { id: 't1-1', parentId: 't1', title: 'Entrevistas con stakeholders', status: 'done', priority: 'medium', assigneeId: 'p1', dueDate: '2026-07-20' },
  { id: 't1-2', parentId: 't1', title: 'Análisis de competencia', status: 'done', priority: 'low', assigneeId: 'p4', dueDate: '2026-07-28' },
  { id: 't1-3', parentId: 't1', title: 'Documento de requisitos', status: 'done', priority: 'high', assigneeId: 'p1', dueDate: '2026-08-01' },

  // Diseño
  { id: 't2', parentId: null, title: 'Diseño de producto', status: 'in_progress', priority: 'high', assigneeId: 'p4', dueDate: '2026-09-05' },
  { id: 't2-1', parentId: 't2', title: 'Wireframes de baja fidelidad', status: 'done', priority: 'medium', assigneeId: 'p4', dueDate: '2026-08-18' },
  { id: 't2-2', parentId: 't2', title: 'Sistema de diseño', status: 'in_progress', priority: 'high', assigneeId: 'p4', dueDate: '2026-08-30' },
  { id: 't2-3', parentId: 't2', title: 'Prototipo interactivo', status: 'todo', priority: 'medium', assigneeId: 'p2', dueDate: '2026-09-05' },

  // Desarrollo
  { id: 't3', parentId: null, title: 'Desarrollo del MVP', status: 'in_progress', priority: 'urgent', assigneeId: 'p3', dueDate: '2026-10-15' },
  { id: 't3-1', parentId: 't3', title: 'Configuración de infraestructura', status: 'done', priority: 'high', assigneeId: 'p3', dueDate: '2026-08-22' },
  { id: 't3-2', parentId: 't3', title: 'API de autenticación', status: 'in_progress', priority: 'urgent', assigneeId: 'p3', dueDate: '2026-08-25' },
  { id: 't3-3', parentId: 't3', title: 'Panel de control frontend', status: 'in_progress', priority: 'high', assigneeId: 'p2', dueDate: '2026-09-20' },
  { id: 't3-4', parentId: 't3', title: 'Integración de pagos', status: 'blocked', priority: 'high', assigneeId: 'p3', dueDate: '2026-09-30' },
  { id: 't3-5', parentId: 't3', title: 'Notificaciones por correo', status: 'todo', priority: 'medium', assigneeId: 'p2', dueDate: '2026-10-10' },

  // QA y lanzamiento
  { id: 't4', parentId: null, title: 'Pruebas y lanzamiento', status: 'todo', priority: 'medium', assigneeId: 'p5', dueDate: '2026-11-01' },
  { id: 't4-1', parentId: 't4', title: 'Plan de pruebas', status: 'todo', priority: 'medium', assigneeId: 'p5', dueDate: '2026-10-18' },
  { id: 't4-2', parentId: 't4', title: 'Pruebas de regresión', status: 'todo', priority: 'high', assigneeId: 'p5', dueDate: '2026-10-25' },
  { id: 't4-3', parentId: 't4', title: 'Despliegue a producción', status: 'todo', priority: 'urgent', assigneeId: 'p1', dueDate: '2026-11-01' },
]
