import { PrismaClient, Project } from '@prisma/client';

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
  static async addProjectMember(projectId: string, targetUserId: string, role: string) {
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
  static async updateEthicalStatus(
    projectId: string,
    status: any,
    metadata?: {
      ethicalClearanceNumber?: string;
      ethicalClearanceDocumentUrl?: string;
      ethicalApprovalDate?: string | Date;
      ethicalExpiryDate?: string | Date;
    }
  ): Promise<Project> {
    const dataToUpdate: any = { ethicalClearanceStatus: status };
    if (metadata?.ethicalClearanceNumber !== undefined) dataToUpdate.ethicalClearanceNumber = metadata.ethicalClearanceNumber;
    if (metadata?.ethicalClearanceDocumentUrl !== undefined) dataToUpdate.ethicalClearanceDocumentUrl = metadata.ethicalClearanceDocumentUrl;
    if (metadata?.ethicalApprovalDate !== undefined) dataToUpdate.ethicalApprovalDate = metadata.ethicalApprovalDate ? new Date(metadata.ethicalApprovalDate) : null;
    if (metadata?.ethicalExpiryDate !== undefined) dataToUpdate.ethicalExpiryDate = metadata.ethicalExpiryDate ? new Date(metadata.ethicalExpiryDate) : null;

    // Automate workflow transitions based on Ethical Status
    if (status === 'UNDER_REVIEW') {
      dataToUpdate.status = 'PENDING';
      dataToUpdate.internalStage = 'ETHICS_REVIEW';
    } else if (status === 'APPROVED' || status === 'NOT_REQUIRED') {
      dataToUpdate.status = 'ACTIVE';
      dataToUpdate.internalStage = 'DATA_COLLECTION';
    } else if (status === 'REJECTED') {
      dataToUpdate.status = 'DRAFT';
      dataToUpdate.internalStage = 'PROPOSAL';
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: dataToUpdate,
    });

    return project;
  }

  /**
   * Updates the internal stage of a project.
   */
  static async updateInternalStage(projectId: string, stage: any): Promise<Project> {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { internalStage: stage },
    });

    return project;
  }

  /**
   * Updates the general status of a project.
   */
  static async updateProjectStatus(projectId: string, status: any): Promise<Project> {
    const project = await prisma.project.update({
      where: { id: projectId },
      data: { status: status },
    });

    return project;
  }

  /**
   * Removes a member from a project.
   */
  static async removeProjectMember(projectId: string, targetUserId: string) {
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
    });

    if (!existingMember) {
      throw { statusCode: 404, message: 'User is not a member of this project.' };
    }

    if (existingMember.role === 'PI') {
      // Typically we don't allow removing the main PI unless there's another PI, 
      // but for simplicity, we'll just throw an error.
      const pis = await prisma.projectMember.count({
        where: { projectId, role: 'PI' },
      });
      if (pis <= 1) {
        throw { statusCode: 400, message: 'Cannot remove the only Principal Investigator from the project.' };
      }
    }

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: targetUserId,
        },
      },
    });

    return { success: true };
  }
}
