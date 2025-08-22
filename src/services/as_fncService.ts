import { as_mssql } from "@root/models";
import { ASENTFNC } from "@root/interfaces";

class as_fncService {
    
    async as_get(token: string, asentfnc: ASENTFNC = {} as ASENTFNC) {
        const { FNCNPAGNUM = 1, FNCNPAGLIM = 50 } = asentfnc;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTFNC>(['FNCNPAGNUM', 'FNCNPAGLIM']);

        for (const key in asentfnc) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTFNC)) continue;

            if (asentfnc.hasOwnProperty(key) && asentfnc[key as keyof ASENTFNC] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH FNC AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY FNCNID_ENT) AS FLOAT) / @FNCNPAGLIM) AS FNCNPAGNUM,
                       * 
                FROM AS_CAD..ASENTFNC WITH (NOLOCK)
            )
            SELECT * FROM FNC WHERE FNCNPAGNUM = @FNCNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTFNC WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentfnc, FNCNPAGNUM, FNCNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asentfnc: Partial<ASENTFNC>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTFNC>(['FNCCUSUCAD', 'FNCDDATCAD', 'FNCCUSUALT', 'FNCDDATALT']);

        for (let key in asentfnc) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTFNC)) continue;

            if (asentfnc[key as keyof ASENTFNC] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentfnc[key as keyof ASENTFNC]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTFNC (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentfnc: Partial<ASENTFNC>, whereConditions: Partial<ASENTFNC>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTFNC>(['FNCCUSUCAD', 'FNCDDATCAD', 'FNCCUSUALT', 'FNCDDATALT']);
        
        for (const [key, value] of Object.entries(asentfnc)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTFNC) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTFNC
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentfnc, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentfnc: Partial<ASENTFNC>) {
        let conditions: string[] = [];
    
        for (const key in asentfnc) {
            if (asentfnc.hasOwnProperty(key) && asentfnc[key as keyof ASENTFNC] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTFNC ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentfnc }, token });
    }
    
    
}

export default new as_fncService()