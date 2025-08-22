import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_baiService } from "@root/services";
import { ASCEPBAI } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let ascepbai: Partial<Record<keyof ASCEPBAI, string | number>> = {};

    const allowedFields = new Set<keyof ASCEPBAI>(['BAINID_BAI','BAINID_MUN','BAICDESCRI']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASCEPBAI;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASCEPBAI;
            ascepbai[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        ascepbai.BAINPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        ascepbai.BAINPAGLIM = Number(limit);
    }

    const result = await as_baiService.as_get(token as string, ascepbai as ASCEPBAI);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const ascepbai = req.body as ASCEPBAI;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!ascepbai) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Neighborhood data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_baiService.as_Create(token, ascepbai);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Neighborhood created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASCEPBAI>(['BAINID_BAI','BAINID_MUN','BAICDESCRI']);

    const whereConditions: Partial<Record<keyof ASCEPBAI, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASCEPBAI;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASCEPBAI, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASCEPBAI;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_baiService.as_Update(token, updateData as Partial<ASCEPBAI>, whereConditions as Partial<ASCEPBAI>);

    return res.status(StatusCodes.OK).json({ message: 'Neighborhood updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let ascepbai: Partial<Record<keyof ASCEPBAI, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASCEPBAI>(['BAINID_BAI','BAINID_MUN','BAICDESCRI']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASCEPBAI;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            ascepbai[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(ascepbai).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_baiService.as_Delete(token as string, ascepbai as ASCEPBAI);

    return res.status(StatusCodes.OK).json({ message: 'Neighborhood deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}