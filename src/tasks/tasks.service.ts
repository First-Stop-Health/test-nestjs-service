import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Task } from './interfaces/task.interface';

@Injectable()
export class TasksService {
  constructor(private readonly databaseService: DatabaseService) {}

  findAll(): Task[] {
    return this.databaseService.findAll();
  }

  findOne(id: string): Task {
    const task = this.databaseService.findOne(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  create(createTaskDto: CreateTaskDto): Task {
    const taskData = {
      title: createTaskDto.title,
      description: createTaskDto.description,
      completed: createTaskDto.completed ?? false,
    };
    return this.databaseService.create(taskData);
  }

  update(id: string, updateTaskDto: UpdateTaskDto): Task {
    const updatedTask = this.databaseService.update(id, updateTaskDto);
    if (!updatedTask) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return updatedTask;
  }

  delete(id: string): void {
    const deleted = this.databaseService.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
  }
}
