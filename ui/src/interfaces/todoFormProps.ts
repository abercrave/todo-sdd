import type { CreateTodoInput } from "shared";
import type { TodoFormInitialValues } from "./todoFormInitialValues";

export interface TodoFormProps {
  onSubmit: (input: CreateTodoInput) => Promise<void>;
  initialValues?: TodoFormInitialValues;
  submitLabel?: string;
}
