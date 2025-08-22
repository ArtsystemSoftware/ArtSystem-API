import { as_mssql } from "@root/models";
import { ASENTMOT } from "@root/interfaces";

class as_motService {
    
    async as_get(token: string, asentmot: ASENTMOT = {} as ASENTMOT) {
        const { MOTNPAGNUM = 1, MOTNPAGLIM = 50 } = asentmot;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTMOT>(['MOTNPAGNUM', 'MOTNPAGLIM']);

        for (const key in asentmot) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTMOT)) continue;

            if (asentmot.hasOwnProperty(key) && asentmot[key as keyof ASENTMOT] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH MOT AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY MOTNID_ENT) AS FLOAT) / @MOTNPAGLIM) AS MOTNPAGNUM,
                       * 
                FROM AS_CAD..ASENTMOT WITH (NOLOCK)
            )
            SELECT * FROM MOT WHERE MOTNPAGNUM = @MOTNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTMOT WITH (NOLOCK) ${prvcsqlwhr}`
        }
        
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentmot, MOTNPAGNUM, MOTNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asentmot: Partial<ASENTMOT>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTMOT>(['MOTCUSUCAD', 'MOTDDATCAD', 'MOTCUSUALT', 'MOTDDATALT']);

        for (let key in asentmot) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTMOT)) continue;

            if (asentmot[key as keyof ASENTMOT] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentmot[key as keyof ASENTMOT]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTMOT (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentmot: Partial<ASENTMOT>, whereConditions: Partial<ASENTMOT>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTMOT>(['MOTCUSUCAD', 'MOTDDATCAD', 'MOTCUSUALT', 'MOTDDATALT']);
        
        for (const [key, value] of Object.entries(asentmot)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTMOT) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTMOT
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentmot, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentmot: Partial<ASENTMOT>) {
        let conditions: string[] = [];
    
        for (const key in asentmot) {
            if (asentmot.hasOwnProperty(key) && asentmot[key as keyof ASENTMOT] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTMOT ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentmot }, token });
    }
    
    
}
 
export default new as_motService()