import { NextFunction, Request, Response } from "express"
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { as_asyncErrorHandler } from "@root/middleware";
import { as_api_proimgService } from "@root/services";
import { as_ErrorResponse } from "@root/utils";
import { as_fetchImage } from "@root/integrations";
import { ASAPIPRO_IMG } from "@root/interfaces";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const { page, limit, PIMCCODEAN } = req.query;

    let asapipro_img: Partial<Record<keyof ASAPIPRO_IMG, string | number>> = {};

    const allowedFields = new Set<keyof ASAPIPRO_IMG>(['PIMCCODEAN','PIMCORIGEM']);

    for (const [key, value] of Object.entries(req.query)) {
        const lowerKey = key.toUpperCase() as keyof ASAPIPRO_IMG;

        if (allowedFields.has(lowerKey) && typeof value === 'string') {
            const originalKey = lowerKey.toUpperCase() as keyof ASAPIPRO_IMG;
            asapipro_img[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (page && !isNaN(Number(page))) {
        asapipro_img.PIMNPAGNUM = Number(page);
    }
    
    if (limit && !isNaN(Number(limit))) {
        asapipro_img.PIMNPAGLIM = Number(limit);
    }

    if (!PIMCCODEAN && typeof PIMCCODEAN !== 'string') {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("PIMCCODEAN is required", StatusCodes.BAD_REQUEST));
    }

    await as_api_proimgService.as_Clean();
    
    let result = await as_api_proimgService.as_get(asapipro_img as ASAPIPRO_IMG) ;

    if (!result || result.length === 0) {
       
        const img = await  as_fetchImage(PIMCCODEAN as string);

        // console.log(img)
        if (img.statusCode === StatusCodes.TOO_MANY_REQUESTS) {
            return res.status(StatusCodes.TOO_MANY_REQUESTS).json(new as_ErrorResponse(getReasonPhrase(StatusCodes.TOO_MANY_REQUESTS), StatusCodes.TOO_MANY_REQUESTS));
        }
        
        const asapipro_img: ASAPIPRO_IMG = {
            PIMCCODEAN: PIMCCODEAN as string,
            PIMCORIGEM: img.origin,
            PIMCURLIMG: img.url 
        };
        
        await as_api_proimgService.as_Create(asapipro_img);

        if (img.statusCode === StatusCodes.NOT_FOUND) {
            return res.status(StatusCodes.NOT_FOUND).json(new as_ErrorResponse("No product image found", StatusCodes.NOT_FOUND));
        }
        
        result = await as_api_proimgService.as_get(asapipro_img as ASAPIPRO_IMG) ;
    }

    if (!result[0].PIMCURLIMG) {
        return res.status(StatusCodes.NOT_FOUND).json(new as_ErrorResponse("No product image found", StatusCodes.NOT_FOUND));
    }

    return res.status(StatusCodes.OK).json(result);
});

const as_create = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];  
    const asapipro_img = req.body as ASAPIPRO_IMG;

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the token not provided",StatusCodes.BAD_REQUEST));
    }

    if (!asapipro_img) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("the product image data was not provided",StatusCodes.BAD_REQUEST));
    }

    await as_api_proimgService.as_Create(asapipro_img);
    
    return res.status(StatusCodes.CREATED).json({ message: 'product image created successfully' });
});

const as_update = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    const allowedWhereFields = new Set<keyof ASAPIPRO_IMG>(['PIMCCODEAN','PIMCORIGEM']);

    const whereConditions: Partial<Record<keyof ASAPIPRO_IMG, string | number>> = {};
    
    for (const [key, value] of Object.entries(req.query)) {
        const originalKey = key.toUpperCase() as keyof ASAPIPRO_IMG;
        
        if (allowedWhereFields.has(originalKey) && value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                whereConditions[originalKey] = !isNaN(Number(value)) ? Number(value) : value;
            }
        }
    }
    
    if (Object.keys(whereConditions).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    const updateData: Partial<Record<keyof ASAPIPRO_IMG, string | number>> = {};

    for (const [key, value] of Object.entries(req.body)) {
        const originalKey = key.toUpperCase() as keyof ASAPIPRO_IMG;

        if (value !== undefined) {
            if (typeof value === 'string' || typeof value === 'number') {
                updateData[originalKey] = !isNaN(Number(value)) ? Number(value) : (value as string | undefined);
            }
        }
    }
    
    if (Object.keys(updateData).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`No valid fields provided for update`, StatusCodes.BAD_REQUEST));
    }

    await as_api_proimgService.as_Update(updateData as Partial<ASAPIPRO_IMG>, whereConditions as Partial<ASAPIPRO_IMG>);

    return res.status(StatusCodes.OK).json({ message: 'product image updated successfully' });
});

const as_delete = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED).json(new as_ErrorResponse("Token not provided", StatusCodes.BAD_REQUEST));
    }

    let asapipro_img: Partial<Record<keyof ASAPIPRO_IMG, string | number>> = {};

    const allowedWhereFields = new Set<keyof ASAPIPRO_IMG>(['PIMCCODEAN', 'PIMCORIGEM']);

    for (const [key, value] of Object.entries(req.query)) {
        const upperKey = key.toUpperCase() as keyof ASAPIPRO_IMG;
        
        if (allowedWhereFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            asapipro_img[upperKey] = !isNaN(Number(value)) ? Number(value) : value;
        }
    }

    if (Object.keys(asapipro_img).length === 0) {
        return res.status(StatusCodes.BAD_REQUEST).json(new as_ErrorResponse(`At least one of the {${Array.from(allowedWhereFields).join(", ")}} valid parameters must be provided in parameters`, StatusCodes.BAD_REQUEST));
    }

    await as_api_proimgService.as_Delete(asapipro_img as ASAPIPRO_IMG);

    return res.status(StatusCodes.OK).json({ message: 'product image deleted successfully' });
});

export default {as_get, as_create, as_update, as_delete}