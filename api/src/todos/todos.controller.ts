import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UsePipes,
} from '@nestjs/common';
import { createTodoSchema } from 'shared';
import type { CreateTodoInput, Todo } from 'shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { TodosService } from './todos.service.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(createTodoSchema))
  create(@Body() body: CreateTodoInput): Promise<Todo> {
    return this.todosService.create(body);
  }

  @Get()
  findAll(): Promise<Todo[]> {
    return this.todosService.findAll();
  }
}
