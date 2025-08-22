import {getReasonPhrase } from 'http-status-codes';

class as_ErrorResponse extends Error{
    statusCode: number;
    status: string;
    isOperational: boolean;
    details: string | undefined;
    error: string;

    constructor(message: string, statusCode: number, details?: string){
        super(message);
        this.error = message;
        this.statusCode = statusCode;
        this.status = getReasonPhrase(statusCode)
        this.details = details;
        this.isOperational = true;

        Error.captureStackTrace(this, this.constructor);
    }
}

export {as_ErrorResponse}