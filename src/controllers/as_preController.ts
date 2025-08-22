import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_preService, as_tokenService } from "@root/services";
import { ASPROPRE, ASPROPRO, ASPROEAN } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

type Aspropre = ASPROPRE & ASPROPRO & ASPROEAN;

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspropre: Partial<Record<keyof Aspropre, string | number>> = {};
    const allowedFields = new Set<keyof Aspropre>(['PRENID_PRE','PRENID_PRO','PRENID_LOJ','PRENPROLIN','PROCCODPRO','PROCDESCRI','PROCDESINT','PROCDESRES','PRONID_PRO','PRONID_DEP','PRONNAOVDA','EANCCODEAN']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof Aspropre;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof Aspropre;
            aspropre[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspropre.PRENPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspropre.PRENPAGLIM = Number(limit);
    }

    if (!aspropre.USUNID_ENT) {
        const user = await as_tokenService.as_getUser(token as string);
        aspropre.USUNID_ENT = user.recordset[0].APINID_USU;
        // return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Parameter MENNID_USU was not informed",StatusCodes.BAD_REQUEST));
    }

    const result = await as_preService.as_get(token as string, aspropre as Aspropre);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspropre = req.body as ASPROPRE;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspropre) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Price(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_preService.as_Create(token, aspropre);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Price(s) created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPROPRE>(['PRENID_PRE','PRENID_PRO','PRENID_LOJ','PRENPROLIN']);

    const whereConditions: Partial<Record<keyof ASPROPRE, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPROPRE;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPROPRE, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPROPRE;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_preService.as_Update(token, updateData as Partial<ASPROPRE>, whereConditions as Partial<ASPROPRE>);

    return res.status(StatusCodes.OK).json({ message: 'Price(s) updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspropre: Partial<Record<keyof ASPROPRE, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPROPRE>(['PRENID_PRE', 'PRENID_PRO','PRENID_LOJ','PRENPROLIN']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPROPRE;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspropre[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspropre).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_preService.as_Delete(token as string, aspropre as ASPROPRE);

    return res.status(StatusCodes.OK).json({ message: 'Price(s) deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}