import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_assService } from "@root/services";
import { ASPROASS } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asproass: Partial<Record<keyof ASPROASS, string | number>> = {};

    const allowedFields = new Set<keyof ASPROASS>(['ASSNID_ASS','ASSNID_PRI','ASSNID_PRO']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPROASS;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPROASS;
            asproass[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asproass.ASSNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asproass.ASSNPAGLIM = Number(limit);
    }

    const result = await as_assService.as_get(token as string, asproass as ASPROASS);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asproass = req.body as ASPROASS;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asproass) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Association(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_assService.as_Create(token, asproass);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Association(s) created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPROASS>(['ASSNID_ASS','ASSNID_PRI','ASSNID_PRO']);

    const whereConditions: Partial<Record<keyof ASPROASS, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPROASS;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPROASS, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPROASS;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_assService.as_Update(token, updateData as Partial<ASPROASS>, whereConditions as Partial<ASPROASS>);

    return res.status(StatusCodes.OK).json({ message: 'Association(s) updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asproass: Partial<Record<keyof ASPROASS, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPROASS>(['ASSNID_ASS', 'ASSNID_PRI','ASSNID_PRO']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPROASS;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asproass[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asproass).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_assService.as_Delete(token as string, asproass as ASPROASS);

    return res.status(StatusCodes.OK).json({ message: 'Association(s) deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}