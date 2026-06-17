import { PrismaClient, Project, Role } from '@prisma/client';

import { prisma } from '../db';

export class ProjectService {
  /**
   * Creates a new project and automatically assigns the creator as the Principal Investigator (PI).
   */
  static async createProject(userId: string, title: string, description: string): Promise<Project> {
    const project = await prisma.project.create({
      data: {
        title,
        description,
        members: {
          create: {
            userId,
            role: 'PI', // The creator is automatically the PI
          },
        },
      },
    });

    return project;
  }

  /**
   * Fetches all projects that a specific user is a member of.
   */
  static async getProjectsForUser(userId: string): Promise<Project[]> {
    const projects = await prisma.project.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
      },
    });

    return projects;
  }

  /**
   * Fetches a single project by its ID, including its members.
   */
  static async getProjectById(projectId: string): Promise<Project | null> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, firstName: true, lastName: true, email: true },
            },
          },
        },
        tasks: true,
      },
    });

    return project;
  }

  /**
   * Adds a new member to an existing project.
   */
  static async addProjectMember(projectId: string, targetUserId: string, role: Role) {
    // Prevent duplicate members
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
    });

    if (existingMember) {
      throw { statusCode: 409, message: 'User is already a member of this project.' };
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: targetUserId,
        role,
      },
    });

    return member;
  }

  /**
   * Updates the ethical clearance status of a project.
   */
  static async updateEthicalStatus(projectId: string, status: any): Promise<Project> {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { ethicalClearanceStatus: status },
    });

    return project;
  }
}
