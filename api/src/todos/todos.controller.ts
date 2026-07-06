import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { createTodoSchema, updateTodoSchema } from 'shared';
import type { CreateTodoInput, Todo, UpdateTodoInput } from 'shared';
import { ZodValidationPipe } from '../common/zod-validation.pipe.js';
import { TodosService } from './todos.service.js';

@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body(new ZodValidationPipe(createTodoSchema)) body: CreateTodoInput,
  ): Promise<Todo> {
    return this.todosService.create(body);
  }

  @Get()
  findAll(): Promise<Todo[]> {
    return this.todosService.findAll();
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body(new ZodValidationPipe(updateTodoSchema)) body: UpdateTodoInput,
  ): Promise<Todo> {
    return this.todosService.update(id, body);
  }
}
