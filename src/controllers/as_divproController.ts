import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_divproService } from "@root/services";
import { ASENTDIV_PRO } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asentdiv_pro: Partial<Record<keyof ASENTDIV_PRO, string | number>> = {};

    const allowedFields = new Set<keyof ASENTDIV_PRO>(['DIPNID_DIP','DIPNID_DIV','DIPNID_PRO','DIPNID_CNC']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASENTDIV_PRO;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASENTDIV_PRO;
            asentdiv_pro[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asentdiv_pro.DIPNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asentdiv_pro.DIPNPAGLIM = Number(limit);
    }

    const result = await as_divproService.as_get(token as string, asentdiv_pro as ASENTDIV_PRO);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asentdiv_pro = req.body as ASENTDIV_PRO;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asentdiv_pro) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Standard Entity product(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_divproService.as_Create(token, asentdiv_pro);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Standard Entity product(s) created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASENTDIV_PRO>(['DIPNID_DIP','DIPNID_DIV','DIPNID_PRO','DIPNID_CNC']);

    const whereConditions: Partial<Record<keyof ASENTDIV_PRO, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASENTDIV_PRO;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASENTDIV_PRO, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASENTDIV_PRO;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_divproService.as_Update(token, updateData as Partial<ASENTDIV_PRO>, whereConditions as Partial<ASENTDIV_PRO>);

    return res.status(StatusCodes.OK).json({ message: 'Standard Entity product(s) updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asentdiv_pro: Partial<Record<keyof ASENTDIV_PRO, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASENTDIV_PRO>(['DIPNID_DIP','DIPNID_DIV','DIPNID_PRO','DIPNID_CNC']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASENTDIV_PRO;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asentdiv_pro[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asentdiv_pro).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_divproService.as_Delete(token as string, asentdiv_pro as ASENTDIV_PRO);

    return res.status(StatusCodes.OK).json({ message: 'Standard Entity product(s) deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}