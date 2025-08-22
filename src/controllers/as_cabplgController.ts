import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_cabplgService } from "@root/services";
import { ASPEDCAB_PLG } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspedcab_plg: Partial<Record<keyof ASPEDCAB_PLG, string | number>> = {};

    const allowedFields = new Set<keyof ASPEDCAB_PLG>(['PLGNID_PLG','PLGNID_CAB','PLGCID_PLG']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPEDCAB_PLG;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPEDCAB_PLG;
            aspedcab_plg[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspedcab_plg.PLGNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspedcab_plg.PLGNPAGLIM = Number(limit);
    }

    const result = await as_cabplgService.as_get(token as string, aspedcab_plg as ASPEDCAB_PLG);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspedcab_plg = req.body as ASPEDCAB_PLG;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspedcab_plg) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Order(s) from Pluggto data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_cabplgService.as_Create(token, aspedcab_plg);
    
    return res.status(StatusCodes.CREATED).json({ message: `Order(s) from Pluggto created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPEDCAB_PLG>(['PLGNID_PLG','PLGNID_CAB','PLGCID_PLG']);

    const whereConditions: Partial<Record<keyof ASPEDCAB_PLG, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCAB_PLG;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPEDCAB_PLG, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCAB_PLG;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_cabplgService.as_Update(token, updateData as Partial<ASPEDCAB_PLG>, whereConditions as Partial<ASPEDCAB_PLG>);

    return res.status(StatusCodes.OK).json({ message: `Order(s) from Pluggto updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspedcab_plg: Partial<Record<keyof ASPEDCAB_PLG, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPEDCAB_PLG>(['PLGNID_PLG','PLGNID_CAB','PLGCID_PLG']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPEDCAB_PLG;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspedcab_plg[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspedcab_plg).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_cabplgService.as_Delete(token as string, aspedcab_plg as ASPEDCAB_PLG);

    return res.status(StatusCodes.OK).json({ message: `Order(s) from Pluggto deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}