import { as_mssql } from "@root/models";
import { ASPROINC } from "@root/interfaces";

class as_incService {
    
    async as_get(token: string, asproinc: ASPROINC = {} as ASPROINC) {
        const { INCNPAGNUM = 1, INCNPAGLIM = 50 } = asproinc;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROINC>(['INCNPAGNUM', 'INCNPAGLIM']);

        for (const key in asproinc) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROINC)) continue;

            if (asproinc.hasOwnProperty(key) && asproinc[key as keyof ASPROINC] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH INC AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY INCNID_INC) AS FLOAT) / @INCNPAGLIM) AS INCNPAGNUM,
                       * 
                FROM AS_CAD..ASPROINC WITH (NOLOCK)
            )
            SELECT * FROM INC WHERE INCNPAGNUM = @INCNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROINC WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproinc, INCNPAGNUM, INCNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asproinc: Partial<ASPROINC>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROINC>(['INCNID_INC', 'INCCUSUCAD', 'INCDDATCAD', 'INCCUSUALT', 'INCDDATALT']);

        for (let key in asproinc) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROINC)) continue;

            if (asproinc[key as keyof ASPROINC] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asproinc[key as keyof ASPROINC]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROINC (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asproinc: Partial<ASPROINC>, whereConditions: Partial<ASPROINC>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROINC>(['INCNID_INC', 'INCCUSUCAD', 'INCDDATCAD', 'INCCUSUALT', 'INCDDATALT']);
        
        for (const [key, value] of Object.entries(asproinc)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROINC) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROINC
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asproinc, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asproinc: Partial<ASPROINC>) {
        let conditions: string[] = [];
    
        for (const key in asproinc) {
            if (asproinc.hasOwnProperty(key) && asproinc[key as keyof ASPROINC] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROINC ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproinc }, token });
    }
    
    
}

export default new as_incService()