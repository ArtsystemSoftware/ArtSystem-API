import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_cencomService } from "@root/services";
import { ASENTCEN_COM } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asentcen_com: Partial<Record<keyof ASENTCEN_COM, string | number>> = {};

    const allowedFields = new Set<keyof ASENTCEN_COM>(['CNCNID_CNC','CNCNID_ENT','CNCCTIPENT']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASENTCEN_COM;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASENTCEN_COM;
            asentcen_com[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asentcen_com.CNCNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asentcen_com.CNCNPAGLIM = Number(limit);
    }

    const result = await as_cencomService.as_get(token as string, asentcen_com as ASENTCEN_COM);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asentcen_com = req.body as ASENTCEN_COM;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asentcen_com) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Commission data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_cencomService.as_Create(token, asentcen_com);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Commission created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASENTCEN_COM>(['CNCNID_CNC','CNCNID_ENT','CNCCTIPENT']);

    const whereConditions: Partial<Record<keyof ASENTCEN_COM, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASENTCEN_COM;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASENTCEN_COM, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASENTCEN_COM;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_cencomService.as_Update(token, updateData as Partial<ASENTCEN_COM>, whereConditions as Partial<ASENTCEN_COM>);

    return res.status(StatusCodes.OK).json({ message: 'Commission updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asentcen_com: Partial<Record<keyof ASENTCEN_COM, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASENTCEN_COM>(['CNCNID_CNC','CNCNID_ENT','CNCCTIPENT']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASENTCEN_COM;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asentcen_com[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asentcen_com).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_cencomService.as_Delete(token as string, asentcen_com as ASENTCEN_COM);

    return res.status(StatusCodes.OK).json({ message: 'Commission deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}