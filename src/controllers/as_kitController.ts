import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_kitService } from "@root/services";
import { ASPROKIT } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asprokit: Partial<Record<keyof ASPROKIT, string | number>> = {};

    const allowedFields = new Set<keyof ASPROKIT>(['KITNID_KIT','KITNID_PRI','KITNID_PRO']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPROKIT;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPROKIT;
            asprokit[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asprokit.KITNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asprokit.KITNPAGLIM = Number(limit);
    }

    const result = await as_kitService.as_get(token as string, asprokit as ASPROKIT);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asprokit = req.body as ASPROKIT;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asprokit) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the kit(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_kitService.as_Create(token, asprokit);
    
    return res.status(StatusCodes.CREATED).json({ message: 'kit(s) created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPROKIT>(['KITNID_KIT','KITNID_PRI','KITNID_PRO']);

    const whereConditions: Partial<Record<keyof ASPROKIT, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPROKIT;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPROKIT, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPROKIT;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_kitService.as_Update(token, updateData as Partial<ASPROKIT>, whereConditions as Partial<ASPROKIT>);

    return res.status(StatusCodes.OK).json({ message: 'kit(s) updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asprokit: Partial<Record<keyof ASPROKIT, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPROKIT>(['KITNID_KIT', 'KITNID_PRI','KITNID_PRO']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPROKIT;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asprokit[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asprokit).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_kitService.as_Delete(token as string, asprokit as ASPROKIT);

    return res.status(StatusCodes.OK).json({ message: 'kit(s) deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}