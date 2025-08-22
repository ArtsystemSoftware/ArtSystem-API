import { as_mssql } from "@root/models";
import { ASENTTEL } from "@root/interfaces";


class as_telService {
    
    async as_get(token: string, asenttel: ASENTTEL = {} as ASENTTEL) {
        const { TELNPAGNUM = 1, TELNPAGLIM = 50 } = asenttel;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTTEL>(['TELNPAGNUM', 'TELNPAGLIM']);

        for (const key in asenttel) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTTEL)) continue;

            if (asenttel.hasOwnProperty(key) && asenttel[key as keyof ASENTTEL] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH TEL AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY TELNID_TEL) AS FLOAT) / @TELNPAGLIM) AS TELNPAGNUM,
                       * 
                FROM AS_CAD..ASENTTEL WITH (NOLOCK)
            )
            SELECT * FROM EDR WHERE TELNPAGNUM = @TELNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTTEL WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asenttel, TELNPAGNUM, TELNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asenttel: Partial<ASENTTEL>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTTEL>(['TELNID_TEL','TELCUSUCAD', 'TELDDATCAD','TELCUSUALT', 'TELDDATALT']);

        for (let key in asenttel) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTTEL)) continue;

            if (asenttel[key as keyof ASENTTEL] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asenttel[key as keyof ASENTTEL]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTTEL (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asenttel: Partial<ASENTTEL>, whereConditions: Partial<ASENTTEL>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTTEL>(['TELNID_TEL','TELCUSUCAD', 'TELDDATCAD','TELCUSUALT', 'TELDDATALT']);
        
        for (const [key, value] of Object.entries(asenttel)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTTEL) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTTEL
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asenttel, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asenttel: Partial<ASENTTEL>) {
        let conditions: string[] = [];
    
        for (const key in asenttel) {
            if (asenttel.hasOwnProperty(key) && asenttel[key as keyof ASENTTEL] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTTEL ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asenttel }, token });
    }
    
    
}

export default new as_telService()