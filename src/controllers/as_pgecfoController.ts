import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_pgecfoService } from "@root/services";
import { ASPGECFO } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspgecfo: Partial<Record<keyof ASPGECFO, string | number>> = {};

    const allowedFields = new Set<keyof ASPGECFO>(['PCFNID_PCF','PCFNID_PGE']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPGECFO;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPGECFO;
            aspgecfo[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspgecfo.PCFNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspgecfo.PCFNPAGLIM = Number(limit);
    }

    const result = await as_pgecfoService.as_get(token as string, aspgecfo as ASPGECFO);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspgecfo = req.body as ASPGECFO;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspgecfo) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the order settings CFOP data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_pgecfoService.as_Create(token, aspgecfo);
    
    return res.status(StatusCodes.CREATED).json({ message: 'order settings CFOP created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPGECFO>(['PCFNID_PCF']);

    const whereConditions: Partial<Record<keyof ASPGECFO, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPGECFO;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPGECFO, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPGECFO;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_pgecfoService.as_Update(token, updateData as Partial<ASPGECFO>, whereConditions as Partial<ASPGECFO>);

    return res.status(StatusCodes.OK).json({ message: 'order settings CFOP updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspgecfo: Partial<Record<keyof ASPGECFO, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPGECFO>(['PCFNID_PCF']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPGECFO;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspgecfo[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspgecfo).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_pgecfoService.as_Delete(token as string, aspgecfo as ASPGECFO);

    return res.status(StatusCodes.OK).json({ message: 'order settings CFOP deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}