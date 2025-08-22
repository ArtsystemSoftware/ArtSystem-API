import { as_mssql } from "@root/models";
import { ASPROBAL } from "@root/interfaces";

class as_balService {
    
    async as_get(token: string, asprobal: ASPROBAL = {} as ASPROBAL) {
        const { BALNPAGNUM = 1, BALNPAGLIM = 50 } = asprobal;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROBAL>(['BALNPAGNUM', 'BALNPAGLIM']);

        for (const key in asprobal) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROBAL)) continue;

            if (asprobal.hasOwnProperty(key) && asprobal[key as keyof ASPROBAL] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH BAL AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY BALNID_BAL) AS FLOAT) / @BALNPAGLIM) AS BALNPAGNUM,
                       * 
                FROM AS_CAD..ASPROBAL WITH (NOLOCK)
            )
            SELECT * FROM BAL WHERE BALNPAGNUM = @BALNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROBAL WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprobal, BALNPAGNUM, BALNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asprobal: Partial<ASPROBAL>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROBAL>(['BALNID_BAL', 'BALCUSUCAD', 'BALDDATCAD', 'BALCUSUALT', 'BALDDATALT']);

        for (let key in asprobal) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROBAL)) continue;

            if (asprobal[key as keyof ASPROBAL] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asprobal[key as keyof ASPROBAL]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROBAL (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asprobal: Partial<ASPROBAL>, whereConditions: Partial<ASPROBAL>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROBAL>(['BALNID_BAL', 'BALCUSUCAD', 'BALDDATCAD', 'BALCUSUALT', 'BALDDATALT']);
        
        for (const [key, value] of Object.entries(asprobal)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROBAL) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROBAL
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asprobal, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asprobal: Partial<ASPROBAL>) {
        let conditions: string[] = [];
    
        for (const key in asprobal) {
            if (asprobal.hasOwnProperty(key) && asprobal[key as keyof ASPROBAL] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROBAL ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprobal }, token });
    }
    
    
}

export default new as_balService()