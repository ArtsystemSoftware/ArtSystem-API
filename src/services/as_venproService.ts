import { as_mssql } from "@root/models";
import { ASENTVEN_PRO } from "@root/interfaces";

class as_venproService {
    
    async as_get(token: string, asentven_pro: ASENTVEN_PRO = {} as ASENTVEN_PRO) {
        const { VEPNPAGNUM = 1, VEPNPAGLIM = 50 } = asentven_pro;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTVEN_PRO>(['VEPNPAGNUM', 'VEPNPAGLIM']);

        for (const key in asentven_pro) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTVEN_PRO)) continue;

            if (asentven_pro.hasOwnProperty(key) && asentven_pro[key as keyof ASENTVEN_PRO] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH VEP AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY VEPNID_VEP) AS FLOAT) / @VEPNPAGLIM) AS VEPNPAGNUM,
                       * 
                FROM AS_CAD..ASENTVEN_PRO WITH (NOLOCK)
            )
            SELECT * FROM VEP WHERE VEPNPAGNUM = @VEPNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTVEN_PRO WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentven_pro, VEPNPAGNUM, VEPNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asentven_pro: Partial<ASENTVEN_PRO>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTVEN_PRO>(['VEPNID_VEP','VEPCUSUCAD', 'VEPDDATCAD', 'VEPCUSUALT', 'VEPDDATALT']);

        for (let key in asentven_pro) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTVEN_PRO)) continue;

            if (asentven_pro[key as keyof ASENTVEN_PRO] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentven_pro[key as keyof ASENTVEN_PRO]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTVEN_PRO (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentven_pro: Partial<ASENTVEN_PRO>, whereConditions: Partial<ASENTVEN_PRO>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTVEN_PRO>(['VEPNID_VEP','VEPCUSUCAD', 'VEPDDATCAD', 'VEPCUSUALT', 'VEPDDATALT']);
        
        for (const [key, value] of Object.entries(asentven_pro)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTVEN_PRO) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTVEN_PRO
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentven_pro, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentven_pro: Partial<ASENTVEN_PRO>) {
        let conditions: string[] = [];
    
        for (const key in asentven_pro) {
            if (asentven_pro.hasOwnProperty(key) && asentven_pro[key as keyof ASENTVEN_PRO] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTVEN_PRO ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentven_pro }, token });
    }
    
    
}

export default new as_venproService()