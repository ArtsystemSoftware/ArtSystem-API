import { as_mssql } from "@root/models";
import { ASPEDITE_DIS_BXA } from "@root/interfaces";

class as_itedisService {
    
    async as_get(token: string, aspedite_dis_bxa: ASPEDITE_DIS_BXA = {} as ASPEDITE_DIS_BXA) {
        const { ITBNPAGNUM = 1, ITBNPAGLIM = 50 } = aspedite_dis_bxa;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDITE_DIS_BXA>(['ITBNPAGNUM', 'ITBNPAGLIM']);

        for (const key in aspedite_dis_bxa) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_DIS_BXA)) continue;

            if (aspedite_dis_bxa.hasOwnProperty(key) && aspedite_dis_bxa[key as keyof ASPEDITE_DIS_BXA] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH ITB AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY ITBNID_ITB) AS FLOAT) / @ITBNPAGLIM) AS ITBNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDITE_DIS_BXA WITH (NOLOCK)
            )
            SELECT * FROM ITB WHERE ITBNPAGNUM = @ITBNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDITE_DIS_BXA WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_dis_bxa, ITBNPAGNUM, ITBNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedite_dis_bxa: Partial<ASPEDITE_DIS_BXA>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDITE_DIS_BXA>(['ITBNID_ITB','ITBCUSUCAD', 'ITBDDATCAD', 'ITBCUSUALT', 'ITBDDATALT']);

        for (let key in aspedite_dis_bxa) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_DIS_BXA)) continue;

            if (aspedite_dis_bxa[key as keyof ASPEDITE_DIS_BXA] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedite_dis_bxa[key as keyof ASPEDITE_DIS_BXA]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDITE_DIS_BXA (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedite_dis_bxa: Partial<ASPEDITE_DIS_BXA>, whereConditions: Partial<ASPEDITE_DIS_BXA>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDITE_DIS_BXA>(['ITBNID_ITB','ITBCUSUCAD', 'ITBDDATCAD', 'ITBCUSUALT', 'ITBDDATALT']);
        
        for (const [key, value] of Object.entries(aspedite_dis_bxa)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_DIS_BXA) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDITE_DIS_BXA
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedite_dis_bxa, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedite_dis_bxa: Partial<ASPEDITE_DIS_BXA>) {
        let conditions: string[] = [];
    
        for (const key in aspedite_dis_bxa) {
            if (aspedite_dis_bxa.hasOwnProperty(key) && aspedite_dis_bxa[key as keyof ASPEDITE_DIS_BXA] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDITE_DIS_BXA ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_dis_bxa }, token });
    }
    
    
}
export default new as_itedisService()