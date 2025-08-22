import { as_mssql } from "@root/models";
import { ASENTDIV } from "@root/interfaces";

class as_divService {
    
    async as_get(token: string, asentent: ASENTDIV = {} as ASENTDIV) {
        const { DIVNPAGNUM = 1, DIVNPAGLIM = 50 } = asentent;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTDIV>(['DIVNPAGNUM', 'DIVNPAGLIM']);

        for (const key in asentent) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTDIV)) continue;

            if (asentent.hasOwnProperty(key) && asentent[key as keyof ASENTDIV] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH DIV AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY DIVNID_DIV) AS FLOAT) / @DIVNPAGLIM) AS DIVNPAGNUM,
                       * 
                FROM AS_CAD..ASENTDIV WITH (NOLOCK)
            )
            SELECT * FROM DIV WHERE DIVNPAGNUM = @DIVNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTDIV WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentent, DIVNPAGNUM, DIVNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asentent: Partial<ASENTDIV>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTDIV>(['DIVNID_DIV','DIVCTIPCAD','DIVCUSUCAD', 'DIVDDATCAD','DIVCUSUALT', 'DIVDDATALT']);

        for (let key in asentent) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTDIV)) continue;

            if (asentent[key as keyof ASENTDIV] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentent[key as keyof ASENTDIV]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTDIV (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentent: Partial<ASENTDIV>, whereConditions: Partial<ASENTDIV>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTDIV>(['DIVNID_DIV','DIVCTIPCAD','DIVCUSUCAD', 'DIVDDATCAD','DIVCUSUALT', 'DIVDDATALT']);
        
        for (const [key, value] of Object.entries(asentent)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTDIV) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTDIV
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentent, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentent: Partial<ASENTDIV>) {
        let conditions: string[] = [];
    
        for (const key in asentent) {
            if (asentent.hasOwnProperty(key) && asentent[key as keyof ASENTDIV] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTDIV ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentent }, token });
    }
    
    
}

export default new as_divService()