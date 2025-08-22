import { as_mssql } from "@root/models";
import { ASPROKIT } from "@root/interfaces";

class as_kitService {
    
    async as_get(token: string, asprokit: ASPROKIT = {} as ASPROKIT) {
        const { KITNPAGNUM = 1, KITNPAGLIM = 50 } = asprokit;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROKIT>(['KITNPAGNUM', 'KITNPAGLIM']);

        for (const key in asprokit) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROKIT)) continue;

            if (asprokit.hasOwnProperty(key) && asprokit[key as keyof ASPROKIT] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH KIT AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY KITNID_KIT) AS FLOAT) / @KITNPAGLIM) AS KITNPAGNUM,
                       * 
                FROM AS_CAD..ASPROKIT WITH (NOLOCK)
            )
            SELECT * FROM KIT WHERE KITNPAGNUM = @KITNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROKIT WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprokit, KITNPAGNUM, KITNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asprokit: Partial<ASPROKIT>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROKIT>(['KITNID_KIT', 'KITCUSUCAD', 'KITDDATCAD', 'KITCUSUALT', 'KITDDATALT']);

        for (let key in asprokit) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROKIT)) continue;

            if (asprokit[key as keyof ASPROKIT] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asprokit[key as keyof ASPROKIT]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROKIT (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asprokit: Partial<ASPROKIT>, whereConditions: Partial<ASPROKIT>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROKIT>(['KITNID_KIT', 'KITCUSUCAD', 'KITDDATCAD', 'KITCUSUALT', 'KITDDATALT']);
        
        for (const [key, value] of Object.entries(asprokit)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROKIT) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROKIT
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asprokit, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asprokit: Partial<ASPROKIT>) {
        let conditions: string[] = [];
    
        for (const key in asprokit) {
            if (asprokit.hasOwnProperty(key) && asprokit[key as keyof ASPROKIT] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROKIT ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprokit }, token });
    }
    
    
}

export default new as_kitService()