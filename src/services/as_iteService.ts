import { as_mssql } from "@root/models";
import { ASPEDITE } from "@root/interfaces";

class as_iteService {
    
    async as_get(token: string, aspedite: ASPEDITE = {} as ASPEDITE) {
        const { ITENPAGNUM = 1, ITENPAGLIM = 50 } = aspedite;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDITE>(['ITENPAGNUM', 'ITENPAGLIM']);

        for (const key in aspedite) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE)) continue;

            if (aspedite.hasOwnProperty(key) && aspedite[key as keyof ASPEDITE] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH ITE AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY ITENID_ITE) AS FLOAT) / @ITENPAGLIM) AS ITENPAGNUM,
                       * 
                FROM AS_CAD..ASPEDITE WITH (NOLOCK)
            )
            SELECT * FROM ITE WHERE ITENPAGNUM = @ITENPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDITE WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite, ITENPAGNUM, ITENPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedite: Partial<ASPEDITE>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDITE>(['ITENID_ITE','ITECUSUCAD', 'ITEDDATCAD', 'ITECUSUALT', 'ITEDDATALT']);

        for (let key in aspedite) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE)) continue;

            if (aspedite[key as keyof ASPEDITE] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedite[key as keyof ASPEDITE]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDITE (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedite: Partial<ASPEDITE>, whereConditions: Partial<ASPEDITE>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDITE>(['ITENID_ITE','ITENID_CAB','ITENID_PRI','ITENID_PRO', 'ITECUSUCAD', 'ITEDDATCAD', 'ITECUSUALT', 'ITEDDATALT']);
        
        for (const [key, value] of Object.entries(aspedite)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDITE) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDITE
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedite, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedite: Partial<ASPEDITE>) {
        let conditions: string[] = [];
    
        for (const key in aspedite) {
            if (aspedite.hasOwnProperty(key) && aspedite[key as keyof ASPEDITE] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDITE ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite }, token });
    }
    
    
}
export default new as_iteService()