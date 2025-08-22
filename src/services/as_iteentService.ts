import { as_mssql } from "@root/models";
import { ASPEDITE_ENT } from "@root/interfaces";

class as_iteentService {
    
    async as_get(token: string, aspedite_ent: ASPEDITE_ENT = {} as ASPEDITE_ENT) {
        const { IENNPAGNUM = 1, IENNPAGLIM = 50 } = aspedite_ent;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDITE_ENT>(['IENNPAGNUM', 'IENNPAGLIM']);

        for (const key in aspedite_ent) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_ENT)) continue;

            if (aspedite_ent.hasOwnProperty(key) && aspedite_ent[key as keyof ASPEDITE_ENT] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH IEN AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY IENNID_IEN) AS FLOAT) / @IENNPAGLIM) AS IENNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDITE_ENT WITH (NOLOCK)
            )
            SELECT * FROM IEN WHERE IENNPAGNUM = @IENNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDITE_ENT WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_ent, IENNPAGNUM, IENNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedite_ent: Partial<ASPEDITE_ENT>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDITE_ENT>(['IENNID_IEN','IENCUSUCAD', 'IENDDATCAD', 'IENCUSUALT', 'IENDDATALT']);

        for (let key in aspedite_ent) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_ENT)) continue;

            if (aspedite_ent[key as keyof ASPEDITE_ENT] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedite_ent[key as keyof ASPEDITE_ENT]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDITE_ENT (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedite_ent: Partial<ASPEDITE_ENT>, whereConditions: Partial<ASPEDITE_ENT>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDITE_ENT>(['IENNID_IEN','IENCUSUCAD', 'IENDDATCAD', 'IENCUSUALT', 'IENDDATALT']);
        
        for (const [key, value] of Object.entries(aspedite_ent)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_ENT) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDITE_ENT
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedite_ent, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedite_ent: Partial<ASPEDITE_ENT>) {
        let conditions: string[] = [];
    
        for (const key in aspedite_ent) {
            if (aspedite_ent.hasOwnProperty(key) && aspedite_ent[key as keyof ASPEDITE_ENT] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDITE_ENT ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_ent }, token });
    }
    
    
}
export default new as_iteentService()