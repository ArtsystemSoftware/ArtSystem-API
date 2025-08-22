import { as_mssql } from "@root/models";
import { ASPROEST_AVA } from "@root/interfaces";

class as_estavaService {
    
    async as_get(token: string, asproest_ava: ASPROEST_AVA = {} as ASPROEST_AVA) {
        const { AVANPAGNUM = 1, AVANPAGLIM = 50 } = asproest_ava;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROEST_AVA>(['AVANPAGNUM', 'AVANPAGLIM']);

        for (const key in asproest_ava) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROEST_AVA)) continue;

            if (asproest_ava.hasOwnProperty(key) && asproest_ava[key as keyof ASPROEST_AVA] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH AVA AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY AVANID_AVA) AS FLOAT) / @AVANPAGLIM) AS AVANPAGNUM,
                       * 
                FROM AS_CAD..ASPROEST_AVA WITH (NOLOCK)
            )
            SELECT * FROM AVA WHERE AVANPAGNUM = @AVANPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROEST_AVA WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproest_ava, AVANPAGNUM, AVANPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asproest_ava: Partial<ASPROEST_AVA>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROEST_AVA>(['AVANID_AVA', 'AVACUSUCAD', 'AVADDATCAD']);

        for (let key in asproest_ava) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROEST_AVA)) continue;

            if (asproest_ava[key as keyof ASPROEST_AVA] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asproest_ava[key as keyof ASPROEST_AVA]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROEST_AVA (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asproest_ava: Partial<ASPROEST_AVA>, whereConditions: Partial<ASPROEST_AVA>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROEST_AVA>(['AVANID_AVA', 'AVACUSUCAD', 'AVADDATCAD']);
        
        for (const [key, value] of Object.entries(asproest_ava)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROEST_AVA) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROEST_AVA
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asproest_ava, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asproest_ava: Partial<ASPROEST_AVA>) {
        let conditions: string[] = [];
    
        for (const key in asproest_ava) {
            if (asproest_ava.hasOwnProperty(key) && asproest_ava[key as keyof ASPROEST_AVA] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROEST_AVA ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproest_ava }, token });
    }
    
    
}

export default new as_estavaService()