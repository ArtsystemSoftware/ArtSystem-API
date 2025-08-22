import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_iteService } from "@root/services";
import { ASPEDITE } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspedite: Partial<Record<keyof ASPEDITE, string | number>> = {};

    const allowedFields = new Set<keyof ASPEDITE>(['ITENID_CAB','ITENID_ITE','ITENID_PRI','ITENID_PRO']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPEDITE;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPEDITE;
            aspedite[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspedite.ITENPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspedite.ITENPAGLIM = Number(limit);
    }

    const result = await as_iteService.as_get(token as string, aspedite as ASPEDITE);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspedite = req.body as ASPEDITE;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspedite) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Order(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_iteService.as_Create(token, aspedite);
    
    return res.status(StatusCodes.CREATED).json({ message: `Order's Item(s) created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPEDITE>(['ITENID_CAB','ITENID_ITE','ITENID_PRI','ITENID_PRO']);

    const whereConditions: Partial<Record<keyof ASPEDITE, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPEDITE;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPEDITE, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPEDITE;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_iteService.as_Update(token, updateData as Partial<ASPEDITE>, whereConditions as Partial<ASPEDITE>);

    return res.status(StatusCodes.OK).json({ message: `Order's Item(s) updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspedite: Partial<Record<keyof ASPEDITE, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPEDITE>(['ITENID_CAB','ITENID_ITE','ITENID_PRI', 'ITENID_PRO']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPEDITE;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspedite[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspedite).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_iteService.as_Delete(token as string, aspedite as ASPEDITE);

    return res.status(StatusCodes.OK).json({ message: `Order's Item(s) deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}