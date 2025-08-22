import { as_mssql } from "@root/models";
import { ASCEPMUN } from "@root/interfaces";


class as_munService {
    
    async as_get(token: string, ascepmun: ASCEPMUN = {} as ASCEPMUN) {
        const { MUNNPAGNUM = 1, MUNNPAGLIM = 50 } = ascepmun;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASCEPMUN>(['MUNNPAGNUM', 'MUNNPAGLIM']);

        for (const key in ascepmun) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASCEPMUN)) continue;

            if (ascepmun.hasOwnProperty(key) && ascepmun[key as keyof ASCEPMUN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH MUN AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY MUNNID_MUN) AS FLOAT) / @MUNNPAGLIM) AS MUNNPAGNUM,
                       * 
                FROM AS_CAD..ASCEPMUN WITH (NOLOCK)
            )
            SELECT * FROM MUN WHERE MUNNPAGNUM = @MUNNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASCEPMUN WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...ascepmun, MUNNPAGNUM, MUNNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, ascepmun: Partial<ASCEPMUN>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASCEPMUN>(['MUNNID_MUN','MUNCUSUCAD', 'MUNDDATCAD','MUNCUSUALT', 'MUNDDATALT']);

        for (let key in ascepmun) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASCEPMUN)) continue;

            if (ascepmun[key as keyof ASCEPMUN] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = ascepmun[key as keyof ASCEPMUN]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASCEPMUN (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, ascepmun: Partial<ASCEPMUN>, whereConditions: Partial<ASCEPMUN>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASCEPMUN>(['MUNNID_MUN','MUNCUSUCAD', 'MUNDDATCAD','MUNCUSUALT', 'MUNDDATALT']);
        
        for (const [key, value] of Object.entries(ascepmun)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASCEPMUN) && value !== undefined) {
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
            UPDATE AS_CAD..ASCEPMUN
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...ascepmun, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, ascepmun: Partial<ASCEPMUN>) {
        let conditions: string[] = [];
    
        for (const key in ascepmun) {
            if (ascepmun.hasOwnProperty(key) && ascepmun[key as keyof ASCEPMUN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASCEPMUN ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...ascepmun }, token });
    }
    
    
}

export default new as_munService()