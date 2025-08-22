import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_cabiosService } from "@root/services";
import { ASPEDCAB_OS_ITE } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspedcab_os_ite: Partial<Record<keyof ASPEDCAB_OS_ITE, string | number>> = {};

    const allowedFields = new Set<keyof ASPEDCAB_OS_ITE>(['IOSNID_IOS','IOSNID_COS','IOSNID_PRO']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPEDCAB_OS_ITE;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPEDCAB_OS_ITE;
            aspedcab_os_ite[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspedcab_os_ite.IOSNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspedcab_os_ite.IOSNPAGLIM = Number(limit);
    }

    const result = await as_cabiosService.as_get(token as string, aspedcab_os_ite as ASPEDCAB_OS_ITE);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspedcab_os_ite = req.body as ASPEDCAB_OS_ITE;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspedcab_os_ite) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Order's OS item(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_cabiosService.as_Create(token, aspedcab_os_ite);
    
    return res.status(StatusCodes.CREATED).json({ message: `Order's OS item(s) created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPEDCAB_OS_ITE>(['IOSNID_IOS','IOSNID_COS','IOSNID_PRO']);

    const whereConditions: Partial<Record<keyof ASPEDCAB_OS_ITE, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCAB_OS_ITE;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPEDCAB_OS_ITE, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPEDCAB_OS_ITE;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_cabiosService.as_Update(token, updateData as Partial<ASPEDCAB_OS_ITE>, whereConditions as Partial<ASPEDCAB_OS_ITE>);

    return res.status(StatusCodes.OK).json({ message: `Order's OS item(s) updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspedcab_os_ite: Partial<Record<keyof ASPEDCAB_OS_ITE, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPEDCAB_OS_ITE>(['IOSNID_IOS','IOSNID_COS','IOSNID_PRO']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPEDCAB_OS_ITE;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspedcab_os_ite[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspedcab_os_ite).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_cabiosService.as_Delete(token as string, aspedcab_os_ite as ASPEDCAB_OS_ITE);

    return res.status(StatusCodes.OK).json({ message: `Order's OS item(s) deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}