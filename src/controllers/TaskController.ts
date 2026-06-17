import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/TaskService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

import { prisma } from '../db';

export class TaskController {
  static async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;
      const { title, dueDate, assignedUserId } = req.body;

      if (!title || !dueDate) {
        return res.status(400).json({ error: 'Bad Request', message: 'Title and dueDate are required.' });
      }

      const task = await TaskService.createTask(projectId, title, new Date(dueDate), assignedUserId);
      res.status(201).json({ message: 'Task created successfully.', task });
    } catch (error) {
      next(error);
    }
  }

  static async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;

      const tasks = await TaskService.getTasksForProject(projectId);
      res.status(200).json({ tasks });
    } catch (error) {
      next(error);
    }
  }

  static async updateTaskStatus(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const taskId = req.params.taskId as string;
      const { isCompleted } = req.body;
      const userId = req.user?.id;

      if (typeof isCompleted !== 'boolean') {
        return res.status(400).json({ error: 'Bad Request', message: 'isCompleted boolean flag is required.' });
      }

      // 1. Fetch task to ensure it exists and to get its projectId
      const existingTask = await TaskService.getTaskById(taskId);
      if (!existingTask) {
        return res.status(404).json({ error: 'Not Found', message: 'Task not found.' });
      }

      // 2. Verify the current user is actually a member of the project this task belongs to
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: existingTask.projectId,
            userId: userId!,
          },
        },
      });

      if (!member) {
        return res.status(403).json({ error: 'Forbidden', message: 'You are not a member of the project this task belongs to.' });
      }

      // 3. Update the task
      const updatedTask = await TaskService.updateTaskStatus(taskId, isCompleted);
      res.status(200).json({ message: 'Task status updated.', task: updatedTask });
    } catch (error) {
      next(error);
    }
  }
}
