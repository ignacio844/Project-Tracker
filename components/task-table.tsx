'use client'

import * as React from 'react'
import {
  ArrowDown,
  ArrowUp,
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
  onMove: (task: Task, direction: 'up' | 'down') => void
  onDelete: (task: Task) => void
}

export function TaskTable({
  tasks,
  people,
  matchIds,
  onToggleDone,
  onEdit,
  onAddSubtask,
  onMove,
  onDelete,
}: TaskTableProps) {
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

  React.useEffect(() => {
    const expandableIds = new Set(
      tasks
        .filter((task) => tasks.some((child) => child.parentId === task.id))
        .map((task) => task.id)
    )

    setExpanded((prev) => {
      const next = new Set(
        [...prev].filter((id) => expandableIds.has(id))
      )

      if (next.size === prev.size) {
        return prev
      }

      return next
    })
  }, [tasks]) // eslint-disable-line react-hooks/exhaustive-deps

  function branchMatches(task: Task): boolean {
    return matches(task.id) || childrenOf(task.id).some(branchMatches)
  }

  const visibleParents = parents.filter(branchMatches)

  function renderTask(
    task: Task,
    depth: number,
    ancestorMatches: boolean
  ): React.ReactNode {
    const kids = childrenOf(task.id)
    const isExpanded = expanded.has(task.id)
    const showWholeBranch = ancestorMatches || matches(task.id)
    const visibleKids = kids.filter(
      (child) => showWholeBranch || branchMatches(child)
    )
    const siblings = tasks.filter((item) => item.parentId === task.parentId)
    const siblingIndex = siblings.findIndex((item) => item.id === task.id)

    return (
      <React.Fragment key={task.id}>
        <TaskRow
          task={task}
          people={people}
          depth={depth}
          hasChildren={kids.length > 0}
          isCollapsed={!isExpanded}
          progress={kids.length > 0 ? subtaskProgress(tasks, task.id) : null}
          canMoveUp={siblingIndex > 0}
          canMoveDown={siblingIndex < siblings.length - 1}
          onToggleCollapse={() => toggleExpanded(task.id)}
          onToggleDone={onToggleDone}
          onEdit={onEdit}
          onAddSubtask={onAddSubtask}
          onMove={onMove}
          onDelete={onDelete}
        />

        {isExpanded &&
          visibleKids.map((child) =>
            renderTask(child, depth + 1, showWholeBranch)
          )}
      </React.Fragment>
    )
  }

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
          {visibleParents.map((parent) => renderTask(parent, 0, false))}
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
  canMoveUp,
  canMoveDown,
  onToggleCollapse,
  onToggleDone,
  onEdit,
  onAddSubtask,
  onMove,
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
  canMoveUp: boolean
  canMoveDown: boolean
  onToggleCollapse: () => void
  onToggleDone: (task: Task) => void
  onEdit: (task: Task) => void
  onAddSubtask: (parent: Task) => void
  onMove: (task: Task, direction: 'up' | 'down') => void
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
        depth === 0 && 'bg-muted/30',
        hasChildren && 'cursor-pointer'
      )}
      onClick={(event) => {
        if (!hasChildren) return
        const target = event.target as HTMLElement
        if (
          target.closest(
            'button, a, input, [role="checkbox"], [role="menuitem"]'
          )
        ) {
          return
        }
        onToggleCollapse()
      }}
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

            <DropdownMenuItem onClick={() => onAddSubtask(task)}>
              <Plus className="size-4" />
              Añadir subtarea
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={!canMoveUp}
              onClick={() => onMove(task, 'up')}
            >
              <ArrowUp className="size-4" />
              Mover hacia arriba
            </DropdownMenuItem>

            <DropdownMenuItem
              disabled={!canMoveDown}
              onClick={() => onMove(task, 'down')}
            >
              <ArrowDown className="size-4" />
              Mover hacia abajo
            </DropdownMenuItem>

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
