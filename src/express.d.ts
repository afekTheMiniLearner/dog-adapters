import { IDogQuery } from './interfaces/dog.interface';

declare global {
    namespace Express {
        interface Request {
            user?: any;
            queryFilters?: IDogQuery;
            id: string;
        }
    }
}
