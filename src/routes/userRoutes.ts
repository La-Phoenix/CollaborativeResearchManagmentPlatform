import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Search users by email
 *     tags: [Users]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Email query string to search for (optional, lists all if omitted)
 *     responses:
 *       200:
 *         description: List of users matching the query
 *       401:
 *         description: Unauthorized
 */
router.get('/users', authenticateJWT, UserController.searchUsers);

export default router;
