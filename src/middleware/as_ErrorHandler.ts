// errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { as_ErrorResponse, as_LogToFile } from '@root/utils'; 
import {getReasonPhrase } from 'http-status-codes';

const as_errorHandler = (error: as_ErrorResponse, req: Request, res: Response, next: NextFunction) => {
    error.statusCode = error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
    error.isOperational = error.statusCode === StatusCodes.INTERNAL_SERVER_ERROR

    const as_error = {
        statusCode: error.statusCode,
        status: getReasonPhrase(error.statusCode),
        message: error.message,
        details: error.details,
    }
     
    // console.log(error);
    as_LogToFile(error, 'as_api_Errorlog');

    if (error.isOperational) {
        as_error.message = "An internal error occured"
        as_error.details = ''
    }
    
    return res.status(as_error.statusCode).json(as_error);
};

export {as_errorHandler};
