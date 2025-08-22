import { as_mssql } from "@root/models";
import { ASPROTAB } from "@root/interfaces";

class as_ptpService {
    
    async as_get(token: string, asprotab: ASPROTAB = {} as ASPROTAB) {
        const { PTPNPAGNUM = 1, PTPNPAGLIM = 50 } = asprotab;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROTAB>(['PTPNPAGNUM', 'PTPNPAGLIM']);

        for (const key in asprotab) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROTAB)) continue;

            if (asprotab.hasOwnProperty(key) && asprotab[key as keyof ASPROTAB] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH PTP AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY PTPNID_PTP) AS FLOAT) / @PTPNPAGLIM) AS PTPNPAGNUM,
                       * 
                FROM AS_CAD..ASPROTAB WITH (NOLOCK)
            )
            SELECT * FROM PTP WHERE PTPNPAGNUM = @PTPNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROTAB WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprotab, PTPNPAGNUM, PTPNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asprotab: Partial<ASPROTAB>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROTAB>(['PTPNID_PTP', 'PTPCUSUCAD', 'PTPDDATCAD', 'PTPCUSUALT', 'PTPDDATALT']);

        for (let key in asprotab) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROTAB)) continue;

            if (asprotab[key as keyof ASPROTAB] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asprotab[key as keyof ASPROTAB]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROTAB (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asprotab: Partial<ASPROTAB>, whereConditions: Partial<ASPROTAB>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROTAB>(['PTPNID_PTP', 'PTPCUSUCAD', 'PTPDDATCAD', 'PTPCUSUALT', 'PTPDDATALT']);
        
        for (const [key, value] of Object.entries(asprotab)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROTAB) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROTAB
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asprotab, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asprotab: Partial<ASPROTAB>) {
        let conditions: string[] = [];
    
        for (const key in asprotab) {
            if (asprotab.hasOwnProperty(key) && asprotab[key as keyof ASPROTAB] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROTAB ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprotab }, token });
    }
    
    
}

export default new as_ptpService()