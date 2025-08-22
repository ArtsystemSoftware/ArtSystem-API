import * as crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import {as_encryptUtils} from '@root/utils';
import * as dotenv from 'dotenv';
dotenv.config({ path: 'src/.env' });


const as_generateLongToken = () => {
    return crypto.randomBytes(64).toString('hex'); // 64 bytes gives a 128-character hex string
};
interface User {
    username: string;
    password: string;
    id: number
};

const as_JwtToken_encrypt = (user: any, expiresIn: SignOptions = {}) => {
    
    let token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET as string, expiresIn);
    // console.log(token)
    // console.log(jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string))
    
    token = as_encryptUtils.as_encrypt(token, process.env.ACCESS_TOKEN_SECRET as string);
    
    // const teste = as_encryptUtils.as_encrypt("teste", process.env.ACCESS_TOKEN_SECRET as string) 
    // console.log(teste)
    // console.log(as_encryptUtils.as_decrypt(teste, process.env.ACCESS_TOKEN_SECRET as string))
    return token
};
const as_JwtToken_decrypt = (token: string) : User => {
    let decryptToken = as_encryptUtils.as_decrypt(token, process.env.ACCESS_TOKEN_SECRET as string)

    
    return jwt.verify(decryptToken, process.env.ACCESS_TOKEN_SECRET as string) as User;
}
export default { as_JwtToken_encrypt, as_JwtToken_decrypt, as_generateLongToken };
