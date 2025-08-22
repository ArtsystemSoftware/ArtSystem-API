import { as_mssql } from "@root/models";
import { ASENTEDR } from "@root/interfaces";


class as_edrService {
    
    async as_get(token: string, asentedr: ASENTEDR = {} as ASENTEDR) {
        const { EDRNPAGNUM = 1, EDRNPAGLIM = 50 } = asentedr;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTEDR>(['EDRNPAGNUM', 'EDRNPAGLIM']);

        for (const key in asentedr) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTEDR)) continue;

            if (asentedr.hasOwnProperty(key) && asentedr[key as keyof ASENTEDR] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH EDR AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY EDRNID_EDR) AS FLOAT) / @EDRNPAGLIM) AS EDRNPAGNUM,
                       * 
                FROM AS_CAD..ASENTEDR WITH (NOLOCK) WHERE EDRCSTATUS <> 'E'
            )
            SELECT * FROM EDR WHERE EDRNPAGNUM = @EDRNPAGNUM AND EDRCSTATUS <> 'E'`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTEDR WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentedr, EDRNPAGNUM, EDRNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asentedr: Partial<ASENTEDR>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTEDR>(['EDRNID_EDR','EDRCUSUCAD', 'EDRDDATCAD','EDRCUSUALT', 'EDRDDATALT']);

        for (let key in asentedr) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTEDR)) continue;

            if (asentedr[key as keyof ASENTEDR] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentedr[key as keyof ASENTEDR]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTEDR (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentedr: Partial<ASENTEDR>, whereConditions: Partial<ASENTEDR>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTEDR>(['EDRNID_EDR','EDRCUSUCAD', 'EDRDDATCAD','EDRCUSUALT', 'EDRDDATALT']);
        
        for (const [key, value] of Object.entries(asentedr)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTEDR) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTEDR
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentedr, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentedr: Partial<ASENTEDR>) {
        let conditions: string[] = [];
    
        for (const key in asentedr) {
            if (asentedr.hasOwnProperty(key) && asentedr[key as keyof ASENTEDR] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTEDR ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentedr }, token });
    }
    
    
}

export default new as_edrService()