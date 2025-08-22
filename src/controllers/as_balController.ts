import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_balService } from "@root/services";
import { ASPROBAL } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asprobal: Partial<Record<keyof ASPROBAL, string | number>> = {};

    const allowedFields = new Set<keyof ASPROBAL>(['BALNID_BAL','BALNID_PRO','BALNID_LOJ']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPROBAL;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPROBAL;
            asprobal[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asprobal.BALNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asprobal.BALNPAGLIM = Number(limit);
    }

    const result = await as_balService.as_get(token as string, asprobal as ASPROBAL);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asprobal = req.body as ASPROBAL;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asprobal) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Scale's product(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_balService.as_Create(token, asprobal);
    
    return res.status(StatusCodes.CREATED).json({ message: `Scale's product(s) created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPROBAL>(['BALNID_BAL','BALNID_PRO','BALNID_LOJ']);

    const whereConditions: Partial<Record<keyof ASPROBAL, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPROBAL;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPROBAL, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPROBAL;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_balService.as_Update(token, updateData as Partial<ASPROBAL>, whereConditions as Partial<ASPROBAL>);

    return res.status(StatusCodes.OK).json({ message: `Scale's product(s) updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asprobal: Partial<Record<keyof ASPROBAL, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPROBAL>(['BALNID_BAL', 'BALNID_PRO','BALNID_LOJ']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPROBAL;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asprobal[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asprobal).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_balService.as_Delete(token as string, asprobal as ASPROBAL);

    return res.status(StatusCodes.OK).json({ message: `Scale's product(s) deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}