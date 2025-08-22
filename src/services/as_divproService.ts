import { as_mssql } from "@root/models";
import { ASENTDIV_PRO } from "@root/interfaces";

class as_divproService {
    
    async as_get(token: string, asentdiv_pro: ASENTDIV_PRO = {} as ASENTDIV_PRO) {
        const { DIPNPAGNUM = 1, DIPNPAGLIM = 50 } = asentdiv_pro;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTDIV_PRO>(['DIPNPAGNUM', 'DIPNPAGLIM']);

        for (const key in asentdiv_pro) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTDIV_PRO)) continue;

            if (asentdiv_pro.hasOwnProperty(key) && asentdiv_pro[key as keyof ASENTDIV_PRO] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH DIP AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY DIPNID_DIP) AS FLOAT) / @DIPNPAGLIM) AS DIPNPAGNUM,
                       * 
                FROM AS_CAD..ASENTDIV_PRO WITH (NOLOCK)
            )
            SELECT * FROM DIP WHERE DIPNPAGNUM = @DIPNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTDIV_PRO WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentdiv_pro, DIPNPAGNUM, DIPNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asentdiv_pro: Partial<ASENTDIV_PRO>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTDIV_PRO>(['DIPNID_DIP','DIPCUSUCAD', 'DIPDDATCAD','DIPCUSUALT', 'DIPDDATALT']);

        for (let key in asentdiv_pro) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTDIV_PRO)) continue;

            if (asentdiv_pro[key as keyof ASENTDIV_PRO] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentdiv_pro[key as keyof ASENTDIV_PRO]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTDIV_PRO (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentdiv_pro: Partial<ASENTDIV_PRO>, whereConditions: Partial<ASENTDIV_PRO>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTDIV_PRO>(['DIPNID_DIP','DIPCUSUCAD', 'DIPDDATCAD','DIPCUSUALT', 'DIPDDATALT']);
        
        for (const [key, value] of Object.entries(asentdiv_pro)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTDIV_PRO) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTDIV_PRO
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentdiv_pro, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentdiv_pro: Partial<ASENTDIV_PRO>) {
        let conditions: string[] = [];
    
        for (const key in asentdiv_pro) {
            if (asentdiv_pro.hasOwnProperty(key) && asentdiv_pro[key as keyof ASENTDIV_PRO] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTDIV_PRO ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentdiv_pro }, token });
    }
    
}

export default new as_divproService()