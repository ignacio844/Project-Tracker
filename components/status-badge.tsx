import { cn } from '@/lib/utils'
import { STATUS_LABELS, type TaskStatus } from '@/lib/types'

const STATUS_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-muted text-muted-foreground border-border',
  in_progress: 'bg-primary/10 text-primary border-primary/20',
  blocked: 'bg-destructive/10 text-destructive border-destructive/20',
  done: 'bg-success/10 text-success border-success/20',
}

const DOT_STYLES: Record<TaskStatus, string> = {
  todo: 'bg-muted-foreground',
  in_progress: 'bg-primary',
  blocked: 'bg-destructive',
  done: 'bg-success',
}

export function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        STATUS_STYLES[status]
      )}
    >
      <span className={cn('size-1.5 rounded-full', DOT_STYLES[status])} />
      {STATUS_LABELS[status]}
    </span>
  )
}
