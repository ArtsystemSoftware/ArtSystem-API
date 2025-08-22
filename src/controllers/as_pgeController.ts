import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_pgeService } from "@root/services";
import { ASPGEPGE } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspgepge: Partial<Record<keyof ASPGEPGE, string | number>> = {};

    const allowedFields = new Set<keyof ASPGEPGE>(['PGENID_PGE','PGECTIPPGE','PGENSEPPED']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPGEPGE;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPGEPGE;
            aspgepge[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspgepge.PGENPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspgepge.PGENPAGLIM = Number(limit);
    }

    const result = await as_pgeService.as_get(token as string, aspgepge as ASPGEPGE);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspgepge = req.body as ASPGEPGE;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspgepge) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the order settings data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_pgeService.as_Create(token, aspgepge);
    
    return res.status(StatusCodes.CREATED).json({ message: 'order settings created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPGEPGE>(['PGENID_PGE']);

    const whereConditions: Partial<Record<keyof ASPGEPGE, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPGEPGE;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPGEPGE, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPGEPGE;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_pgeService.as_Update(token, updateData as Partial<ASPGEPGE>, whereConditions as Partial<ASPGEPGE>);

    return res.status(StatusCodes.OK).json({ message: 'order settings updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspgepge: Partial<Record<keyof ASPGEPGE, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPGEPGE>(['PGENID_PGE']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPGEPGE;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspgepge[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspgepge).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_pgeService.as_Delete(token as string, aspgepge as ASPGEPGE);

    return res.status(StatusCodes.OK).json({ message: 'order settings deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}