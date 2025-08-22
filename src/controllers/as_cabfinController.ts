import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_cabfinService } from "@root/services";
import { ASPEDCAB_FIN } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspedcab_fin: Partial<Record<keyof ASPEDCAB_FIN, string | number>> = {};

    const allowedFields = new Set<keyof ASPEDCAB_FIN>(['CAFNID_CAF','CAFNID_CAB','CAFNID_BAN','CAFNID_FIN','CAFNIDBANC']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPEDCAB_FIN;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPEDCAB_FIN;
            aspedcab_fin[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspedcab_fin.CAFNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspedcab_fin.CAFNPAGLIM = Number(limit);
    }

    const result = await as_cabfinService.as_get(token as string, aspedcab_fin as ASPEDCAB_FIN);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspedcab_fin = req.body as ASPEDCAB_FIN;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspedcab_fin) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Order's payment method(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_cabfinService.as_Create(token, aspedcab_fin);
    
    return res.status(StatusCodes.CREATED).json({ message: `Order's payment method(s) created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPEDCAB_FIN>(['CAFNID_CAF','CAFNID_CAB','CAFNID_BAN','CAFNID_FIN','CAFNIDBANC']);

    const whereConditions: Partial<Record<keyof ASPEDCAB_FIN, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCAB_FIN;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPEDCAB_FIN, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCAB_FIN;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_cabfinService.as_Update(token, updateData as Partial<ASPEDCAB_FIN>, whereConditions as Partial<ASPEDCAB_FIN>);

    return res.status(StatusCodes.OK).json({ message: `Order's payment method(s) updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspedcab_fin: Partial<Record<keyof ASPEDCAB_FIN, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPEDCAB_FIN>(['CAFNID_CAF','CAFNID_CAB','CAFNID_BAN','CAFNID_FIN','CAFNIDBANC']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPEDCAB_FIN;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspedcab_fin[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspedcab_fin).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_cabfinService.as_Delete(token as string, aspedcab_fin as ASPEDCAB_FIN);

    return res.status(StatusCodes.OK).json({ message: `Order's payment method(s) deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}