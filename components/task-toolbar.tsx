'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  STATUS_LABELS,
  STATUS_ORDER,
  type Person,
  type TaskStatus,
} from '@/lib/types'

export type StatusFilter = TaskStatus | 'all'
export type AssigneeFilter = string | 'all'

const ALL = 'all'

export function TaskToolbar({
  status,
  onStatusChange,
  assignee,
  onAssigneeChange,
  people,
  hasFilters,
  onClear,
}: {
  status: StatusFilter
  onStatusChange: (v: StatusFilter) => void
  assignee: AssigneeFilter
  onAssigneeChange: (v: AssigneeFilter) => void
  people: Person[]
  hasFilters: boolean
  onClear: () => void
}) {
  const statusItems = {
    [ALL]: 'Estados',
    ...Object.fromEntries(STATUS_ORDER.map((s) => [s, STATUS_LABELS[s]])),
  }
  const assigneeItems = {
    [ALL]: 'Responsable',
    ...Object.fromEntries(people.map((p) => [p.id, p.name])),
  }

  return (
    <div className="grid min-w-0 gap-2 sm:grid-cols-[10.5rem_10.5rem_auto] sm:justify-end sm:items-center">
      <Select
        items={statusItems}
        value={status}
        onValueChange={(v) => onStatusChange(v as StatusFilter)}
      >
        <SelectTrigger className="h-9 w-full rounded-md font-mono text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Estados</SelectItem>
          {STATUS_ORDER.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        items={assigneeItems}
        value={assignee}
        onValueChange={(v) => onAssigneeChange(v as AssigneeFilter)}
      >
        <SelectTrigger className="h-9 w-full rounded-md font-mono text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>Responsable</SelectItem>
          {people.map((p) => (
            <SelectItem key={p.id} value={p.id}>
              {p.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          onClick={onClear}
          className="shrink-0 justify-start rounded-md text-muted-foreground sm:justify-center"
        >
          <X className="size-4" />
          Limpiar
        </Button>
      )}
    </div>
  )
}
