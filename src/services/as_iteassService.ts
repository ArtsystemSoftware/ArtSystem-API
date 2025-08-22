import { as_mssql } from "@root/models";
import { ASPEDITE_ASS } from "@root/interfaces";

class as_iteassService {
    
    async as_get(token: string, aspedite_amb: ASPEDITE_ASS = {} as ASPEDITE_ASS) {
        const { ITANPAGNUM = 1, ITANPAGLIM = 50 } = aspedite_amb;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDITE_ASS>(['ITANPAGNUM', 'ITANPAGLIM']);

        for (const key in aspedite_amb) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_ASS)) continue;

            if (aspedite_amb.hasOwnProperty(key) && aspedite_amb[key as keyof ASPEDITE_ASS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH ITA AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY ITANID_ITA) AS FLOAT) / @ITANPAGLIM) AS ITANPAGNUM,
                       * 
                FROM AS_CAD..ASPEDITE_ASS WITH (NOLOCK)
            )
            SELECT * FROM ITA WHERE ITANPAGNUM = @ITANPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDITE_ASS WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_amb, ITANPAGNUM, ITANPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedite_amb: Partial<ASPEDITE_ASS>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDITE_ASS>(['ITANID_ITA','ITACUSUCAD', 'ITADDATCAD', 'ITACUSUALT', 'ITADDATALT']);

        for (let key in aspedite_amb) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_ASS)) continue;

            if (aspedite_amb[key as keyof ASPEDITE_ASS] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedite_amb[key as keyof ASPEDITE_ASS]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDITE_ASS (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedite_amb: Partial<ASPEDITE_ASS>, whereConditions: Partial<ASPEDITE_ASS>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDITE_ASS>(['ITANID_ITA','ITACUSUCAD', 'ITADDATCAD', 'ITACUSUALT', 'ITADDATALT']);
        
        for (const [key, value] of Object.entries(aspedite_amb)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_ASS) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDITE_ASS
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedite_amb, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedite_amb: Partial<ASPEDITE_ASS>) {
        let conditions: string[] = [];
    
        for (const key in aspedite_amb) {
            if (aspedite_amb.hasOwnProperty(key) && aspedite_amb[key as keyof ASPEDITE_ASS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDITE_ASS ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_amb }, token });
    }
    
    
}
export default new as_iteassService()