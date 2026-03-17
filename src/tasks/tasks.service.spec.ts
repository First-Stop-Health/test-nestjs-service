import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { DatabaseService } from '../database/database.service';
import { Task } from './interfaces/task.interface';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'A test task',
  completed: false,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const mockDatabaseService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: DatabaseService, useValue: mockDatabaseService },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of tasks', () => {
      mockDatabaseService.findAll.mockReturnValue([mockTask]);

      const result = service.findAll();

      expect(result).toEqual([mockTask]);
      expect(mockDatabaseService.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('should return a task when it exists', () => {
      mockDatabaseService.findOne.mockReturnValue(mockTask);

      const result = service.findOne('1');

      expect(result).toEqual(mockTask);
      expect(mockDatabaseService.findOne).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when task does not exist', () => {
      mockDatabaseService.findOne.mockReturnValue(undefined);

      expect(() => service.findOne('999')).toThrow(
        new NotFoundException('Task with ID 999 not found'),
      );
    });
  });

  describe('create', () => {
    it('should create and return a new task', () => {
      mockDatabaseService.create.mockReturnValue(mockTask);

      const result = service.create({ title: 'Test Task', description: 'A test task' });

      expect(result).toEqual(mockTask);
      expect(mockDatabaseService.create).toHaveBeenCalledWith({
        title: 'Test Task',
        description: 'A test task',
        completed: false,
      });
    });

    it('should default completed to false when not provided', () => {
      mockDatabaseService.create.mockReturnValue(mockTask);

      service.create({ title: 'New Task', description: 'Desc' });

      expect(mockDatabaseService.create).toHaveBeenCalledWith(
        expect.objectContaining({ completed: false }),
      );
    });

    it('should pass completed value when provided', () => {
      mockDatabaseService.create.mockReturnValue({ ...mockTask, completed: true });

      service.create({ title: 'Done Task', description: 'Desc', completed: true });

      expect(mockDatabaseService.create).toHaveBeenCalledWith(
        expect.objectContaining({ completed: true }),
      );
    });
  });

  describe('update', () => {
    it('should return the updated task', () => {
      const updated = { ...mockTask, title: 'Updated' };
      mockDatabaseService.update.mockReturnValue(updated);

      const result = service.update('1', { title: 'Updated' });

      expect(result).toEqual(updated);
      expect(mockDatabaseService.update).toHaveBeenCalledWith('1', { title: 'Updated' });
    });

    it('should throw NotFoundException when task does not exist', () => {
      mockDatabaseService.update.mockReturnValue(undefined);

      expect(() => service.update('999', { title: 'x' })).toThrow(
        new NotFoundException('Task with ID 999 not found'),
      );
    });
  });

  describe('delete', () => {
    it('should call database delete with the given id', () => {
      mockDatabaseService.delete.mockReturnValue(true);

      service.delete('1');

      expect(mockDatabaseService.delete).toHaveBeenCalledWith('1');
    });

    it('should throw NotFoundException when task does not exist', () => {
      mockDatabaseService.delete.mockReturnValue(false);

      expect(() => service.delete('999')).toThrow(NotFoundException);
      expect(() => service.delete('999')).toThrow('Task with ID 999 not found');
    });
  });
});
