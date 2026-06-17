import { Request, Response, NextFunction } from 'express';
import { SurveyService } from '../services/SurveyService';
import { AuthRequest } from '../middlewares/authMiddleware';
import { PrismaClient } from '@prisma/client';

import { prisma } from '../db';

export class SurveyController {
  static async createSurvey(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;
      const { title, schemaJson } = req.body;

      if (!title || !schemaJson) {
        return res.status(400).json({ error: 'Bad Request', message: 'Title and schemaJson are required.' });
      }

      const survey = await SurveyService.createSurvey(projectId, title, schemaJson);
      res.status(201).json({ message: 'Survey created successfully.', survey });
    } catch (error) {
      next(error);
    }
  }

  static async getSurveys(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const projectId = req.params.id as string;

      const surveys = await SurveyService.getSurveysForProject(projectId);
      res.status(200).json({ surveys });
    } catch (error) {
      next(error);
    }
  }

  static async submitResponse(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const surveyId = req.params.surveyId as string;
      const { answers } = req.body;
      const userId = req.user?.id;

      if (!answers) {
        return res.status(400).json({ error: 'Bad Request', message: 'Answers JSON is required.' });
      }

      const existingSurvey = await SurveyService.getSurveyById(surveyId);
      if (!existingSurvey) {
        return res.status(404).json({ error: 'Not Found', message: 'Survey not found.' });
      }

      // Check project membership
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: existingSurvey.projectId, userId: userId! },
        },
      });

      if (!member) {
        return res.status(403).json({ error: 'Forbidden', message: 'You are not a member of the project this survey belongs to.' });
      }

      const response = await SurveyService.submitSurveyResponse(surveyId, answers, userId);
      res.status(201).json({ message: 'Survey response submitted successfully.', response });
    } catch (error) {
      next(error);
    }
  }

  static async getResponses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const surveyId = req.params.surveyId as string;
      const userId = req.user?.id;

      const existingSurvey = await SurveyService.getSurveyById(surveyId);
      if (!existingSurvey) {
        return res.status(404).json({ error: 'Not Found', message: 'Survey not found.' });
      }

      // Check project membership and require PI/CO_INVESTIGATOR/ASSISTANT role to view responses?
      // Actually, we'll let RBAC middleware on the route handle generic access, but since the route is /surveys/:surveyId, 
      // we must verify membership here.
      const member = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: { projectId: existingSurvey.projectId, userId: userId! },
        },
      });

      if (!member) {
        return res.status(403).json({ error: 'Forbidden', message: 'You are not a member of the project this survey belongs to.' });
      }

      const responses = await SurveyService.getSurveyResponses(surveyId);
      res.status(200).json({ responses });
    } catch (error) {
      next(error);
    }
  }
}
