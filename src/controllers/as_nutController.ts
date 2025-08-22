import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_nutService } from "@root/services";
import { ASPRONUT } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let aspronut: Partial<Record<keyof ASPRONUT, string | number>> = {};

    const allowedFields = new Set<keyof ASPRONUT>(['NUTNID_NUT','NUTNID_PRO','NUTNID_LOJ']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPRONUT;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPRONUT;
            aspronut[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspronut.NUTNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspronut.NUTNPAGLIM = Number(limit);
    }

    const result = await as_nutService.as_get(token as string, aspronut as ASPRONUT);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspronut = req.body as ASPRONUT;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspronut) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Nutrition information data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_nutService.as_Create(token, aspronut);
    
    return res.status(StatusCodes.CREATED).json({ message: `Nutrition information created successfully` });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPRONUT>(['NUTNID_NUT','NUTNID_PRO','NUTNID_LOJ']);

    const whereConditions: Partial<Record<keyof ASPRONUT, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPRONUT;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPRONUT, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPRONUT;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_nutService.as_Update(token, updateData as Partial<ASPRONUT>, whereConditions as Partial<ASPRONUT>);

    return res.status(StatusCodes.OK).json({ message: `Nutrition information updated successfully` });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspronut: Partial<Record<keyof ASPRONUT, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPRONUT>(['NUTNID_NUT', 'NUTNID_PRO','NUTNID_LOJ']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPRONUT;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspronut[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspronut).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_nutService.as_Delete(token as string, aspronut as ASPRONUT);

    return res.status(StatusCodes.OK).json({ message: `Nutrition information deleted successfully` });
});

export default {as_get, as_create, as_update, as_delete}