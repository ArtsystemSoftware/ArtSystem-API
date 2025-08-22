import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_cabcomanService } from "@root/services";
import { ASPEDCOMAN } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspedcoman: Partial<Record<keyof ASPEDCOMAN, string | number>> = {};

    const allowedFields = new Set<keyof ASPEDCOMAN>(['PCMNID_PCM','PCMNID_OPE','PCMNID_LOJ','PCMNID_PRO','PCMNID_PED']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPEDCOMAN;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPEDCOMAN;
            aspedcoman[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspedcoman.PCMNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspedcoman.PCMNPAGLIM = Number(limit);
    }

    const result = await as_cabcomanService.as_get(token as string, aspedcoman as ASPEDCOMAN);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspedcoman = req.body as ASPEDCOMAN;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspedcoman) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Tickets data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_cabcomanService.as_Create(token, aspedcoman);
    
    return res.status(StatusCodes.CREATED).json({ message: `Tickets created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPEDCOMAN>(['PCMNID_PCM','PCMNID_OPE','PCMNID_LOJ','PCMNID_PRO','PCMNID_PED']);

    const whereConditions: Partial<Record<keyof ASPEDCOMAN, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCOMAN;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPEDCOMAN, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCOMAN;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_cabcomanService.as_Update(token, updateData as Partial<ASPEDCOMAN>, whereConditions as Partial<ASPEDCOMAN>);

    return res.status(StatusCodes.OK).json({ message: `Tickets updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspedcoman: Partial<Record<keyof ASPEDCOMAN, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPEDCOMAN>(['PCMNID_PCM','PCMNID_OPE','PCMNID_LOJ','PCMNID_PRO','PCMNID_PED']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPEDCOMAN;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspedcoman[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspedcoman).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_cabcomanService.as_Delete(token as string, aspedcoman as ASPEDCOMAN);

    return res.status(StatusCodes.OK).json({ message: `Tickets deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}