import { cn } from '@/lib/utils'
import { PRIORITY_LABELS, type TaskPriority } from '@/lib/types'

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  low: 'text-muted-foreground',
  medium: 'text-foreground',
  high: 'text-warning',
  urgent: 'text-destructive',
}

const BAR_STYLES: Record<TaskPriority, string> = {
  low: 'bg-muted-foreground/40',
  medium: 'bg-foreground/50',
  high: 'bg-warning',
  urgent: 'bg-destructive',
}

const BAR_COUNT: Record<TaskPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
  urgent: 4,
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-xs font-medium', PRIORITY_STYLES[priority])}>
      <span className="flex items-end gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4].map((i) => (
          <span
            key={i}
            className={cn(
              'w-0.5 rounded-full',
              i <= BAR_COUNT[priority] ? BAR_STYLES[priority] : 'bg-border',
            )}
            style={{ height: `${3 + i * 2}px` }}
          />
        ))}
      </span>
      {PRIORITY_LABELS[priority]}
    </span>
  )
}
