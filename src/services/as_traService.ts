import { as_mssql } from "@root/models";
import { ASENTTRA } from "@root/interfaces";

class as_traService {
    
    async as_get(token: string, asenttra: ASENTTRA = {} as ASENTTRA) {
        const { TRANPAGNUM = 1, TRANPAGLIM = 50 } = asenttra;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTTRA>(['TRANPAGNUM', 'TRANPAGLIM']);

        for (const key in asenttra) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTTRA)) continue;

            if (asenttra.hasOwnProperty(key) && asenttra[key as keyof ASENTTRA] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH TRA AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY TRANID_ENT) AS FLOAT) / @TRANPAGLIM) AS TRANPAGNUM,
                       * 
                FROM AS_CAD..ASENTTRA WITH (NOLOCK)
            )
            SELECT * FROM TRA WHERE TRANPAGNUM = @TRANPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTTRA WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asenttra, TRANPAGNUM, TRANPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asenttra: Partial<ASENTTRA>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTTRA>(['TRACUSUCAD', 'TRADDATCAD', 'TRACUSUALT', 'TRADDATALT']);

        for (let key in asenttra) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTTRA)) continue;

            if (asenttra[key as keyof ASENTTRA] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asenttra[key as keyof ASENTTRA]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTTRA (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asenttra: Partial<ASENTTRA>, whereConditions: Partial<ASENTTRA>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTTRA>(['TRACUSUCAD', 'TRADDATCAD', 'TRACUSUALT', 'TRADDATALT']);
        
        for (const [key, value] of Object.entries(asenttra)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTTRA) && value !== undefined) {
                updateFields.push(`${key} = @${key}`);
            }
        }
    
        for (const [key, value] of Object.entries(whereConditions)) {
            if (value !== undefined) {
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
            UPDATE AS_CAD..ASENTTRA
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asenttra, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asenttra: Partial<ASENTTRA>) {
        let conditions: string[] = [];
    
        for (const key in asenttra) {
            if (asenttra.hasOwnProperty(key) && asenttra[key as keyof ASENTTRA] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTTRA ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asenttra }, token });
    }
    
    
}

export default new as_traService()