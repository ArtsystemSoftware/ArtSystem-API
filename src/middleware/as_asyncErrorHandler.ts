import { Request, Response, NextFunction, RequestHandler } from 'express';

const as_asyncErrorHandler = ( func: (req: Request, res: Response, next: NextFunction) => Promise<any>): RequestHandler => {
    return (req: Request, res: Response, next: NextFunction): void => {
        func(req, res, next).catch(next);
    };
};

export { as_asyncErrorHandler };
