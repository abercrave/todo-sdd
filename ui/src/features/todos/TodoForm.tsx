import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { createTodoSchema } from 'shared'
import type { CreateTodoInput } from 'shared'

export interface TodoFormInitialValues {
  title: string
  description: string
  dueAt: string
}

export interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => Promise<void>
  initialValues?: TodoFormInitialValues
  submitLabel?: string
}

export function TodoForm({ onSubmit, initialValues, submitLabel = 'Add todo' }: TodoFormProps) {
  const formId = useId()
  const titleId = `${formId}-title`
  const descriptionId = `${formId}-description`
  const dueAtId = `${formId}-due-at`

  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [dueAt, setDueAt] = useState(initialValues?.dueAt ?? '')
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
      if (!initialValues) {
        setTitle('')
        setDescription('')
        setDueAt('')
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save todo')
    }
  }

  return (
    <form onSubmit={(event) => void handleSubmit(event)}>
      <div>
        <label htmlFor={titleId}>Title</label>
        <input id={titleId} value={title} onChange={(event) => setTitle(event.target.value)} />
      </div>

      <div>
        <label htmlFor={descriptionId}>Description</label>
        <textarea
          id={descriptionId}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor={dueAtId}>Due date</label>
        <input
          id={dueAtId}
          type="date"
          value={dueAt}
          onChange={(event) => setDueAt(event.target.value)}
        />
      </div>

      {(fieldError ?? submitError) && <p role="alert">{fieldError ?? submitError}</p>}

      <button type="submit">{submitLabel}</button>
    </form>
  )
}
