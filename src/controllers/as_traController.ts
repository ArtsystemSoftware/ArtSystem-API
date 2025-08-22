import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_traService } from "@root/services";
import { ASENTTRA } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asenttra: Partial<Record<keyof ASENTTRA, string | number>> = {};

    const allowedFields = new Set<keyof ASENTTRA>(['TRANID_ENT']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASENTTRA;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASENTTRA;
            asenttra[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asenttra.TRANPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asenttra.TRANPAGLIM = Number(limit);
    }

    const result = await as_traService.as_get(token as string, asenttra as ASENTTRA);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asenttra = req.body as ASENTTRA;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asenttra) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Carrier data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_traService.as_Create(token, asenttra);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Carrier created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASENTTRA>(['TRANID_ENT']);

    const whereConditions: Partial<Record<keyof ASENTTRA, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASENTTRA;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASENTTRA, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASENTTRA;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_traService.as_Update(token, updateData as Partial<ASENTTRA>, whereConditions as Partial<ASENTTRA>);

    return res.status(StatusCodes.OK).json({ message: 'Carrier updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asenttra: Partial<Record<keyof ASENTTRA, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASENTTRA>(['TRANID_ENT']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASENTTRA;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asenttra[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asenttra).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_traService.as_Delete(token as string, asenttra as ASENTTRA);

    return res.status(StatusCodes.OK).json({ message: 'Carrier deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}