import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_eanService } from "@root/services";
import { ASPROEAN } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
     const { page, limit } = req.query;
    // Validar se passo esse tratamento para todos os outros controllers {page, limit}
    // const query: any = {};
    // for (const key in req.query) {
    //     query[key.toLowerCase()] = req.query[key];
    // }
    // const { page, limit } = query;
    
    let asproean: Partial<Record<keyof ASPROEAN, string | number>> = {};

    const allowedFields = new Set<keyof ASPROEAN>(['EANNID_EAN','EANNID_PRO','EANCCODEAN','EANNNAOVDA']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPROEAN;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPROEAN;
            asproean[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asproean.EANNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asproean.EANNPAGLIM = Number(limit);
    }

    const result = await as_eanService.as_get(token as string, asproean as ASPROEAN);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asproean = req.body as ASPROEAN;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asproean) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the BarCode data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_eanService.as_Create(token, asproean);
    
    return res.status(StatusCodes.CREATED).json({ message: 'BarCode created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPROEAN>(['EANNID_EAN','EANCCODEAN','EANCCODEAN']);

    const whereConditions: Partial<Record<keyof ASPROEAN, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPROEAN;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPROEAN, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPROEAN;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_eanService.as_Update(token, updateData as Partial<ASPROEAN>, whereConditions as Partial<ASPROEAN>);

    return res.status(StatusCodes.OK).json({ message: 'BarCode updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asproean: Partial<Record<keyof ASPROEAN, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPROEAN>(['EANNID_EAN', 'EANCCODEAN','EANCCODEAN']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPROEAN;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asproean[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asproean).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_eanService.as_Delete(token as string, asproean as ASPROEAN);

    return res.status(StatusCodes.OK).json({ message: 'BarCode deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}