import { NextFunction, Request, Response } from "express"
import { StatusCodes } from "http-status-codes";
import { as_proService } from "@root/services";
import { ASPROPRO } from "@root/interfaces";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_ErrorResponse } from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit } = req.query;

    // console.log("page: ", page);
    // console.log("limit: ", limit);
    // const dcmguid = req.headers['x-dcmguid'];
    // const upSubno = req.headers['x-up-subno'];
    // const jphoneUid = req.headers['x-jphone-uid'];
    // const emUid = req.headers['x-em-uid'];

    // console.log({ dcmguid, upSubno, jphoneUid, emUid });
    
    let aspropro: Partial<Record<keyof ASPROPRO, string | number>> = {};

    const allowedFields = new Set<keyof ASPROPRO>(['PRONID_PRO','PRONPESADO','PROCCODPRO','PRONID_DEP','PROCDESCRI','PROCDESRES','PROCDESINT','PRONNAOVDA']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASPROPRO;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASPROPRO;
            aspropro[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        aspropro.PRONPAGNUM = Number(page);
    }
    if (limit && !isNaN(Number(limit))) {
        aspropro.PRONPAGLIM = Number(limit);
    }

    const result = await as_proService.as_get(token as string, aspropro as ASPROPRO);

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const aspropro = req.body as ASPROPRO;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!aspropro) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the Product(s) data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_proService.as_Create(token, aspropro);
    
    return res.status(StatusCodes.CREATED).json({ message: 'Product(s) created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASPROPRO>(['PRONID_PRO','PROCCODPRO','PRONID_DEP']);

    const whereConditions: Partial<Record<keyof ASPROPRO, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASPROPRO;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASPROPRO, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASPROPRO;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_proService.as_Update(token, updateData as Partial<ASPROPRO>, whereConditions as Partial<ASPROPRO>);

    return res.status(StatusCodes.OK).json({ message: 'Product(s) updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let aspropro: Partial<Record<keyof ASPROPRO, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASPROPRO>(['PRONID_PRO', 'PROCCODPRO','PRONID_DEP']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASPROPRO;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            aspropro[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(aspropro).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_proService.as_Delete(token as string, aspropro as ASPROPRO);

    return res.status(StatusCodes.OK).json({ message: 'Product(s) deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}