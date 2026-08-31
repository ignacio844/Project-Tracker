'use client'

import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  PRIORITY_LABELS,
  PRIORITY_ORDER,
  STATUS_LABELS,
  STATUS_ORDER,
  type Person,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '@/lib/types'

const NONE = '__none__'

export interface TaskDraft {
  id?: string
  parentId: string | null
  title: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  dueDate: string | null
}

export function TaskFormDialog({
  open,
  onOpenChange,
  onSubmit,
  people,
  parents,
  initial,
  lockedParentId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (draft: TaskDraft) => void
  people: Person[]
  /** Posibles tareas padre (solo tareas de nivel superior). */
  parents: Task[]
  initial?: Task | null
  /** Si se define, la tarea será subtarea de este id y el campo queda fijo. */
  lockedParentId?: string | null
}) {
  const [title, setTitle] = React.useState('')
  const [status, setStatus] = React.useState<TaskStatus>('todo')
  const [priority, setPriority] = React.useState<TaskPriority>('medium')
  const [assigneeId, setAssigneeId] = React.useState<string>(NONE)
  const [parentId, setParentId] = React.useState<string>(NONE)
  const [dueDate, setDueDate] = React.useState<string>('')
  const [error, setError] = React.useState<string>('')

  React.useEffect(() => {
    if (!open) return

    setError('')
    setTitle(initial?.title ?? '')
    setStatus(initial?.status ?? 'todo')
    setPriority(initial?.priority ?? 'medium')
    setAssigneeId(initial?.assigneeId ?? NONE)
    setDueDate(initial?.dueDate ?? '')

    if (lockedParentId !== undefined && lockedParentId !== null) {
      setParentId(lockedParentId)
    } else {
      setParentId(initial?.parentId ?? NONE)
    }
  }, [open, initial, lockedParentId])

  const statusItems = React.useMemo(
    () =>
      Object.fromEntries(
        STATUS_ORDER.map((s) => [s, STATUS_LABELS[s]])
      ),
    []
  )

  const priorityItems = React.useMemo(
    () =>
      Object.fromEntries(
        PRIORITY_ORDER.map((p) => [p, PRIORITY_LABELS[p]])
      ),
    []
  )

  const assigneeItems = React.useMemo(
    () => ({
      [NONE]: 'Sin asignar',
      ...Object.fromEntries(people.map((p) => [p.id, p.name])),
    }),
    [people]
  )

  const parentItems = React.useMemo(
    () => ({
      [NONE]: 'Sin tarea padre (nivel superior)',
      ...Object.fromEntries(parents.map((t) => [t.id, t.title])),
    }),
    [parents]
  )

  const isSubtask = parentId !== NONE
  const isLocked =
    lockedParentId !== undefined && lockedParentId !== null

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const trimmed = title.trim()

    if (!trimmed) {
      setError('El título es obligatorio.')
      return
    }

    onSubmit({
      id: initial?.id,
      parentId: parentId === NONE ? null : parentId,
      title: trimmed,
      status,
      priority,
      assigneeId: assigneeId === NONE ? null : assigneeId,
      dueDate: dueDate || null,
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form
          onSubmit={handleSubmit}
          autoComplete="off"
        >
          <DialogHeader>
            <DialogTitle>
              {initial
                ? 'Editar tarea'
                : isLocked
                  ? 'Nueva subtarea'
                  : 'Nueva tarea'}
            </DialogTitle>

            <DialogDescription>
              Completa los detalles del elemento de seguimiento.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-title">Título</Label>

              <Input
                id="task-title"
                name="new-task-title"
                value={title}
                autoFocus
                autoComplete="new-password"
                placeholder="Ej. Diseñar pantalla de inicio de sesión"
                onChange={(e) => {
                  setTitle(e.target.value)

                  if (error) {
                    setError('')
                  }
                }}
                aria-invalid={!!error}
              />

              {error && (
                <p className="text-xs text-destructive">
                  {error}
                </p>
              )}
            </div>

            {!isLocked && (
              <div className="flex flex-col gap-2">
                <Label>Tarea padre</Label>

                <Select
                  items={parentItems}
                  value={parentId}
                  onValueChange={(v) =>
                    setParentId(v as string)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {Object.entries(parentItems).map(
                      ([value, label]) => (
                        <SelectItem
                          key={value}
                          value={value}
                        >
                          {label}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Estado</Label>

                <Select
                  items={statusItems}
                  value={status}
                  onValueChange={(v) =>
                    setStatus(v as TaskStatus)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Prioridad</Label>

                <Select
                  items={priorityItems}
                  value={priority}
                  onValueChange={(v) =>
                    setPriority(v as TaskPriority)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {PRIORITY_ORDER.map((p) => (
                      <SelectItem key={p} value={p}>
                        {PRIORITY_LABELS[p]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Responsable</Label>

                <Select
                  items={assigneeItems}
                  value={assigneeId}
                  onValueChange={(v) =>
                    setAssigneeId(v as string)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value={NONE}>
                      Sin asignar
                    </SelectItem>

                    {people.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="task-due">
                  Fecha límite
                </Label>

                <Input
                  id="task-due"
                  name="task-due-date"
                  type="date"
                  value={dueDate}
                  autoComplete="off"
                  onChange={(e) =>
                    setDueDate(e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>

            <Button type="submit">
              {initial
                ? 'Guardar cambios'
                : 'Crear tarea'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}