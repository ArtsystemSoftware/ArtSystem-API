import { as_ErrorResponse } from '@root/utils';
import { as_mssql }         from '@root/models';
import { as_tokenUtils }    from '@root/utils';

class as_refreshService {
    
    async as_getUser (refreshToken: string)  {
        /*
        const prvcsqlstr = `
                SELECT * FROM AS_CAD..ASARTAPI API WITH (NOLOCK) 
                    LEFT JOIN AS_CAD..ASENTAPI APT WITH (NOLOCK) ON APT.APTCUIDAPT = API.APICUIDAPT
                    LEFT JOIN AS_CAD..ASENTENT ENT WITH (NOLOCK) ON ENT.ENTNID_ENT = APT.APTNID_ENT
                WHERE APICRFSTKN = '${refreshToken}'
            `
        */
       
         const prvcsqlstr = `
            SELECT * FROM AS_API..ASARTAPI API WITH (NOLOCK) 
                LEFT JOIN AS_API..ASENTAPI APT WITH (NOLOCK) ON APT.APTCUIDAPT = API.APICUIDAPT
            WHERE APICRFSTKN = '${refreshToken}'
        `    
            
        const user = await as_mssql.Assqlexec(prvcsqlstr)

        
        if (user.recordset.length > 0) {
            const cred = as_tokenUtils.as_JwtToken_decrypt(user.recordset[0].APIC_TOKEN)    
            
            user.recordset[0].APINID_USU = cred.id
            user.recordset[0].APICUSUNOM = cred.username
            user.recordset[0].APIC_SENHA = cred.password
        }
        return user
            
    }
}
export default new as_refreshService()