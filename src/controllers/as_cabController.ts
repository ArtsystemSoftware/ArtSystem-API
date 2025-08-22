import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_cabService } from "@root/services";
import { ASPEDCAB } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspedcab: Partial<Record<keyof ASPEDCAB, string | number>> = {};

    const allowedFields = new Set<keyof ASPEDCAB>(['CABNID_CAB','CABNID_ENT','CABCTIPENT','CABCPEDSTA','CABNID_LOJ','CABCTIPPED','CABNID_VEN','CABNID_PGE','CABDDATCAD']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPEDCAB;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPEDCAB;
            aspedcab[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspedcab.CABNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspedcab.CABNPAGLIM = Number(limit);
    }

    const result = await as_cabService.as_get(token as string, aspedcab as ASPEDCAB);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspedcab = req.body as ASPEDCAB;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspedcab) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Order(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_cabService.as_Create(token, aspedcab);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Order(s) created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPEDCAB>(['CABNID_CAB','CABNID_ENT','CABCTIPENT','CABCPEDSTA','CABNID_LOJ','CABCTIPPED','CABNID_VEN','CABNID_PGE']);

    const whereConditions: Partial<Record<keyof ASPEDCAB, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCAB;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPEDCAB, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCAB;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_cabService.as_Update(token, updateData as Partial<ASPEDCAB>, whereConditions as Partial<ASPEDCAB>);

    return res.status(StatusCodes.OK).json({ message: 'Order(s) updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspedcab: Partial<Record<keyof ASPEDCAB, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPEDCAB>(['CABNID_CAB', 'CABNID_ENT', 'CABCTIPENT','CABCPEDSTA', 'CABNID_LOJ', 'CABCTIPPED', 'CABNID_VEN', 'CABNID_PGE']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPEDCAB;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspedcab[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspedcab).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_cabService.as_Delete(token as string, aspedcab as ASPEDCAB);

    return res.status(StatusCodes.OK).json({ message: 'Order(s) deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}