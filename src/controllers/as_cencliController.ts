import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_cencliService } from "@root/services";
import { ASENTCEN_CLI } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asentcen_cli: Partial<Record<keyof ASENTCEN_CLI, string | number>> = {};

    const allowedFields = new Set<keyof ASENTCEN_CLI>(['CCLNID_CCL','CCLNID_CLI','CCLNID_CNC']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASENTCEN_CLI;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASENTCEN_CLI;
            asentcen_cli[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asentcen_cli.CCLNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asentcen_cli.CCLNPAGLIM = Number(limit);
    }

    const result = await as_cencliService.as_get(token as string, asentcen_cli as ASENTCEN_CLI);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asentcen_cli = req.body as ASENTCEN_CLI;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asentcen_cli) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Client Commission data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_cencliService.as_Create(token, asentcen_cli);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Client Commission created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASENTCEN_CLI>(['CCLNID_CCL','CCLNID_CLI','CCLNID_CNC']);

    const whereConditions: Partial<Record<keyof ASENTCEN_CLI, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASENTCEN_CLI;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASENTCEN_CLI, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASENTCEN_CLI;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_cencliService.as_Update(token, updateData as Partial<ASENTCEN_CLI>, whereConditions as Partial<ASENTCEN_CLI>);

    return res.status(StatusCodes.OK).json({ message: 'Client Commission updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asentcen_cli: Partial<Record<keyof ASENTCEN_CLI, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASENTCEN_CLI>(['CCLNID_CCL','CCLNID_CLI','CCLNID_CNC']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASENTCEN_CLI;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asentcen_cli[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asentcen_cli).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_cencliService.as_Delete(token as string, asentcen_cli as ASENTCEN_CLI);

    return res.status(StatusCodes.OK).json({ message: 'Client Commission deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}