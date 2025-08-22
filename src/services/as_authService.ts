import {as_mssql} from '@root/models';
import { as_tokenUtils } from '@root/utils';

interface as_AuthBody {
    username: string;
    password: string;
    cpf_cnpj: string;
}

interface as_UserRecord {
    ENTNID_ENT: number;
    USUNID_ENT: number;
    ENTCAPELID: string;
    USUC_SENHA: string;
}

class as_AuthService {

    async as_authenticateEmail(body: as_AuthBody): Promise<as_UserRecord | null> {

        let query = `
            SELECT * FROM AS_API..ASENTAPI WITH (NOLOCK) WHERE cast(APTCCODCPF as bigint) = cast('${body.cpf_cnpj}' as bigint)
        `
        
        let result = await as_mssql.Assqlexec(query)

        if (result.recordset.length === 0) {
            return null
        }
        
        const user = as_tokenUtils.as_JwtToken_decrypt(result.recordset[0].APTC_TOKEN)

        query = `
            DECLARE @CE_MAIL VARCHAR(100) = @email;
            DECLARE @C_SENHA VARCHAR(20) = @password;

            SELECT * FROM AS_CAD..ASENTENT ENT WITH (NOLOCK) 
                LEFT JOIN AS_CAD..ASENTUSU USU WITH (NOLOCK) ON USU.USUNID_ENT = ENT.ENTNID_ENT
            WHERE ENT.ENTCE_MAIL = @CE_MAIL
              AND USU.USUC_SENHA = @C_SENHA
              AND USU.USUN_ATIVO = 1
        `;

         result = await as_mssql.Assqlexec(query,  {
                                                                params: { 
                                                                        email: body.username.trim(),
                                                                        password: body.password.trim()
                                                                    } , 
                                                                user: {
                                                                        cpf_cnpj: body.cpf_cnpj,
                                                                        username: user.username,
                                                                        password: user.password,
                                                                    }
                                                                });

                                                                      
        if (result.recordset && result.recordset.length === 1) {
            return result.recordset[0] as as_UserRecord;
        }

        return null
    }
    async as_authenticate(body: as_AuthBody): Promise<as_UserRecord | null> {

        const query = `
            DECLARE @CAPELID VARCHAR(25) = @username;
            DECLARE @C_SENHA VARCHAR(20) = @password;

            SELECT * FROM AS_CAD..ASENTENT ENT WITH (NOLOCK) 
                LEFT JOIN AS_CAD..ASENTUSU USU WITH (NOLOCK) ON USU.USUNID_ENT = ENT.ENTNID_ENT
            WHERE ENT.ENTCAPELID = @CAPELID
              AND USU.USUC_SENHA = @C_SENHA
              AND USU.USUN_ATIVO = 1
        `;

        
        try {
            const result = await as_mssql.Assqlexec(query,  {
                                                                params: { 
                                                                        username: body.username.trim(),
                                                                        password: body.password.trim()
                                                                    } , 
                                                                user: {
                                                                        cpf_cnpj: body.cpf_cnpj,
                                                                        username: body.username,
                                                                        password: body.password,
                                                                    }
                                                                });
                                                                    
            if (result.recordset && result.recordset.length === 1) {
                return result.recordset[0] as as_UserRecord;
            }

            return null;
        } catch (error) {
            // console.error('Authentication failed:', error);
            // throw new Error('Authentication error');
            throw error;
        }
    }
}

export default new as_AuthService();
