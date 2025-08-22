import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_munService } from "@root/services";
import { ASCEPMUN } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let ascepmun: Partial<Record<keyof ASCEPMUN, string | number>> = {};

    const allowedFields = new Set<keyof ASCEPMUN>(['MUNNID_MUN','MUNCCOD_UF','MUNCDESCRI','MUNCCODIBG']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASCEPMUN;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASCEPMUN;
            ascepmun[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        ascepmun.MUNNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        ascepmun.MUNNPAGLIM = Number(limit);
    }

    const result = await as_munService.as_get(token as string, ascepmun as ASCEPMUN);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const ascepmun = req.body as ASCEPMUN;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!ascepmun) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the City data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_munService.as_Create(token, ascepmun);
    
    return res.status(StatusCodes.CREATED).json({ message: 'City created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASCEPMUN>(['MUNNID_MUN','MUNCCOD_UF','MUNCDESCRI','MUNCCODIBG']);

    const whereConditions: Partial<Record<keyof ASCEPMUN, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASCEPMUN;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASCEPMUN, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASCEPMUN;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_munService.as_Update(token, updateData as Partial<ASCEPMUN>, whereConditions as Partial<ASCEPMUN>);

    return res.status(StatusCodes.OK).json({ message: 'City updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let ascepmun: Partial<Record<keyof ASCEPMUN, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASCEPMUN>(['MUNNID_MUN','MUNCCOD_UF','MUNCDESCRI','MUNCCODIBG']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASCEPMUN;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            ascepmun[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(ascepmun).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_munService.as_Delete(token as string, ascepmun as ASCEPMUN);

    return res.status(StatusCodes.OK).json({ message: 'City deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}