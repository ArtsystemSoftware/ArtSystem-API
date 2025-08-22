import { as_mssql } from "@root/models";
import { ASENTAPI } from "@root/interfaces";
import as_tokenService from "./as_tokenService";


class as_api_enttService {
    
    async as_get(asentapi: ASENTAPI = {} as ASENTAPI) {
        const { APTNPAGNUM = 1, APTNPAGLIM = 50 } = asentapi;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTAPI>(['APTNPAGNUM', 'APTNPAGLIM']);

        for (const key in asentapi) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTAPI)) continue;

            if (asentapi.hasOwnProperty(key) && asentapi[key as keyof ASENTAPI] !== undefined) {
                conditions.push(`${key} = @${key}`);
                
                if (key === 'APTCCODCPF') {
                    asentapi[key] = String(asentapi[key as keyof ASENTAPI]).trim().padStart(15, '0'); 
                }

            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        prvcsqlstr = `SELECT * FROM AS_API..ASENTAPI WITH (NOLOCK) ${prvcsqlwhr}`
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentapi, APTNPAGNUM, APTNPAGLIM } });
    
        return reference?.recordset;
    }
    
    async as_Create(asentapi: Partial<ASENTAPI>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTAPI | 'USER'> (['APTCUSUCAD','APTDDATCAD','APTCUSUALT','APTDDATALT','USER']);
        
        const client = await as_tokenService.as_getClient({APICCODCPF: asentapi.APTCCODCPF})
        
        asentapi.APTNID_ENT = 0
        if (client?.ENTNID_ENT > 0) {
            asentapi.APTNID_ENT = client.ENTNID_ENT
        }

        for (let key in asentapi) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTAPI)) continue;

            if (asentapi[key as keyof ASENTAPI] !== undefined) {  
                
                columns.push(key);               
                values.push(`@${key}`);          
                
                if (key === 'APTCCODCPF') {
                    asentapi[key] = String(asentapi[key as keyof ASENTAPI]).trim().padStart(15, '0'); 
                }

                params[key] = asentapi[key as keyof ASENTAPI]; 
            }

            
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_API..ASENTAPI (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        // console.log(prvcsqlstr, params)
        await as_mssql.Assqlexec(prvcsqlstr, { params });
    }

    async as_Update(asentapi: Partial<ASENTAPI>, whereConditions: Partial<ASENTAPI>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTAPI>(['APTCUIDAPT','APTNID_ENT','APTCUSUCAD','APTDDATCAD','APTCUSUALT','APTDDATALT']);
        
        for (const [key, value] of Object.entries(asentapi)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTAPI) && value !== undefined) {
                updateFields.push(`${key} = @${key}`);
                
                if (key === 'APTCCODCPF') {
                    asentapi[key] = String(asentapi[key as keyof ASENTAPI]).trim().padStart(15, '0'); 
                }
            }
        }
    
        for (const [key, value] of Object.entries(whereConditions)) {
            if (value !== undefined) {
                
                if (key === 'APTCCODCPF') {
                    whereConditions[key] = String(whereConditions[key as keyof ASENTAPI]).trim().padStart(15, '0'); 
                }
                
                whereFields.push(`${key} = @${key}`);
            }
        }
    
        if (updateFields.length === 0) {
            throw new Error("No fields provided for update.");
        }
        if (whereFields.length === 0) {
            throw new Error("No conditions provided for the WHERE clause.");
        }
    
        const setClause = updateFields.join(", ");
        const whereClause = whereFields.join(" AND ");
    
        const prvcsqlstr = `
            UPDATE AS_API..ASENTAPI
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentapi, ...whereConditions };
        // console.log(whereConditions)
    
        await as_mssql.Assqlexec(prvcsqlstr, { params });
    }
    
    async as_Delete(asentapi: Partial<ASENTAPI>) {
        let conditions: string[] = [];
    
        for (const key in asentapi) {
            if (asentapi.hasOwnProperty(key) && asentapi[key as keyof ASENTAPI] !== undefined) {
                conditions.push(`${key} = @${key}`);
                if (key === 'APTCCODCPF') {
                    asentapi[key] = String(asentapi[key as keyof ASENTAPI]).trim().padStart(15, '0'); 
                }
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_API..ASENTAPI ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentapi } });
    }
    
    
}

export default new as_api_enttService()