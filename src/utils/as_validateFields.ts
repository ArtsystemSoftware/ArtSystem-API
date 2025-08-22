import { as_ErrorResponse } from "@root/utils";
import { StatusCodes } from "http-status-codes";

const as_validateFields = (
    object: any,
    requiredFields: string[]
): as_ErrorResponse | undefined => {
    let errorResponse: as_ErrorResponse | undefined

    // console.log(object)
    for (const field of requiredFields) {
        if (!object[field]) {
            errorResponse = new as_ErrorResponse(`The ${field} property is missing`, StatusCodes.BAD_REQUEST);
            return errorResponse;
        }
    }
    return errorResponse;
};

export {as_validateFields}