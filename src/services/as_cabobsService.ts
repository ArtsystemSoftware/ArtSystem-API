import { as_mssql } from "@root/models";
import { ASPEDCAB_OBS } from "@root/interfaces";

class as_cabobsService {
    
    async as_get(token: string, aspedcab_obs: ASPEDCAB_OBS = {} as ASPEDCAB_OBS) {
        const { COBNPAGNUM = 1, COBNPAGLIM = 50 } = aspedcab_obs;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDCAB_OBS>(['COBNPAGNUM', 'COBNPAGLIM']);

        for (const key in aspedcab_obs) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_OBS)) continue;

            if (aspedcab_obs.hasOwnProperty(key) && aspedcab_obs[key as keyof ASPEDCAB_OBS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH COB AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY COBNID_COB) AS FLOAT) / @COBNPAGLIM) AS COBNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDCAB_OBS WITH (NOLOCK)
            )
            SELECT * FROM COB WHERE COBNPAGNUM = @COBNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDCAB_OBS WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_obs, COBNPAGNUM, COBNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedcab_obs: Partial<ASPEDCAB_OBS>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDCAB_OBS>(['COBNID_COB', 'COBCUSUCAD', 'COBDDATCAD', 'COBCUSUALT', 'COBDDATALT']);

        for (let key in aspedcab_obs) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_OBS)) continue;

            if (aspedcab_obs[key as keyof ASPEDCAB_OBS] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedcab_obs[key as keyof ASPEDCAB_OBS]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDCAB_OBS (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedcab_obs: Partial<ASPEDCAB_OBS>, whereConditions: Partial<ASPEDCAB_OBS>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDCAB_OBS>(['COBNID_COB','COBCUSUCAD', 'COBDDATCAD', 'COBCUSUALT', 'COBDDATALT']);
        
        for (const [key, value] of Object.entries(aspedcab_obs)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_OBS) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDCAB_OBS
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedcab_obs, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedcab_obs: Partial<ASPEDCAB_OBS>) {
        let conditions: string[] = [];
    
        for (const key in aspedcab_obs) {
            if (aspedcab_obs.hasOwnProperty(key) && aspedcab_obs[key as keyof ASPEDCAB_OBS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDCAB_OBS ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_obs }, token });
    }
    
    
}

export default new as_cabobsService()