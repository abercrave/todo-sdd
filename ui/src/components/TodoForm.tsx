import { useState } from 'react'
import type { FormEvent } from 'react'
import * as Form from '@radix-ui/react-form'
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
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [dueAt, setDueAt] = useState(initialValues?.dueAt ?? '')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Radix's Form.Message only supplies accessible markup/ARIA plumbing (live,
  // per-field feedback on blur/change) - the pass/fail decision itself always
  // comes from the shared createTodoSchema, never from a hardcoded rule or a
  // native HTML constraint attribute. Each helper below parses that field's
  // slice of the schema (createTodoSchema.shape.<field>) using the exact same
  // normalization already used in the top-level parse in handleSubmit, so
  // there is exactly one place - shared/src/todo.schema.ts - that defines
  // what "required"/"too long"/"invalid date" means.
  const titleFieldMessage = (value: string) => {
    const result = createTodoSchema.shape.title.safeParse(value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

  const descriptionFieldMessage = (value: string) => {
    const result = createTodoSchema.shape.description.safeParse(
      value.trim() === '' ? undefined : value,
    )
    return result.success ? undefined : result.error.issues[0]?.message
  }

  const dueAtFieldMessage = (value: string) => {
    const result = createTodoSchema.shape.dueAt.safeParse(value === '' ? undefined : value)
    return result.success ? undefined : result.error.issues[0]?.message
  }

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
    <Form.Root className="todo-form" onSubmit={(event) => void handleSubmit(event)}>
      <Form.Field className="field" name="title">
        <Form.Label>Title</Form.Label>
        <Form.Control asChild>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </Form.Control>
        <Form.Message
          className="field-message"
          match={(value) => titleFieldMessage(value) !== undefined}
        >
          {titleFieldMessage(title)}
        </Form.Message>
      </Form.Field>

      <Form.Field className="field" name="description">
        <Form.Label>Description</Form.Label>
        <Form.Control asChild>
          <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
        </Form.Control>
        <Form.Message
          className="field-message"
          match={(value) => descriptionFieldMessage(value) !== undefined}
        >
          {descriptionFieldMessage(description)}
        </Form.Message>
      </Form.Field>

      <Form.Field className="field" name="dueAt">
        <Form.Label>Due date</Form.Label>
        <Form.Control asChild>
          <input type="date" value={dueAt} onChange={(event) => setDueAt(event.target.value)} />
        </Form.Control>
        <Form.Message
          className="field-message"
          match={(value) => dueAtFieldMessage(value) !== undefined}
        >
          {dueAtFieldMessage(dueAt)}
        </Form.Message>
      </Form.Field>

      {(fieldError ?? submitError) && (
        <p className="alert" role="alert">
          {fieldError ?? submitError}
        </p>
      )}

      <div className="form-actions">
        <Form.Submit asChild>
          <button type="submit" className="button">
            {submitLabel}
          </button>
        </Form.Submit>
      </div>
    </Form.Root>
  )
}
