'use client'

import * as React from 'react'
import {
  ChevronRight,
  CircleDot,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { StatusBadge } from '@/components/status-badge'
import { PriorityBadge } from '@/components/priority-badge'
import { AssigneeAvatar } from '@/components/assignee-avatar'
import {
  findPerson,
  formatDate,
  isOverdue,
  subtaskProgress,
} from '@/lib/project-utils'
import type { Person, Task } from '@/lib/types'

interface TaskTableProps {
  tasks: Task[]
  people: Person[]
  matchIds: Set<string> | null
  onToggleDone: (task: Task) => void
  onEdit: (task: Task) => void
  onAddSubtask: (parent: Task) => void
  onDelete: (task: Task) => void
}

export function TaskTable({
  tasks,
  people,
  matchIds,
  onToggleDone,
  onEdit,
  onAddSubtask,
  onDelete,
}: TaskTableProps) {
  // Empieza vacío:
  // al cargar/recargar ninguna tarea principal aparece expandida.
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set()
  )

  const parents = tasks.filter((t) => t.parentId === null)

  const childrenOf = React.useCallback(
    (id: string) => tasks.filter((t) => t.parentId === id),
    [tasks]
  )

  const matches = React.useCallback(
    (id: string) => (matchIds === null ? true : matchIds.has(id)),
    [matchIds]
  )

  function toggleExpanded(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)

      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }

      return next
    })
  }

  // Si se elimina una tarea que estaba expandida,
  // limpiamos su ID del estado.
  React.useEffect(() => {
    const existingParentIds = new Set(parents.map((parent) => parent.id))

    setExpanded((prev) => {
      const next = new Set(
        [...prev].filter((id) => existingParentIds.has(id))
      )

      if (next.size === prev.size) {
        return prev
      }

      return next
    })
  }, [tasks]) // eslint-disable-line react-hooks/exhaustive-deps

  // Mostrar el padre cuando coincide él o alguna de sus subtareas.
  const visibleParents = parents.filter(
    (parent) =>
      matches(parent.id) ||
      childrenOf(parent.id).some((child) => matches(child.id))
  )

  if (visibleParents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <CircleDot className="size-5" />
        </span>

        <p className="text-sm font-medium">
          No hay tareas que coincidan
        </p>

        <p className="text-sm text-muted-foreground">
          Ajusta los filtros o crea una nueva tarea.
        </p>
      </div>
    )
  }

  return (
    <div>
      <Table className="task-table">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[42%] min-w-[260px]">
              Tarea
            </TableHead>

            <TableHead className="min-w-[130px]">
              Estado
            </TableHead>

            <TableHead className="min-w-[110px]">
              Prioridad
            </TableHead>

            <TableHead className="min-w-[130px]">
              Responsable
            </TableHead>

            <TableHead className="min-w-[120px]">
              Fecha límite
            </TableHead>

            <TableHead
              className="w-10 text-right"
              aria-label="Acciones"
            />
          </TableRow>
        </TableHeader>

        <TableBody>
          {visibleParents.map((parent) => {
            const kids = childrenOf(parent.id)
            const isExpanded = expanded.has(parent.id)

            const prog = subtaskProgress(
              tasks,
              parent.id
            )

            const visibleKids = kids.filter(
              (child) =>
                matches(child.id) ||
                matches(parent.id)
            )

            return (
              <React.Fragment key={parent.id}>
                {/* TAREA PRINCIPAL */}
                <TaskRow
                  task={parent}
                  people={people}
                  depth={0}
                  hasChildren={kids.length > 0}
                  isCollapsed={!isExpanded}
                  progress={
                    kids.length > 0 ? prog : null
                  }
                  onToggleCollapse={() =>
                    toggleExpanded(parent.id)
                  }
                  onToggleDone={onToggleDone}
                  onEdit={onEdit}
                  onAddSubtask={onAddSubtask}
                  onDelete={onDelete}
                />

                {/* SUBTAREAS:
                    solo se renderizan cuando el padre está expandido */}
                {isExpanded &&
                  visibleKids.map((child) => (
                    <TaskRow
                      key={child.id}
                      task={child}
                      people={people}
                      depth={1}
                      hasChildren={false}
                      isCollapsed={true}
                      progress={null}
                      onToggleCollapse={() => {}}
                      onToggleDone={onToggleDone}
                      onEdit={onEdit}
                      onAddSubtask={onAddSubtask}
                      onDelete={onDelete}
                    />
                  ))}
              </React.Fragment>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}

function TaskRow({
  task,
  people,
  depth,
  hasChildren,
  isCollapsed,
  progress,
  onToggleCollapse,
  onToggleDone,
  onEdit,
  onAddSubtask,
  onDelete,
}: {
  task: Task
  people: Person[]
  depth: number
  hasChildren: boolean
  isCollapsed: boolean
  progress: {
    done: number
    total: number
    percent: number
  } | null
  onToggleCollapse: () => void
  onToggleDone: (task: Task) => void
  onEdit: (task: Task) => void
  onAddSubtask: (parent: Task) => void
  onDelete: (task: Task) => void
}) {
  const person = findPerson(
    people,
    task.assigneeId
  )

  const overdue = isOverdue(task)
  const done = task.status === 'done'

  return (
    <TableRow
      className={cn(
        depth === 0 && 'bg-muted/30'
      )}
    >
      <TableCell>
        <div
          className="flex items-center gap-2"
          style={{
            paddingLeft: depth * 24,
          }}
        >
          {/* EXPANDIR / COLAPSAR */}
          {hasChildren ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="
                flex
                size-5
                shrink-0
                items-center
                justify-center
                rounded
                text-muted-foreground
                transition-colors
                hover:bg-muted
                hover:text-foreground
              "
              aria-label={
                isCollapsed
                  ? 'Expandir subtareas'
                  : 'Colapsar subtareas'
              }
              aria-expanded={!isCollapsed}
            >
              <ChevronRight
                className={cn(
                  'size-4 transition-transform duration-200',
                  !isCollapsed &&
                    'rotate-90'
                )}
              />
            </button>
          ) : (
            <span className="size-5 shrink-0" />
          )}

          {/* CHECK */}
          <Checkbox
            checked={done}
            onCheckedChange={() =>
              onToggleDone(task)
            }
            aria-label={
              done
                ? 'Marcar como pendiente'
                : 'Marcar como completada'
            }
          />

          {/* NOMBRE */}
          <div className="flex min-w-0 flex-col">
            <span
              className={cn(
                'truncate text-sm',
                depth === 0
                  ? 'font-semibold'
                  : 'font-medium',
                done &&
                  'text-muted-foreground line-through'
              )}
            >
              {task.title}
            </span>

            {/* PROGRESO DE SUBTAREAS */}
            {progress &&
              progress.total > 0 && (
                <span className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="h-1 w-16 overflow-hidden rounded-full bg-border">
                    <span
                      className="block h-full rounded-full bg-primary"
                      style={{
                        width: `${progress.percent}%`,
                      }}
                    />
                  </span>

                  {progress.done}/
                  {progress.total} subtareas
                </span>
              )}
          </div>
        </div>
      </TableCell>

      {/* ESTADO */}
      <TableCell data-label="Estado">
        <StatusBadge status={task.status} />
      </TableCell>

      {/* PRIORIDAD */}
      <TableCell data-label="Prioridad">
        <PriorityBadge
          priority={task.priority}
        />
      </TableCell>

      {/* RESPONSABLE */}
      <TableCell data-label="Responsable">
        <AssigneeAvatar person={person} />
      </TableCell>

      {/* FECHA */}
      <TableCell data-label="Fecha">
        <span
          className={cn(
            'text-sm tabular-nums',
            overdue
              ? 'font-medium text-destructive'
              : 'text-muted-foreground'
          )}
        >
          {formatDate(task.dueDate)}

          {overdue && (
            <span className="ml-1 text-xs">
              · vencida
            </span>
          )}
        </span>
      </TableCell>

      {/* ACCIONES */}
      <TableCell
        data-label="Acciones"
        className="text-right"
      >
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="size-8"
              />
            }
          >
            <MoreHorizontal className="size-4" />

            <span className="sr-only">
              Abrir acciones
            </span>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => onEdit(task)}
            >
              <Pencil className="size-4" />
              Editar
            </DropdownMenuItem>

            {depth === 0 && (
              <DropdownMenuItem
                onClick={() =>
                  onAddSubtask(task)
                }
              >
                <Plus className="size-4" />
                Añadir subtarea
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />

            <DropdownMenuItem
              variant="destructive"
              onClick={() =>
                onDelete(task)
              }
            >
              <Trash2 className="size-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  ) 
}