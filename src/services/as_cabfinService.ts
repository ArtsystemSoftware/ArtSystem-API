import { as_mssql } from "@root/models";
import { ASPEDCAB_FIN } from "@root/interfaces";

class as_cabcomService {
    
    async as_get(token: string, aspedcab_fin: ASPEDCAB_FIN = {} as ASPEDCAB_FIN) {
        const { CAFNPAGNUM = 1, CAFNPAGLIM = 50 } = aspedcab_fin;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDCAB_FIN>(['CAFNPAGNUM', 'CAFNPAGLIM']);

        for (const key in aspedcab_fin) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_FIN)) continue;

            if (aspedcab_fin.hasOwnProperty(key) && aspedcab_fin[key as keyof ASPEDCAB_FIN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CAF AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CAFNID_CAF) AS FLOAT) / @CAFNPAGLIM) AS CAFNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDCAB_FIN WITH (NOLOCK)
            )
            SELECT * FROM CAF WHERE CAFNPAGNUM = @CAFNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDCAB_FIN WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_fin, CAFNPAGNUM, CAFNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedcab_fin: Partial<ASPEDCAB_FIN>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDCAB_FIN>(['CAFNID_CAF', 'CAFCUSUCAD', 'CAFDDATCAD', 'CAFCUSUALT', 'CAFDDATALT']);

        for (let key in aspedcab_fin) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_FIN)) continue;

            if (aspedcab_fin[key as keyof ASPEDCAB_FIN] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedcab_fin[key as keyof ASPEDCAB_FIN]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDCAB_FIN (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedcab_fin: Partial<ASPEDCAB_FIN>, whereConditions: Partial<ASPEDCAB_FIN>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDCAB_FIN>(['CAFNID_CAF','CAFCUSUCAD', 'CAFDDATCAD', 'CAFCUSUALT', 'CAFDDATALT']);
        
        for (const [key, value] of Object.entries(aspedcab_fin)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_FIN) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDCAB_FIN
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedcab_fin, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedcab_fin: Partial<ASPEDCAB_FIN>) {
        let conditions: string[] = [];
    
        for (const key in aspedcab_fin) {
            if (aspedcab_fin.hasOwnProperty(key) && aspedcab_fin[key as keyof ASPEDCAB_FIN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDCAB_FIN ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_fin }, token });
    }
    
    
}

export default new as_cabcomService()