import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_tokenService, as_usumenService } from "@root/services";
import { ASENTUSU_MEN } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asentusu_men: Partial<Record<keyof ASENTUSU_MEN, string | number>> = {};

    const allowedFields = new Set<keyof ASENTUSU_MEN>(['MENNID_USU']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASENTUSU_MEN;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASENTUSU_MEN;
            asentusu_men[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asentusu_men.MENNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asentusu_men.MENNPAGLIM = Number(limit);
    }

    if (!asentusu_men.MENNID_USU) {
        const user = await as_tokenService.as_getUser(token as string);
        asentusu_men.MENNID_USU = user.recordset[0].APINID_USU;
        // return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Parameter MENNID_USU was not informed",StatusCodes.BAD_REQUEST));
    }

    const result = await as_usumenService.as_get(token as string, asentusu_men as ASENTUSU_MEN);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asentusu_men = req.body as ASENTUSU_MEN;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asentusu_men) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the user menu option data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_usumenService.as_Create(token, asentusu_men);
    
    return res.status(StatusCodes.CREATED).json({ message: 'user menu option created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASENTUSU_MEN>(['MENNID_USU']);

    const whereConditions: Partial<Record<keyof ASENTUSU_MEN, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASENTUSU_MEN;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASENTUSU_MEN, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASENTUSU_MEN;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_usumenService.as_Update(token, updateData as Partial<ASENTUSU_MEN>, whereConditions as Partial<ASENTUSU_MEN>);

    return res.status(StatusCodes.OK).json({ message: 'user menu option updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asentusu_men: Partial<Record<keyof ASENTUSU_MEN, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASENTUSU_MEN>(['MENNID_USU']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASENTUSU_MEN;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asentusu_men[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asentusu_men).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_usumenService.as_Delete(token as string, asentusu_men as ASENTUSU_MEN);

    return res.status(StatusCodes.OK).json({ message: 'user menu option deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}