import { Request, Response, NextFunction } from 'express';
import { v4 as UUID } from 'uuid';
import logger from '../utils/logger';

export function requestIdMW(req: Request, res: Response, next: NextFunction) {
    req.id = UUID();
    next();
}

export function logRequestedUrlMW(
    req: Request,
    res: Response,
    next: NextFunction
) {
    logger.debug(
        req.id,
        `call to ${req.method}:${req.originalUrl} body: ${JSON.stringify(
            req.body
        )}`
    );
    next();
}
