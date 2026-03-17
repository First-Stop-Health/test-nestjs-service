import { Injectable } from '@nestjs/common';
import { Task } from '../tasks/interfaces/task.interface';

@Injectable()
export class DatabaseService {
  private tasks: Map<string, Task> = new Map();
  private idCounter = 1;

  constructor() {
    this.seedData();
  }

  private seedData() {
    const task1: Task = {
      id: '1',
      title: 'Sample Task 1',
      description: 'This is a sample task',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const task2: Task = {
      id: '2',
      title: 'Sample Task 2',
      description: 'This is another sample task',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tasks.set('1', task1);
    this.tasks.set('2', task2);
    this.idCounter = 3;
  }

  findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  findOne(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  create(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const id = String(this.idCounter++);
    const newTask: Task = {
      ...task,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  update(id: string, taskUpdate: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Task | undefined {
    const task = this.tasks.get(id);
    if (!task) {
      return undefined;
    }

    const updatedTask: Task = {
      ...task,
      ...taskUpdate,
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}
