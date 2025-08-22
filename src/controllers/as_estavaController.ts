import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_estavaService } from "@root/services";
import { ASPROEST_AVA } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asproest_ava: Partial<Record<keyof ASPROEST_AVA, string | number>> = {};

    const allowedFields = new Set<keyof ASPROEST_AVA>(['AVANID_AVA','AVANID_PRO','AVANID_LOJ']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPROEST_AVA;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPROEST_AVA;
            asproest_ava[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asproest_ava.AVANPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asproest_ava.AVANPAGLIM = Number(limit);
    }

    const result = await as_estavaService.as_get(token as string, asproest_ava as ASPROEST_AVA);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asproest_ava = req.body as ASPROEST_AVA;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asproest_ava) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Damaged inventory data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_estavaService.as_Create(token, asproest_ava);
    
    return res.status(StatusCodes.CREATED).json({ message: `Damaged inventory created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPROEST_AVA>(['AVANID_AVA','AVANID_PRO','AVANID_LOJ']);

    const whereConditions: Partial<Record<keyof ASPROEST_AVA, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPROEST_AVA;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPROEST_AVA, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPROEST_AVA;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_estavaService.as_Update(token, updateData as Partial<ASPROEST_AVA>, whereConditions as Partial<ASPROEST_AVA>);

    return res.status(StatusCodes.OK).json({ message: `Damaged inventory updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asproest_ava: Partial<Record<keyof ASPROEST_AVA, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPROEST_AVA>(['AVANID_AVA', 'AVANID_PRO','AVANID_LOJ']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPROEST_AVA;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asproest_ava[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asproest_ava).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_estavaService.as_Delete(token as string, asproest_ava as ASPROEST_AVA);

    return res.status(StatusCodes.OK).json({ message: `Damaged inventory deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}