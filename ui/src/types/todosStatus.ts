import { TODOS_STATUS } from '../constants/todosStatus'

export type TodosStatus = (typeof TODOS_STATUS)[keyof typeof TODOS_STATUS]
