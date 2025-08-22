import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_cepService } from "@root/services";
import { ASCEPCEP } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let ascepcep: Partial<Record<keyof ASCEPCEP, string | number>> = {};

    const allowedFields = new Set<keyof ASCEPCEP>(['CEPNID_CEP','CEPNID_BAI','CEPCCODCEP','CEPCDESCRI','CEPNID_LOG']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASCEPCEP;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASCEPCEP;
            ascepcep[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        ascepcep.CEPNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        ascepcep.CEPNPAGLIM = Number(limit);
    }

    const result = await as_cepService.as_get(token as string, ascepcep as ASCEPCEP);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const ascepcep = req.body as ASCEPCEP;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!ascepcep) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Street data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_cepService.as_Create(token, ascepcep);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Street created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASCEPCEP>(['CEPNID_CEP','CEPNID_BAI','CEPCCODCEP','CEPCDESCRI','CEPNID_LOG']);

    const whereConditions: Partial<Record<keyof ASCEPCEP, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASCEPCEP;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASCEPCEP, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASCEPCEP;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_cepService.as_Update(token, updateData as Partial<ASCEPCEP>, whereConditions as Partial<ASCEPCEP>);

    return res.status(StatusCodes.OK).json({ message: 'Street updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let ascepcep: Partial<Record<keyof ASCEPCEP, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASCEPCEP>(['CEPNID_CEP','CEPNID_BAI','CEPCCODCEP','CEPCDESCRI','CEPNID_LOG']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASCEPCEP;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            ascepcep[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(ascepcep).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_cepService.as_Delete(token as string, ascepcep as ASCEPCEP);

    return res.status(StatusCodes.OK).json({ message: 'Street deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}