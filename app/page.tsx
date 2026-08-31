'use client'

import * as React from 'react'
import { Plus, UsersRound } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { TaskTable } from '@/components/task-table'
import { TaskToolbar } from '@/components/task-toolbar'
import { FlowBackground } from '@/components/flow-background'
import { PeopleFormDialog } from '@/components/people-form-dialog'
import type { AssigneeFilter, StatusFilter } from '@/components/task-toolbar'
import {
  TaskFormDialog,
  type TaskDraft,
} from '@/components/task-form-dialog'
import { computeKpis, createId } from '@/lib/project-utils'
import {
  loadProjectSnapshot,
  saveProjectSnapshot,
} from '@/lib/project-storage'
import type { Person, Task } from '@/lib/types'

export default function Page() {
  const [tasks, setTasks] = React.useState<Task[]>([])
  const [people, setPeople] = React.useState<Person[]>([])
  const [hydrated, setHydrated] = React.useState(false)

  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all')
  const [assigneeFilter, setAssigneeFilter] =
    React.useState<AssigneeFilter>('all')

  const [formOpen, setFormOpen] = React.useState(false)
  const [peopleOpen, setPeopleOpen] = React.useState(false)
  const [editingTask, setEditingTask] = React.useState<Task | null>(null)
  const [lockedParentId, setLockedParentId] = React.useState<string | null>(
    null
  )
  const [deleteTarget, setDeleteTarget] = React.useState<Task | null>(null)

  React.useEffect(() => {
    let active = true

    void loadProjectSnapshot()
      .then((saved) => {
        if (!active) return
        if (saved) {
          setTasks(saved.tasks)
          setPeople(saved.people)
        }
        setHydrated(true)
      })
      .catch(() => {
        if (!active) return
        toast.error(
          'No se pudieron cargar los datos de Supabase. No se sobrescribirá el proyecto.'
        )
      })

    return () => {
      active = false
    }
  }, [])

  React.useEffect(() => {
    if (!hydrated) return
    void saveProjectSnapshot(tasks, people).then((saved) => {
      if (!saved) {
        toast.error('No se pudo sincronizar el progreso con Supabase.')
      }
    })
  }, [tasks, people, hydrated])

  const kpis = React.useMemo(() => computeKpis(tasks), [tasks])

  const hasFilters = statusFilter !== 'all' || assigneeFilter !== 'all'

  // Conjunto de tareas que cumplen los filtros. null = sin filtros.
  const matchIds = React.useMemo(() => {
    if (!hasFilters) return null
    const set = new Set<string>()
    for (const t of tasks) {
      const matchStatus = statusFilter === 'all' || t.status === statusFilter
      const matchAssignee =
        assigneeFilter === 'all' || t.assigneeId === assigneeFilter
      if (matchStatus && matchAssignee) set.add(t.id)
    }
    return set
  }, [tasks, statusFilter, assigneeFilter, hasFilters])

  const parentOptions = React.useMemo(() => {
    if (!editingTask) return tasks

    const excluded = new Set([editingTask.id])
    let changed = true
    while (changed) {
      changed = false
      for (const task of tasks) {
        if (
          task.parentId &&
          excluded.has(task.parentId) &&
          !excluded.has(task.id)
        ) {
          excluded.add(task.id)
          changed = true
        }
      }
    }

    return tasks.filter((task) => !excluded.has(task.id))
  }, [tasks, editingTask])

  function openNewTask() {
    setEditingTask(null)
    setLockedParentId(null)
    setFormOpen(true)
  }

  function openEdit(task: Task) {
    setEditingTask(task)
    setLockedParentId(null)
    setFormOpen(true)
  }

  function openAddSubtask(parent: Task) {
    setEditingTask(null)
    setLockedParentId(parent.id)
    setFormOpen(true)
  }

  function handleSubmit(draft: TaskDraft) {
    if (draft.id) {
      setTasks((prev) =>
        prev.map((t) => (t.id === draft.id ? { ...t, ...draft, id: t.id } : t))
      )
    } else {
      const newTask: Task = {
        id: createId(),
        parentId: draft.parentId,
        title: draft.title,
        status: draft.status,
        priority: draft.priority,
        assigneeId: draft.assigneeId,
        dueDate: draft.dueDate,
      }
      setTasks((prev) => [...prev, newTask])
    }
  }

  function handlePeopleSubmit(updatedPeople: Person[]) {
    setPeople(updatedPeople)
  }

  function handleToggleDone(task: Task) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === task.id
          ? { ...t, status: t.status === 'done' ? 'todo' : 'done' }
          : t
      )
    )
  }

  function handleMove(task: Task, direction: 'up' | 'down') {
    setTasks((prev) => {
      const siblings = prev.filter((item) => item.parentId === task.parentId)
      const siblingIndex = siblings.findIndex((item) => item.id === task.id)
      const other = siblings[siblingIndex + (direction === 'up' ? -1 : 1)]
      if (!other) return prev

      const taskIndex = prev.findIndex((item) => item.id === task.id)
      const otherIndex = prev.findIndex((item) => item.id === other.id)
      const next = [...prev]
      ;[next[taskIndex], next[otherIndex]] = [next[otherIndex], next[taskIndex]]
      return next
    })
  }

  function confirmDelete() {
    if (!deleteTarget) return
    const target = deleteTarget
    setTasks((prev) => {
      const removed = new Set([target.id])
      let changed = true
      while (changed) {
        changed = false
        for (const task of prev) {
          if (
            task.parentId &&
            removed.has(task.parentId) &&
            !removed.has(task.id)
          ) {
            removed.add(task.id)
            changed = true
          }
        }
      }
      return prev.filter((task) => !removed.has(task.id))
    })
    setDeleteTarget(null)
  }

  function clearFilters() {
    setStatusFilter('all')
    setAssigneeFilter('all')
  }

  const deleteChildCount = React.useMemo(() => {
    if (!deleteTarget) return 0
    const descendants = new Set<string>()
    let parentIds = new Set([deleteTarget.id])
    while (parentIds.size > 0) {
      const nextParentIds = new Set<string>()
      for (const task of tasks) {
        if (task.parentId && parentIds.has(task.parentId)) {
          descendants.add(task.id)
          nextParentIds.add(task.id)
        }
      }
      parentIds = nextParentIds
    }
    return descendants.size
  }, [tasks, deleteTarget])

  return (
    <div className="workspace-shell min-h-screen">
      <FlowBackground />
      <main className="mx-auto flex max-w-[88rem] flex-col px-4 pt-4 pb-12 sm:px-6 sm:pt-6 lg:px-8">
        <div className="flex flex-wrap justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setPeopleOpen(true)}
            className="tracker-action-button fx-13 h-9 rounded-md px-3"
          >
            <UsersRound className="size-4" />
            <span className="btn-label">Participantes</span>
          </Button>
          <Button
            onClick={openNewTask}
            className="tracker-action-button fx-13 h-9 rounded-md px-3"
          >
            <Plus className="size-4" />
            <span className="btn-label">Nueva tarea</span>
          </Button>
        </div>

        <section className="work-surface mt-4 overflow-hidden sm:mt-6">
          <div className="grid gap-5 border-b technical-rule p-4 sm:p-6 lg:grid-cols-[minmax(13rem,0.45fr)_minmax(0,1fr)] lg:items-end">
            <div>
              <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                Project Tracker
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {kpis.total} tareas y subtareas con responsables y fechas límite.
              </p>
            </div>
            <TaskToolbar
              status={statusFilter}
              onStatusChange={setStatusFilter}
              assignee={assigneeFilter}
              onAssigneeChange={setAssigneeFilter}
              people={people}
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          </div>
          <TaskTable
            tasks={tasks}
            people={people}
            matchIds={matchIds}
            onToggleDone={handleToggleDone}
            onEdit={openEdit}
            onAddSubtask={openAddSubtask}
            onMove={handleMove}
            onDelete={setDeleteTarget}
          />
        </section>
      </main>

      <TaskFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
        people={people}
        parents={parentOptions}
        initial={editingTask}
        lockedParentId={lockedParentId}
      />

      <PeopleFormDialog
        open={peopleOpen}
        onOpenChange={setPeopleOpen}
        people={people}
        onSubmit={handlePeopleSubmit}
      />

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteChildCount > 0
                ? `Se eliminará "${deleteTarget?.title}" junto con sus ${deleteChildCount} subtarea(s). Esta acción no se puede deshacer.`
                : `Se eliminará "${deleteTarget?.title}". Esta acción no se puede deshacer.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
