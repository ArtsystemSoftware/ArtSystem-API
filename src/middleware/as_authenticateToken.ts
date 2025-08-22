import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { as_asyncErrorHandler } from '@middleware/as_asyncErrorHandler'; 
import { as_encryptUtils, as_ErrorResponse, as_Date} from '@root/utils';
import { as_tokenService } from '@root/services';

const as_authenticateToken = as_asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
    
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; 

    if (!token) {
        throw new as_ErrorResponse("Authorization token is missing", StatusCodes.UNAUTHORIZED);
    }


    const user = await as_tokenService.as_getUser(token);

    if (!user || user.recordset.length === 0) {
        throw new as_ErrorResponse("Invalid token", StatusCodes.UNAUTHORIZED);
    }

    const now = new as_Date();
    
    const expDate = new Date(user.recordset[0].APIDDATTKN.getTime() + user.recordset[0].APINEXPDAT * 1000);

    if (expDate < now) {
        throw new as_ErrorResponse("Token has expired", StatusCodes.UNAUTHORIZED);
    }

    if (req.route.path === '/api-entity' && user.recordset[0].APTCCODCPF  !== '014405027000179') {
        throw new as_ErrorResponse("The user does not have access to this End-Point", StatusCodes.FORBIDDEN);
    }

    next();
   
});

/**
 * 
 * @param req 
 * @param res 
 * @param next 
 * @returns 
 * @deprecated - Function deprecated use as_authenticateToken
 */
const as_JwtauthenticateToken = (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    let token = authHeader && authHeader.split(' ')[1]; 
    if (token == null) return res.status(StatusCodes.UNAUTHORIZED).json({ message: 'No token provided' }); 
    
    
    token = as_encryptUtils.as_decrypt(token, process.env.ACCESS_TOKEN_SECRET as string)
    // console.log(token)
    
    // const buffer = Buffer.from(token, 'base64')
    // token = crypto.privateEncrypt(process.env.ACCESS_TOKEN_SECRET as string, buffer).toString('utf8');
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err, user) => {
        if (err) return res.status(StatusCodes.FORBIDDEN).json({ message: 'Invalid token' }); 
        
        req.body.user = user; 
        console.log(user)
        next(); 
    });
    

    res.status(404).json({error:"token inválido"})
};

export {as_authenticateToken};
