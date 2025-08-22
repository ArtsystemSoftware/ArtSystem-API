import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_gerService } from "@root/services";
import { ASCADGER } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let ascadger: Partial<Record<keyof ASCADGER, string | number>> = {};

    const allowedFields = new Set<keyof ASCADGER>(['GERNID_GER','GERCCAM001','GERCDESCRI','GERCTIPCAD']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASCADGER;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASCADGER;
            ascadger[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        ascadger.GERNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        ascadger.GERNPAGLIM = Number(limit);
    }

    const result = await as_gerService.as_get(token as string, ascadger as ASCADGER);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const ascadger = req.body as ASCADGER;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!ascadger) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Description data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_gerService.as_Create(token, ascadger);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Description created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASCADGER>(['GERNID_GER','GERCCAM001','GERCDESCRI','GERCTIPCAD']);

    const whereConditions: Partial<Record<keyof ASCADGER, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASCADGER;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASCADGER, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASCADGER;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_gerService.as_Update(token, updateData as Partial<ASCADGER>, whereConditions as Partial<ASCADGER>);

    return res.status(StatusCodes.OK).json({ message: 'Description updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let ascadger: Partial<Record<keyof ASCADGER, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASCADGER>(['GERNID_GER', 'GERCCAM001','GERCDESCRI','GERCTIPCAD']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASCADGER;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            ascadger[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(ascadger).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_gerService.as_Delete(token as string, ascadger as ASCADGER);

    return res.status(StatusCodes.OK).json({ message: 'Description deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}