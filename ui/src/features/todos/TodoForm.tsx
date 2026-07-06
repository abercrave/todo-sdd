import { useState } from 'react'
import type { FormEvent } from 'react'
import { createTodoSchema } from 'shared'
import type { CreateTodoInput } from 'shared'

export interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => Promise<void>
}

export function TodoForm({ onSubmit }: TodoFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueAt, setDueAt] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitError(null)

    const parsed = createTodoSchema.safeParse({
      title,
      description: description.trim() === '' ? undefined : description,
      dueAt: dueAt === '' ? undefined : dueAt,
    })

    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? 'Invalid input')
      return
    }

    setFieldError(null)

    try {
      await onSubmit(parsed.data)
      setTitle('')
      setDescription('')
      setDueAt('')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save todo')
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <div>
        <label htmlFor="todo-title">Title</label>
        <input id="todo-title" value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>

      <div>
        <label htmlFor="todo-description">Description</label>
        <textarea
          id="todo-description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="todo-due-at">Due date</label>
        <input
          id="todo-due-at"
          type="date"
          value={dueAt}
          onChange={(event) => setDueAt(event.target.value)}
        />
      </div>

      {(fieldError ?? submitError) && <p role="alert">{fieldError ?? submitError}</p>}

      <button type="submit">Add todo</button>
    </form>
  )
}
