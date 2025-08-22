import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_edrService } from "@root/services";
import { ASENTEDR } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asentedr: Partial<Record<keyof ASENTEDR, string | number>> = {};

    const allowedFields = new Set<keyof ASENTEDR>(['EDRNID_EDR','EDRNID_ENT','EDRCTIPENT','EDRNID_CEP','EDRCSTATUS']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASENTEDR;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASENTEDR;
            asentedr[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asentedr.EDRNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asentedr.EDRNPAGLIM = Number(limit);
    }

    const result = await as_edrService.as_get(token as string, asentedr as ASENTEDR);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asentedr = req.body as ASENTEDR;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asentedr) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Address data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_edrService.as_Create(token, asentedr);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Address created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASENTEDR>(['EDRNID_EDR','EDRNID_ENT','EDRCTIPENT','EDRNID_CEP','EDRCSTATUS']);

    const whereConditions: Partial<Record<keyof ASENTEDR, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASENTEDR;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASENTEDR, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASENTEDR;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_edrService.as_Update(token, updateData as Partial<ASENTEDR>, whereConditions as Partial<ASENTEDR>);

    return res.status(StatusCodes.OK).json({ message: 'Address updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asentedr: Partial<Record<keyof ASENTEDR, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASENTEDR>(['EDRNID_EDR','EDRNID_ENT','EDRCTIPENT','EDRNID_CEP','EDRCSTATUS']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASENTEDR;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asentedr[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asentedr).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_edrService.as_Delete(token as string, asentedr as ASENTEDR);

    return res.status(StatusCodes.OK).json({ message: 'Address deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}