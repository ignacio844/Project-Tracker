import {
  CircleCheckBig,
  Clock,
  ListTodo,
  TrendingUp,
  TriangleAlert,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Kpis } from '@/lib/project-utils'

function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
}: {
  label: string
  value: string | number
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  accent: string
}) {
  return (
    <div className="flex min-w-0 items-start justify-between gap-3 px-4 py-4 sm:px-6 lg:px-5">
        <div className="flex flex-col gap-1">
          <span className="mono-label text-muted-foreground">{label}</span>
          <span className="font-mono text-2xl font-medium tabular-nums tracking-[-0.04em]">
            {value}
          </span>
          {hint && (
            <span className="text-xs text-muted-foreground">{hint}</span>
          )}
        </div>
        <span
          className={cn(
            'flex size-8 shrink-0 items-center justify-center border',
            accent
          )}
        >
          <Icon className="size-4.5" />
        </span>
    </div>
  )
}

export function KpiCards({ kpis }: { kpis: Kpis }) {
  return (
    <section className="kpi-grid grid border-x border-b technical-rule bg-background sm:grid-cols-2 lg:grid-cols-4" aria-label="Indicadores del proyecto">
      <StatCard
        label="Progreso"
        value={`${kpis.completionRate}%`}
        hint={`${kpis.done} de ${kpis.total} completadas`}
        icon={TrendingUp}
        accent="border-primary/20 bg-primary/10 text-primary"
      />

      <StatCard
        label="Completadas"
        value={kpis.done}
        hint={`${kpis.completionRate}% del total`}
        icon={CircleCheckBig}
        accent="bg-success/10 text-success"
      />
      <StatCard
        label="En progreso"
        value={kpis.inProgress}
        hint={`${kpis.todo} por hacer`}
        icon={Clock}
        accent="bg-primary/10 text-primary"
      />
      <StatCard
        label="Vencidas"
        value={kpis.overdue}
        hint={`${kpis.blocked} bloqueadas`}
        icon={kpis.overdue > 0 ? TriangleAlert : ListTodo}
        accent={
          kpis.overdue > 0
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted text-muted-foreground'
        }
      />
    </section>
  )
}
