import { Request, Response } from 'express';
import prisma from '../config/prisma';

export class UserController {
  /**
   * Search users by email or list all users if no query is provided
   */
  static async searchUsers(req: Request, res: Response) {
    try {
      const query = req.query.q as string;

      let users;
      if (query) {
        users = await prisma.user.findMany({
          where: {
            email: {
              contains: query,
              mode: 'insensitive',
            },
          },
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
          take: 20, // limit to 20 results for performance
        });
      } else {
        users = await prisma.user.findMany({
          select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
          },
          take: 50, // limit to 50 results if no query
        });
      }

      res.status(200).json(users);
    } catch (error) {
      console.error('Error searching users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
