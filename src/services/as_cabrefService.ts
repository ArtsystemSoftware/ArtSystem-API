import { as_mssql } from "@root/models";
import { ASPEDCAB_REF } from "@root/interfaces";

class as_cabrefService {
    
    async as_get(token: string, aspedcab_ref: ASPEDCAB_REF = {} as ASPEDCAB_REF) {
        const { CARNPAGNUM = 1, CARNPAGLIM = 50 } = aspedcab_ref;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDCAB_REF>(['CARNPAGNUM', 'CARNPAGLIM']);

        for (const key in aspedcab_ref) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_REF)) continue;

            if (aspedcab_ref.hasOwnProperty(key) && aspedcab_ref[key as keyof ASPEDCAB_REF] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CAR AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CARNID_CAR) AS FLOAT) / @CARNPAGLIM) AS CARNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDCAB_REF WITH (NOLOCK)
            )
            SELECT * FROM CAR WHERE CARNPAGNUM = @CARNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDCAB_REF WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_ref, CARNPAGNUM, CARNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedcab_ref: Partial<ASPEDCAB_REF>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDCAB_REF>(['CARNID_CAR', 'CARCUSUCAD', 'CARDDATCAD', 'CARCUSUALT', 'CARDDATALT']);

        for (let key in aspedcab_ref) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_REF)) continue;

            if (aspedcab_ref[key as keyof ASPEDCAB_REF] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedcab_ref[key as keyof ASPEDCAB_REF]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDCAB_REF (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedcab_ref: Partial<ASPEDCAB_REF>, whereConditions: Partial<ASPEDCAB_REF>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDCAB_REF>(['CARNID_CAR','CARCUSUCAD', 'CARDDATCAD', 'CARCUSUALT', 'CARDDATALT']);
        
        for (const [key, value] of Object.entries(aspedcab_ref)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_REF) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDCAB_REF
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedcab_ref, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedcab_ref: Partial<ASPEDCAB_REF>) {
        let conditions: string[] = [];
    
        for (const key in aspedcab_ref) {
            if (aspedcab_ref.hasOwnProperty(key) && aspedcab_ref[key as keyof ASPEDCAB_REF] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDCAB_REF ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_ref }, token });
    }
    
    
}

export default new as_cabrefService()