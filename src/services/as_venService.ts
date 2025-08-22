import { as_mssql } from "@root/models";
import { ASENTVEN } from "@root/interfaces";

class as_venService {
    
    async as_get(token: string, asentven: ASENTVEN = {} as ASENTVEN) {
        const { VENNPAGNUM = 1, VENNPAGLIM = 50 } = asentven;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTVEN>(['VENNPAGNUM', 'VENNPAGLIM']);

        for (const key in asentven) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTVEN)) continue;

            if (asentven.hasOwnProperty(key) && asentven[key as keyof ASENTVEN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH VEN AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY VENNID_ENT) AS FLOAT) / @VENNPAGLIM) AS VENNPAGNUM,
                       * 
                FROM AS_CAD..ASENTVEN WITH (NOLOCK)
            )
            SELECT * FROM VEN WHERE VENNPAGNUM = @VENNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTVEN WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentven, VENNPAGNUM, VENNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asentven: Partial<ASENTVEN>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTVEN>(['VENCUSUCAD', 'VENDDATCAD', 'VENCUSUALT', 'VENDDATALT']);

        for (let key in asentven) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTVEN)) continue;

            if (asentven[key as keyof ASENTVEN] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentven[key as keyof ASENTVEN]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTVEN (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentven: Partial<ASENTVEN>, whereConditions: Partial<ASENTVEN>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTVEN>(['VENCUSUCAD', 'VENDDATCAD', 'VENCUSUALT', 'VENDDATALT']);
        
        for (const [key, value] of Object.entries(asentven)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTVEN) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTVEN
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentven, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentven: Partial<ASENTVEN>) {
        let conditions: string[] = [];
    
        for (const key in asentven) {
            if (asentven.hasOwnProperty(key) && asentven[key as keyof ASENTVEN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTVEN ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentven }, token });
    }
    
    
}

export default new as_venService()