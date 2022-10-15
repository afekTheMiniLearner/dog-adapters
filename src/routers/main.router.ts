import express, { Request, Response, NextFunction } from 'express';
import { logRequestedUrlMW } from '../middleware/genral.middleware';

const router = express.Router();

router.use(logRequestedUrlMW);

/**
 * @swagger
 * /:
 *   get:
 *     tags: ['Main operations']
 *     description: default api
 *     responses:
 *       200:
 *         description: Returns welcome everyone
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.send('welcome everyone');
});

/**
 * @swagger
 * /health:
 *   get:
 *     tags: ['Main operations']
 *     description: get health server status
 *     responses:
 *       200:
 *         description: Returns OK
 */
router.get('/health', (req: Request, res: Response, next: NextFunction) => {
    res.send('OK');
});

export = router;
