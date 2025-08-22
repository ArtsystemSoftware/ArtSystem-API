import { NextFunction, Request, Response } from "express"
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { as_api_entServices } from "@root/services";
import { ASENTAPI } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse, as_tokenUtils } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit, APTCUIDAPT } = req.query;

    let asentapi: Partial<Record<keyof ASENTAPI, string | number>> = {};

    const allowedFields = new Set<keyof ASENTAPI>(['APTCUIDAPT','APTCCODCPF']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASENTAPI;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASENTAPI;
            asentapi[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asentapi.APTNPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        asentapi.APTNPAGLIM = Number(limit);
    }

    // if (!APTCUIDAPT && typeof APTCUIDAPT !== 'string') {
    //     return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("APTCUIDAPT is required", StatusCodes.BAD_REQUEST));
    // }

    let result = await as_api_entServices.as_get(asentapi as ASENTAPI) ;

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asentapi = req.body as ASENTAPI & {user: {username: string; password: string;}};

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asentapi) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Client Access data was not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asentapi.user) {
       return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Client Access data is missing default user {username, password}",StatusCodes.BAD_REQUEST)); 
    }

    if (!asentapi.user.username) {
       return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Client Access data is missing the username on user {username, password}",StatusCodes.BAD_REQUEST)); 
    }
    
    if (!asentapi.user.password) {
       return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Client Access data is missing the password on user {username, password}",StatusCodes.BAD_REQUEST)); 
    }

    asentapi.APTC_TOKEN = as_tokenUtils.as_JwtToken_encrypt(asentapi.user)
    
    await as_api_entServices.as_Create(asentapi);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Client Access created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASENTAPI>(['APTCUIDAPT', 'APTCCODCPF']);

    const whereConditions: Partial<Record<keyof ASENTAPI, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASENTAPI;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASENTAPI, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASENTAPI;

        if (key.toLowerCase() === 'user') {
            const user = value as {username: string; password: string}

            if (!user.username) {
                return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`missing property username on user {}`, StatusCodes.BAD_REQUEST));        
            }
            
            if (!user.password) {
                return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`missing property password on user {}`, StatusCodes.BAD_REQUEST));        
            }

            updateData['APTC_TOKEN'] = as_tokenUtils.as_JwtToken_encrypt(user)
        }

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_api_entServices.as_Update(updateData as Partial<ASENTAPI>, whereConditions as Partial<ASENTAPI>);

    return res.status(StatusCodes.OK).json({ message: 'Client Access updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asentapi: Partial<Record<keyof ASENTAPI, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASENTAPI>(['APTCUIDAPT', 'APTCCODCPF']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASENTAPI;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asentapi[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asentapi).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_api_entServices.as_Delete(asentapi as ASENTAPI);

    return res.status(StatusCodes.OK).json({ message: 'Client Access deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}