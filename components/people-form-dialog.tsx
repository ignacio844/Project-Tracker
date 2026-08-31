'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { Person } from '@/lib/types'

type PeopleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  people: Person[]
  onSubmit: (people: Person[]) => void
}

const COLORS = [
  '#2563eb',
  '#16a34a',
  '#ef4444',
  '#f59e0b',
  '#06b6d4',
  '#8b5cf6',
  '#ec4899',
  '#64748b',
]

function createPersonId() {
  if (
    typeof crypto !== 'undefined' &&
    typeof crypto.randomUUID === 'function'
  ) {
    return crypto.randomUUID()
  }

  return `person-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function getInitials(name: string) {
  const cleanName = name.trim()

  if (!cleanName) return '?'

  const words = cleanName.split(/\s+/)

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase()
  }

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase()
}

export function PeopleFormDialog({
  open,
  onOpenChange,
  people,
  onSubmit,
}: PeopleFormDialogProps) {
  const [draftPeople, setDraftPeople] =
    React.useState<Person[]>(people)

  React.useEffect(() => {
    if (!open) return

    setDraftPeople(
      people.map((person, index) => ({
        ...person,
        color: person.color ?? COLORS[index % COLORS.length],
      }))
    )
  }, [open, people])

  function updatePerson(
    id: string,
    field: 'name' | 'role' | 'color',
    value: string
  ) {
    setDraftPeople((current) =>
      current.map((person) =>
        person.id === id
          ? {
              ...person,
              [field]: value,
            }
          : person
      )
    )
  }

  function handleAddPerson() {
    const newPerson: Person = {
      id: createPersonId(),
      name: '',
      role: '',
      color: COLORS[draftPeople.length % COLORS.length],
    }

    setDraftPeople((current) => [...current, newPerson])

    setTimeout(() => {
      const container = document.querySelector(
        '[data-people-scroll]'
      )

      container?.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth',
      })
    }, 50)
  }

  function handleSave() {
    const cleanedPeople = draftPeople
      .map((person) => ({
        ...person,
        name: person.name.trim(),
        role: person.role.trim(),
      }))
      .filter(
        (person) =>
          person.name.length > 0 || person.role.length > 0
      )

    onSubmit(cleanedPeople)
    onOpenChange(false)
  }

  const hasIncompletePerson = draftPeople.some(
    (person) =>
      person.name.trim() === '' ||
      person.role.trim() === ''
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="
          flex
          max-h-[calc(100vh-32px)]
          w-[calc(100vw-32px)]
          flex-col
          overflow-hidden
          p-0
          sm:max-w-[980px]
        "
      >
        {/* HEADER */}
        <DialogHeader className="shrink-0 px-6 pt-5 pb-4">
          <DialogTitle className="text-xl font-semibold">
            Editar participantes
          </DialogTitle>

          <DialogDescription className="max-w-3xl text-sm">
            Actualiza el nombre y la función de cada integrante.
            Las tareas asignadas conservarán su responsable.
          </DialogDescription>
        </DialogHeader>

        {/* CONTENIDO */}
        <div
          data-people-scroll
          className="
            min-h-0
            flex-1
            space-y-3
            overflow-y-auto
            px-6
            pt-2
            pb-6
          "
        >
          {draftPeople.map((person) => (
            <div
              key={person.id}
              className="
                rounded-lg
                border
                border-border
                bg-background
                px-4
                py-3
              "
            >
              <div
                className="
                  grid
                  items-end
                  gap-4
                  md:grid-cols-[52px_minmax(0,1fr)_minmax(0,1fr)_240px]
                "
              >
                {/* AVATAR */}
                <div className="flex h-10 items-center justify-center">
                  <div
                    className="
                      flex
                      size-11
                      shrink-0
                      items-center
                      justify-center
                      rounded-full
                      text-xs
                      font-bold
                      text-white
                      shadow-sm
                      transition-colors
                    "
                    style={{
                      backgroundColor:
                        person.color ?? COLORS[0],
                    }}
                  >
                    {getInitials(person.name)}
                  </div>
                </div>

                {/* NOMBRE */}
                <div className="min-w-0">
                  <label
                    htmlFor={`person-name-${person.id}`}
                    className="mb-1 block text-xs font-semibold"
                  >
                    Nombre
                  </label>

                  <input
                    id={`person-name-${person.id}`}
                    value={person.name}
                    onChange={(event) =>
                      updatePerson(
                        person.id,
                        'name',
                        event.target.value
                      )
                    }
                    placeholder="Nombre"
                    className="
                      h-10
                      w-full
                      rounded-md
                      border
                      border-input
                      bg-background
                      px-3
                      text-sm
                      outline-none
                      transition
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/30
                    "
                  />
                </div>

                {/* ROL */}
                <div className="min-w-0">
                  <label
                    htmlFor={`person-role-${person.id}`}
                    className="mb-1 block text-xs font-semibold"
                  >
                    Rol
                  </label>

                  <input
                    id={`person-role-${person.id}`}
                    value={person.role}
                    onChange={(event) =>
                      updatePerson(
                        person.id,
                        'role',
                        event.target.value
                      )
                    }
                    placeholder="Rol"
                    className="
                      h-10
                      w-full
                      rounded-md
                      border
                      border-input
                      bg-background
                      px-3
                      text-sm
                      outline-none
                      transition
                      focus:border-primary
                      focus:ring-2
                      focus:ring-primary/30
                    "
                  />
                </div>

                {/* COLOR */}
                <div className="min-w-0">
                  <span className="mb-1 block text-xs font-semibold">
                    Color
                  </span>

                  <div
                    className="
                      flex
                      h-10
                      w-full
                      items-center
                      justify-between
                      rounded-md
                      border
                      border-input
                      bg-background
                      px-3
                    "
                  >
                    {COLORS.map((color) => {
                      const selected =
                        person.color === color

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() =>
                            updatePerson(
                              person.id,
                              'color',
                              color
                            )
                          }
                          aria-label={`Seleccionar color ${color}`}
                          className={`
                            size-5
                            shrink-0
                            rounded-full
                            border-2
                            transition
                            hover:scale-110
                            ${
                              selected
                                ? 'border-foreground ring-2 ring-foreground/20'
                                : 'border-transparent'
                            }
                          `}
                          style={{
                            backgroundColor: color,
                          }}
                        />
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* AÑADIR PARTICIPANTE */}
          <button
            type="button"
            onClick={handleAddPerson}
            className="
              flex
              h-11
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              border
              border-dashed
              border-border
              text-sm
              font-medium
              text-muted-foreground
              transition
              hover:border-primary/60
              hover:bg-muted/40
              hover:text-foreground
            "
          >
            <Plus className="size-4" />
            Añadir participante
          </button>
        </div>

        {/* FOOTER */}
        <DialogFooter
          className="
            shrink-0
            border-t
            border-border
            bg-background
            px-6
            py-4
          "
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={hasIncompletePerson}
          >
            Guardar cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}