import mongoose from 'mongoose';
import logger from '../utils/logger';
import { REQUEST_ID } from '../utils/consts';

export async function connectDB(uri: string) {
    if (mongoose.connection.readyState !== 0) return;
    logger.info(REQUEST_ID, 'connecting to mongodb database');

    return mongoose
        .connect(uri)
        .then(() => {
            logger.info(REQUEST_ID, 'connected to database');
        })
        .catch((error) => {
            logger.error(REQUEST_ID, 'failed to connect db', { error });
            throw error;
        });
}
