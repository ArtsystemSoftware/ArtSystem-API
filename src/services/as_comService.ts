import { as_mssql } from "@root/models";
import { ASENTCOM } from "@root/interfaces";

class as_comService {
    
    async as_get(token: string, asentcom: ASENTCOM = {} as ASENTCOM) {
        const { COMNPAGNUM = 1, COMNPAGLIM = 50 } = asentcom;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTCOM>(['COMNPAGNUM', 'COMNPAGLIM']);

        for (const key in asentcom) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCOM)) continue;

            if (asentcom.hasOwnProperty(key) && asentcom[key as keyof ASENTCOM] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH COM AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY COMNID_ENT) AS FLOAT) / @COMNPAGLIM) AS COMNPAGNUM,
                       * 
                FROM AS_CAD..ASENTCOM WITH (NOLOCK)
            )
            SELECT * FROM COM WHERE COMNPAGNUM = @COMNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTCOM WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcom, COMNPAGNUM, COMNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asentcom: Partial<ASENTCOM>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTCOM>(['COMCUSUCAD', 'COMDDATCAD', 'COMCUSUALT', 'COMDDATALT']);

        for (let key in asentcom) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCOM)) continue;

            if (asentcom[key as keyof ASENTCOM] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentcom[key as keyof ASENTCOM]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTCOM (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentcom: Partial<ASENTCOM>, whereConditions: Partial<ASENTCOM>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTCOM>(['COMCUSUCAD', 'COMDDATCAD', 'COMCUSUALT', 'COMDDATALT']);
        
        for (const [key, value] of Object.entries(asentcom)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTCOM) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTCOM
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentcom, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentcom: Partial<ASENTCOM>) {
        let conditions: string[] = [];
    
        for (const key in asentcom) {
            if (asentcom.hasOwnProperty(key) && asentcom[key as keyof ASENTCOM] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTCOM ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcom }, token });
    }
    
    
}

export default new as_comService()