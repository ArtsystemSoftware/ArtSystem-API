import { as_mssql } from "@root/models";
import { ASPEDCAB_PLG } from "@root/interfaces";

class as_cabplgService {
    
    async as_get(token: string, aspedcab_plg: ASPEDCAB_PLG = {} as ASPEDCAB_PLG) {
        const { PLGNPAGNUM = 1, PLGNPAGLIM = 50 } = aspedcab_plg;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDCAB_PLG>(['PLGNPAGNUM', 'PLGNPAGLIM']);

        for (const key in aspedcab_plg) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_PLG)) continue;

            if (aspedcab_plg.hasOwnProperty(key) && aspedcab_plg[key as keyof ASPEDCAB_PLG] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH PLG AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY PLGNID_PLG) AS FLOAT) / @PLGNPAGLIM) AS PLGNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDCAB_PLG WITH (NOLOCK)
            )
            SELECT * FROM PLG WHERE PLGNPAGNUM = @PLGNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDCAB_PLG WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_plg, PLGNPAGNUM, PLGNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedcab_plg: Partial<ASPEDCAB_PLG>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDCAB_PLG>(['PLGNID_PLG', 'PLGCUSUCAD', 'PLGDDATCAD', 'PLGCUSUALT', 'PLGDDATALT']);

        for (let key in aspedcab_plg) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_PLG)) continue;

            if (aspedcab_plg[key as keyof ASPEDCAB_PLG] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedcab_plg[key as keyof ASPEDCAB_PLG]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDCAB_PLG (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedcab_plg: Partial<ASPEDCAB_PLG>, whereConditions: Partial<ASPEDCAB_PLG>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDCAB_PLG>(['PLGNID_PLG','PLGCUSUCAD', 'PLGDDATCAD', 'PLGCUSUALT', 'PLGDDATALT']);
        
        for (const [key, value] of Object.entries(aspedcab_plg)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_PLG) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDCAB_PLG
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedcab_plg, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedcab_plg: Partial<ASPEDCAB_PLG>) {
        let conditions: string[] = [];
    
        for (const key in aspedcab_plg) {
            if (aspedcab_plg.hasOwnProperty(key) && aspedcab_plg[key as keyof ASPEDCAB_PLG] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDCAB_PLG ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_plg }, token });
    }
    
    
}

export default new as_cabplgService()