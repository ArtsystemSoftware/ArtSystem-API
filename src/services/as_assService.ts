import { as_mssql } from "@root/models";
import { ASPROASS } from "@root/interfaces";

class as_assService {
    
    async as_get(token: string, asproass: ASPROASS = {} as ASPROASS) {
        const { ASSNPAGNUM = 1, ASSNPAGLIM = 50 } = asproass;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROASS>(['ASSNPAGNUM', 'ASSNPAGLIM']);

        for (const key in asproass) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROASS)) continue;

            if (asproass.hasOwnProperty(key) && asproass[key as keyof ASPROASS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH ASS AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY ASSNID_ASS) AS FLOAT) / @ASSNPAGLIM) AS ASSNPAGNUM,
                       * 
                FROM AS_CAD..ASPROASS WITH (NOLOCK)
            )
            SELECT * FROM ASS WHERE ASSNPAGNUM = @ASSNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROASS WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproass, ASSNPAGNUM, ASSNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asproass: Partial<ASPROASS>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROASS>(['ASSNID_ASS', 'ASSCUSUCAD', 'ASSDDATCAD', 'ASSCUSUALT', 'ASSDDATALT']);

        for (let key in asproass) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROASS)) continue;

            if (asproass[key as keyof ASPROASS] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asproass[key as keyof ASPROASS]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROASS (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asproass: Partial<ASPROASS>, whereConditions: Partial<ASPROASS>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROASS>(['ASSNID_ASS', 'ASSCUSUCAD', 'ASSDDATCAD', 'ASSCUSUALT', 'ASSDDATALT']);
        
        for (const [key, value] of Object.entries(asproass)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROASS) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROASS
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asproass, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asproass: Partial<ASPROASS>) {
        let conditions: string[] = [];
    
        for (const key in asproass) {
            if (asproass.hasOwnProperty(key) && asproass[key as keyof ASPROASS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROASS ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproass }, token });
    }
    
    
}

export default new as_assService()