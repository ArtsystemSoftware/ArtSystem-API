import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_figService } from "@root/services";
import { ASPROFIG } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asprofig: Partial<Record<keyof ASPROFIG, string | number>> = {};

    const allowedFields = new Set<keyof ASPROFIG>(['FIGNID_FIG','FIGNIDFIGU','FIGNTIPCFO','FIGCCODCFO','FIGNID_ENT','FIGCTIPCAD','FIGCDESTIN','FIGCORIGEM']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPROFIG;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPROFIG;
            asprofig[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asprofig.FIGNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asprofig.FIGNPAGLIM = Number(limit);
    }

    const result = await as_figService.as_get(token as string, asprofig as ASPROFIG);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asprofig = req.body as ASPROFIG;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asprofig) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Tax Config data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_figService.as_Create(token, asprofig);
    
    return res.status(StatusCodes.CREATED).json({ message: `Tax Config created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPROFIG>(['FIGNID_FIG','FIGNIDFIGU','FIGNTIPCFO','FIGCCODCFO','FIGNID_ENT','FIGCTIPCAD','FIGCDESTIN','FIGCORIGEM']);

    const whereConditions: Partial<Record<keyof ASPROFIG, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPROFIG;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPROFIG, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPROFIG;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_figService.as_Update(token, updateData as Partial<ASPROFIG>, whereConditions as Partial<ASPROFIG>);

    return res.status(StatusCodes.OK).json({ message: `Tax Config updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asprofig: Partial<Record<keyof ASPROFIG, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPROFIG>(['FIGNID_FIG','FIGNIDFIGU','FIGNTIPCFO','FIGCCODCFO','FIGNID_ENT','FIGCTIPCAD','FIGCDESTIN','FIGCORIGEM']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPROFIG;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asprofig[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asprofig).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_figService.as_Delete(token as string, asprofig as ASPROFIG);

    return res.status(StatusCodes.OK).json({ message: `Tax Config deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}