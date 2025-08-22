import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_iteassService } from "@root/services";
import { ASPEDITE_ASS } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspedite_ass: Partial<Record<keyof ASPEDITE_ASS, string | number>> = {};

    const allowedFields = new Set<keyof ASPEDITE_ASS>(['ITANID_ITA','ITANID_ITE']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPEDITE_ASS;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPEDITE_ASS;
            aspedite_ass[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspedite_ass.ITANPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspedite_ass.ITANPAGLIM = Number(limit);
    }

    const result = await as_iteassService.as_get(token as string, aspedite_ass as ASPEDITE_ASS);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspedite_ass = req.body as ASPEDITE_ASS;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspedite_ass) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Order's item(s) association(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_iteassService.as_Create(token, aspedite_ass);
    
    return res.status(StatusCodes.CREATED).json({ message: `Order's item(s) association(s) created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPEDITE_ASS>(['ITANID_ITA','ITANID_ITE']);

    const whereConditions: Partial<Record<keyof ASPEDITE_ASS, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPEDITE_ASS;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPEDITE_ASS, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPEDITE_ASS;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_iteassService.as_Update(token, updateData as Partial<ASPEDITE_ASS>, whereConditions as Partial<ASPEDITE_ASS>);

    return res.status(StatusCodes.OK).json({ message: `Order's item(s) association(s) updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspedite_ass: Partial<Record<keyof ASPEDITE_ASS, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPEDITE_ASS>(['ITANID_ITA','ITANID_ITE']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPEDITE_ASS;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspedite_ass[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspedite_ass).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_iteassService.as_Delete(token as string, aspedite_ass as ASPEDITE_ASS);

    return res.status(StatusCodes.OK).json({ message: `Order's item(s) association(s) deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}