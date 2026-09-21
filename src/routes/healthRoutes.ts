import { Router } from 'express';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Liveness health check
 *     tags: [System]
 *     security: []
 *     responses:
 *       200:
 *         description: API process is running.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 */
router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

export default router;
