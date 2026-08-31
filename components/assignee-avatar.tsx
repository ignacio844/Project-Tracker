import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/project-utils'
import type { Person } from '@/lib/types'

export function AssigneeAvatar({
  person,
  showName = false,
  className,
}: {
  person: Person | null
  showName?: boolean
  className?: string
}) {
  if (!person) {
    return (
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
        <span className="flex size-7 items-center justify-center rounded-full border border-dashed border-border text-xs">
          ?
        </span>
        {showName && 'Sin asignar'}
      </span>
    )
  }

  const avatar = (
    <Avatar className={cn('size-7', className)}>
      <AvatarFallback
        className="text-[11px] font-semibold text-white"
        style={{ backgroundColor: person.color }}
      >
        {getInitials(person.name)}
      </AvatarFallback>
    </Avatar>
  )

  if (showName) {
    return (
      <span className="inline-flex items-center gap-2">
        {avatar}
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{person.name}</span>
          <span className="text-xs text-muted-foreground">{person.role}</span>
        </span>
      </span>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger render={<span className="inline-flex" />}>
        {avatar}
      </TooltipTrigger>
      <TooltipContent>
        {person.name} · {person.role}
      </TooltipContent>
    </Tooltip>
  )
}
