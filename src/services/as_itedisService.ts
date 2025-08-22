import { as_mssql } from "@root/models";
import { ASPEDITE_DIS } from "@root/interfaces";

class as_itedisService {
    
    async as_get(token: string, aspedite_dis: ASPEDITE_DIS = {} as ASPEDITE_DIS) {
        const { ITDNPAGNUM = 1, ITDNPAGLIM = 50 } = aspedite_dis;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDITE_DIS>(['ITDNPAGNUM', 'ITDNPAGLIM']);

        for (const key in aspedite_dis) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_DIS)) continue;

            if (aspedite_dis.hasOwnProperty(key) && aspedite_dis[key as keyof ASPEDITE_DIS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH ITD AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY ITDNID_ITD) AS FLOAT) / @ITDNPAGLIM) AS ITDNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDITE_DIS WITH (NOLOCK)
            )
            SELECT * FROM ITD WHERE ITDNPAGNUM = @ITDNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDITE_DIS WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_dis, ITDNPAGNUM, ITDNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedite_dis: Partial<ASPEDITE_DIS>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDITE_DIS>(['ITDNID_ITD','ITDCUSUCAD', 'ITDDDATCAD', 'ITDCUSUALT', 'ITDDDATALT']);

        for (let key in aspedite_dis) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_DIS)) continue;

            if (aspedite_dis[key as keyof ASPEDITE_DIS] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedite_dis[key as keyof ASPEDITE_DIS]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDITE_DIS (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedite_dis: Partial<ASPEDITE_DIS>, whereConditions: Partial<ASPEDITE_DIS>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDITE_DIS>(['ITDNID_ITD','ITDCUSUCAD', 'ITDDDATCAD', 'ITDCUSUALT', 'ITDDDATALT']);
        
        for (const [key, value] of Object.entries(aspedite_dis)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_DIS) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDITE_DIS
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedite_dis, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedite_dis: Partial<ASPEDITE_DIS>) {
        let conditions: string[] = [];
    
        for (const key in aspedite_dis) {
            if (aspedite_dis.hasOwnProperty(key) && aspedite_dis[key as keyof ASPEDITE_DIS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDITE_DIS ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_dis }, token });
    }
    
    
}
export default new as_itedisService()