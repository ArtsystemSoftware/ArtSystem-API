import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_clicarService } from "@root/services";
import { ASENTCLI_CAR } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    let asentcli_car: Partial<Record<keyof ASENTCLI_CAR, string | number>> = {};

    const allowedFields = new Set<keyof ASENTCLI_CAR>(['CARNID_CAR','CARNID_CLI','CARCCHASSI','CARCMARCAR','CARCMODCAR','CARCPLACAR','CARNANOCAR']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASENTCLI_CAR;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASENTCLI_CAR;
            asentcli_car[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asentcli_car.CARNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asentcli_car.CARNPAGLIM = Number(limit);
    }

    const result = await as_clicarService.as_get(token as string, asentcli_car as ASENTCLI_CAR);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asentcli_car = req.body as ASENTCLI_CAR;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asentcli_car) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Client Car data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_clicarService.as_Create(token, asentcli_car);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Client Car created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASENTCLI_CAR>(['CARNID_CAR','CARNID_CLI','CARCCHASSI','CARCMARCAR','CARCMODCAR','CARCPLACAR','CARNANOCAR']);

    const whereConditions: Partial<Record<keyof ASENTCLI_CAR, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASENTCLI_CAR;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASENTCLI_CAR, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASENTCLI_CAR;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_clicarService.as_Update(token, updateData as Partial<ASENTCLI_CAR>, whereConditions as Partial<ASENTCLI_CAR>);

    return res.status(StatusCodes.OK).json({ message: 'Client Car updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asentcli_car: Partial<Record<keyof ASENTCLI_CAR, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASENTCLI_CAR>(['CARNID_CAR','CARNID_CLI','CARCCHASSI','CARCMARCAR','CARCMODCAR','CARCPLACAR','CARNANOCAR']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASENTCLI_CAR;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asentcli_car[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asentcli_car).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_clicarService.as_Delete(token as string, asentcli_car as ASENTCLI_CAR);

    return res.status(StatusCodes.OK).json({ message: 'Client Car deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}