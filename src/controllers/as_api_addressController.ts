import { NextFunction, Request, Response }  from "express"
import { getReasonPhrase, StatusCodes }     from "http-status-codes";
import { as_asyncErrorHandler }             from "@root/middleware";
import { as_viaCep }                        from "@root/integrations";
import { ViaCep }                           from "@root/interfaces"; 
import { as_ErrorResponse, as_validateFields }                from "@root/utils";

const as_get = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {

    let viacep: Partial<Record<keyof ViaCep, string | number>> = {};
    const allowedFields = new Set<keyof ViaCep>(['cep']);

    let errorResponse = {} as as_ErrorResponse | undefined;
        
    for (const [key, value] of Object.entries(req.query)) {
         const upperKey = key.toLowerCase() as keyof ViaCep;
        if (allowedFields.has(upperKey) && (typeof value === 'string' || typeof value === 'number')) {
            viacep[upperKey] = value //!isNaN(Number(value)) ? Number(value) : value;
        }
           
    }

    errorResponse = as_validateFields(viacep, [...allowedFields].map(field => field.toLowerCase()))
    if (errorResponse) return res.status(errorResponse.statusCode).json(errorResponse); 

    const response =    await as_viaCep(viacep.cep as string)

    return res.status(StatusCodes.OK).json(response);
    
})

export default {as_get}