import { as_mssql } from "@root/models";
import { ASPEDITE_OBS } from "@root/interfaces";

class as_iteassService {
    
    async as_get(token: string, aspedite_obs: ASPEDITE_OBS = {} as ASPEDITE_OBS) {
        const { IOBNPAGNUM = 1, IOBNPAGLIM = 50 } = aspedite_obs;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDITE_OBS>(['IOBNPAGNUM', 'IOBNPAGLIM']);

        for (const key in aspedite_obs) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_OBS)) continue;

            if (aspedite_obs.hasOwnProperty(key) && aspedite_obs[key as keyof ASPEDITE_OBS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH IOB AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY IOBNID_IOB) AS FLOAT) / @IOBNPAGLIM) AS IOBNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDITE_OBS WITH (NOLOCK)
            )
            SELECT * FROM IOB WHERE IOBNPAGNUM = @IOBNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDITE_OBS WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_obs, IOBNPAGNUM, IOBNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedite_obs: Partial<ASPEDITE_OBS>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDITE_OBS>(['IOBNID_IOB','IOBCUSUCAD', 'IOBDDATCAD', 'IOBCUSUALT', 'IOBDDATALT']);

        for (let key in aspedite_obs) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_OBS)) continue;

            if (aspedite_obs[key as keyof ASPEDITE_OBS] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedite_obs[key as keyof ASPEDITE_OBS]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDITE_OBS (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedite_obs: Partial<ASPEDITE_OBS>, whereConditions: Partial<ASPEDITE_OBS>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDITE_OBS>(['IOBNID_IOB','IOBCUSUCAD', 'IOBDDATCAD', 'IOBCUSUALT', 'IOBDDATALT']);
        
        for (const [key, value] of Object.entries(aspedite_obs)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_OBS) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDITE_OBS
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedite_obs, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedite_obs: Partial<ASPEDITE_OBS>) {
        let conditions: string[] = [];
    
        for (const key in aspedite_obs) {
            if (aspedite_obs.hasOwnProperty(key) && aspedite_obs[key as keyof ASPEDITE_OBS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDITE_OBS ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_obs }, token });
    }
    
    
}
export default new as_iteassService()