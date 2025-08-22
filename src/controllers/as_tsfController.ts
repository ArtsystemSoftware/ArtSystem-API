import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_tsfService } from "@root/services";
import { ASTESFIN } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let astesfin: Partial<Record<keyof ASTESFIN, string | number>> = {};

    const allowedFields = new Set<keyof ASTESFIN | 'GERCDESCRI' | 'GERCCAM001' >(['TSFNID_TSF','TSFNID_LOJ','TSFNATIAPK','TSFNID_FIN','GERCCAM001','GERCDESCRI']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASTESFIN;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASTESFIN;
            astesfin[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        astesfin.TSFNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        astesfin.TSFNPAGLIM = Number(limit);
    }

    const result = await as_tsfService.as_get(token as string, astesfin as ASTESFIN);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const astesfin = req.body as ASTESFIN;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!astesfin) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Payments Settings data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_tsfService.as_Create(token, astesfin);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Payments Settings created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASTESFIN | 'GERCCAM001' | 'GERCDESCRI' >(['TSFNID_TSF','TSFNID_LOJ','TSFNID_FIN','TSFNATIAPK','GERCCAM001','GERCDESCRI']);

    const whereConditions: Partial<Record<keyof ASTESFIN, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASTESFIN;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASTESFIN, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASTESFIN;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_tsfService.as_Update(token, updateData as Partial<ASTESFIN>, whereConditions as Partial<ASTESFIN>);

    return res.status(StatusCodes.OK).json({ message: 'Payments Settings updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let astesfin: Partial<Record<keyof ASTESFIN, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASTESFIN | 'GERCCAM001' | 'GERCDESCRI' >(['TSFNID_TSF','TSFNID_LOJ','TSFNID_FIN','TSFNATIAPK', 'GERCCAM001','GERCDESCRI']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASTESFIN;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            astesfin[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(astesfin).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_tsfService.as_Delete(token as string, astesfin as ASTESFIN);

    return res.status(StatusCodes.OK).json({ message: 'Payments Settings deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}