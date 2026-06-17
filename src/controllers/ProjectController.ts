import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/ProjectService';
import { AuthRequest } from '../middlewares/authMiddleware';

export class ProjectController {
  static async createProject(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const { title, description } = req.body;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
      }

      if (!title || !description) {
        return res.status(400).json({ error: 'Bad Request', message: 'Title and description are required.' });
      }

      const project = await ProjectService.createProject(userId, title, description);
      res.status(201).json({ message: 'Project created successfully.', project });
    } catch (error) {
      next(error);
    }
  }

  static async getProjects(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized', message: 'User not authenticated.' });
      }

      const projects = await ProjectService.getProjectsForUser(userId);
      res.status(200).json({ projects });
    } catch (error) {
      next(error);
    }
  }

  static async getProjectById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;

      const project = await ProjectService.getProjectById(projectId);

      if (!project) {
        return res.status(404).json({ error: 'Not Found', message: 'Project not found.' });
      }

      res.status(200).json({ project });
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;
      const { targetUserId, role } = req.body;

      if (!targetUserId || !role) {
        return res.status(400).json({ error: 'Bad Request', message: 'Target user ID and role are required.' });
      }

      const member = await ProjectService.addProjectMember(projectId, targetUserId, role);
      res.status(201).json({ message: 'Member added successfully.', member });
    } catch (error) {
      next(error);
    }
  }

  static async updateEthics(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Bad Request', message: 'Ethics status is required.' });
      }

      const project = await ProjectService.updateEthicalStatus(projectId, status);
      res.status(200).json({ message: 'Ethical status updated.', project });
    } catch (error) {
      next(error);
    }
  }
}
