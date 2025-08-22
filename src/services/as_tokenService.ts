import {as_mssql} from '@root/models';
import { TokenBody } from '@root/interfaces';
import { as_Date } from '@root/utils';
import * as dotenv from 'dotenv';
import {as_tokenUtils} from '@root/utils';
dotenv.config({ path: 'src/.env' });

class as_TokenService {

    async as_getUser (token: string)  {
        /*
        const prvcsqlstr = `
                SELECT * FROM AS_CAD..ASARTAPI API WITH (NOLOCK) 
                    LEFT JOIN AS_CAD..ASENTAPI APT WITH (NOLOCK) ON APT.APTCUIDAPT = API.APICUIDAPT
                    LEFT JOIN AS_CAD..ASENTENT ENT WITH (NOLOCK) ON ENT.ENTNID_ENT = APT.APTNID_ENT
                WHERE APICACCTKN = '${token}'
            `
         */


         const prvcsqlstr = `
            SELECT * FROM AS_API..ASARTAPI API WITH (NOLOCK) 
                LEFT JOIN AS_API..ASENTAPI APT WITH (NOLOCK) ON APT.APTCUIDAPT = API.APICUIDAPT
            WHERE APICACCTKN = '${token}'
        `
                
        
        const user = await as_mssql.Assqlexec(prvcsqlstr)
        if (user.recordset.length > 0) {
            const cred = as_tokenUtils.as_JwtToken_decrypt(user.recordset[0].APIC_TOKEN)    
            user.recordset[0].APINID_USU = cred.id
            user.recordset[0].APICUSUNOM = cred.username
            user.recordset[0].APIC_SENHA = cred.password
        }
        
        // console.log("user", user);
        return user
            
    }

    async as_getClient (body: Partial<TokenBody>)  {
          
            const SQLstr = `
                 SELECT * FROM AS_CAD..ASENTENT WITH (NOLOCK) WHERE ENTCCODCPF = @APICCODCPF
            `
            const params = {APICCODCPF: body.APICCODCPF}
            const retult = await as_mssql.Assqlexec_server(SQLstr, params)
           
            return retult.recordset[0];
    }

    async as_saveToken(body: TokenBody): Promise<void> {

        //const prvoentcli = await this.as_getClient({APICCODCPF: '049994478000173'})
        const query = `
            Declare @DDATTKN DATETIME = GETDATE()
            Declare @CUIDAPT CHAR(36) = (
                                            SELECT APTCUIDAPT FROM AS_API..ASENTAPI WITH (NOLOCK) 
                                            WHERE cast(APTCCODCPF as bigint) = cast(@APICCODCPF as bigint)
                                        )
            /*
            Declare @CUIDAPI CHAR(36) = (
                SELECT APICUIDAPI FROM AS_API..ASARTAPI WITH (NOLOCK)
                 WHERE APICUIDAPT = @CUIDAPT
                   AND APINID_USU = @APINID_USU
                   AND APICUIDAPI = @APICUIDAPI    
            --&&   AND DATEADD(SECOND, APINEXPDAT, APIDDATTKN) <= GETDATE()
            )
            */

            Declare @CUIDAPI CHAR(36) = @APICUIDAPI

            IF @CUIDAPI IS NULL
            BEGIN
                    INSERT INTO AS_API..ASARTAPI (  APICUIDAPT,  APINID_USU,  APICUSUNOM, APIC_TOKEN  , 
                                                    APICACCTKN,  APICRFSTKN,  APINEXPDAT,  APIDDATTKN               )
                                          VALUES (    @CUIDAPT, @APINID_USU, @APICUSUNOM, @APIC_TOKEN  , 
                                                   @APICACCTKN, @APICRFSTKN, @APINEXPDAT,    @DDATTKN               )
            END
            ELSE
            BEGIN
                UPDATE AS_API..ASARTAPI SET APICACCTKN = @APICACCTKN
                                        ,   APICRFSTKN = @APICRFSTKN
                                        ,   APINEXPDAT = @APINEXPDAT
                                        ,   APIC_TOKEN = @APIC_TOKEN
                                        ,   APIDDATTKN =    @DDATTKN
                                      WHERE APICUIDAPI =    @CUIDAPI
            END
       
            DELETE FROM AS_API..ASARTAPI WHERE DATEADD(SECOND, APINEXPDAT, APIDDATTKN) <= GETDATE() - ${process.env.REFRESH_TOKEN_EXPIRES_IN}
            `;

        const params = {
                    APICUIDAPI: body.APICUIDAPI,
                    APICCODCPF: body.APICCODCPF,
                    APINID_USU: body.APINID_USU,
                    APICUSUNOM: body.APICUSUNOM,
                    APIC_SENHA: body.APIC_SENHA,
                    APIC_TOKEN: as_tokenUtils.as_JwtToken_encrypt({id: body.APINID_USU, username: body.APICUSUNOM, password: body.APIC_SENHA}),
                    APICACCTKN: body.APICACCTKN,
                    APICRFSTKN: body.APICRFSTKN,
                    APINEXPDAT: body.APINEXPDAT,
                };

        // console.log(params)
        // console.log(query)
        try {
            await as_mssql.Assqlexec(query, {params});
            console.log(new as_Date().toISOString(),'- Token successfully saved to the database');
        } catch (error) {
            // console.error(new as_Date().toISOString(),'- Failed to save token: ', error);
            throw error;
        }
    }
}

export default new as_TokenService();
