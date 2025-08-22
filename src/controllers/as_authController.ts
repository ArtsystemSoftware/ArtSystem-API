import {as_authService, as_refreshService, as_tokenService} from '@root/services';
import { as_ErrorResponse, as_tokenUtils, as_Date, as_validateFields } from '@root/utils';
import { StatusCodes} from 'http-status-codes'
import { NextFunction, Request, Response } from 'express';
import { as_asyncErrorHandler } from "@root/middleware";
import * as dotenv from 'dotenv';
dotenv.config({ path: 'src/.env' });

const as_validateToken = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    const {grant_type} = req.body
    let errorResponse = {} as as_ErrorResponse;

    if (!grant_type) {
        errorResponse = new as_ErrorResponse("The grant_type property is missing",StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }

    if (grant_type === "refresh_token") {
        await as_refreshToken(req, res, next);
        }
    else if (grant_type === "password") {
        await as_getToken(req, res, next);
    } else {
        errorResponse = new as_ErrorResponse("The invalid grant_type [password, refresh_token]",StatusCodes.BAD_REQUEST)
        return res.status(StatusCodes.BAD_REQUEST).json(errorResponse);
    }


});

const as_refreshToken = as_asyncErrorHandler(async(req: Request, res: Response, next: NextFunction) => {

    const { origin, cpf_cnpj, refresh_token, grant_type } = req.body;
    let errorResponse = {} as as_ErrorResponse | undefined;
    const requiredFields = ['origin', 'grant_type','refresh_token', 'cpf_cnpj'];

    errorResponse = as_validateFields(req.body, requiredFields)
    if (errorResponse) return res.status(errorResponse.statusCode).json(errorResponse); 


    const user = await as_refreshService.as_getUser(refresh_token)

    if (!user) {
        errorResponse = new as_ErrorResponse("Something went wrong while getting the user information",StatusCodes.UNAUTHORIZED)
        return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
    }

    if (user.recordset.length === 0) {
        errorResponse = new as_ErrorResponse("invalid refresh token",StatusCodes.UNAUTHORIZED)
        return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
    }

    
    req.body = {
        cpf_cnpj: cpf_cnpj,
        origin:   origin,
        user_uuid: user.recordset[0].APICUIDAPI,
        username: user.recordset[0].APICUSUNOM,
        password: user.recordset[0].APIC_SENHA.trim()
    }

    await as_getToken(req, res, next);
});

const as_getToken = as_asyncErrorHandler(async(req: Request, res: Response, next: NextFunction) => {
    const { username, password, cpf_cnpj, origin } = req.body;
    let errorResponse = {} as as_ErrorResponse | undefined;
    const requiredFields = ['origin', 'username', 'password', 'cpf_cnpj'];

    errorResponse = as_validateFields(req.body, requiredFields)
    if (errorResponse) return res.status(errorResponse.statusCode).json(errorResponse); // If validation fails, it already returns the error response

    let user;
    try {
        
        if ((username as string).search('@')>0) {
            user = await as_authService.as_authenticateEmail({username, password, cpf_cnpj});
        } else {
            user = await as_authService.as_authenticate({username, password, cpf_cnpj});
        }

    } catch (error) {
        errorResponse = new as_ErrorResponse('A database error occurred while saving the token.', StatusCodes.INTERNAL_SERVER_ERROR, (error as Error).message);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
    
    if (!user) {
        errorResponse = new as_ErrorResponse('The user informed does not exists or does not have access to the client server', StatusCodes.UNAUTHORIZED);
        return res.status(StatusCodes.UNAUTHORIZED).json(errorResponse);
    }
    
    const access_token = as_tokenUtils.as_generateLongToken()
    const refresh_token = as_tokenUtils.as_generateLongToken()

    const now = new as_Date();
    const responseJson = {
        token_type: "bearer",
        access_token,
        iat: Math.floor(now.getTime() / 1000),
        exp: Math.floor(now.getTime() / 1000) + Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        refresh_token,
    };
    
    const token = {
        APICUIDAPI: req.body.user_uuid || null,
        APICCODCPF: req.body.cpf_cnpj,
        APINID_USU: user.ENTNID_ENT,
        APICUSUNOM: user.ENTCAPELID.trim(),
        APIC_SENHA: user.USUC_SENHA.trim(),
        APICACCTKN: responseJson.access_token,
        APICRFSTKN: responseJson.refresh_token,
        APINEXPDAT: responseJson.exp - responseJson.iat,
    }
    
    try {
        await as_tokenService.as_saveToken(token);        
    } catch (error) {
       errorResponse = new as_ErrorResponse("A database error occurred while saving the token.", 
                                            StatusCodes.UNAUTHORIZED, 
                                            (error as Error).message);
       return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(errorResponse);
    }
    
    return res.status(StatusCodes.OK).json(responseJson)
});

export default {as_getToken, as_refreshToken, as_validateToken}