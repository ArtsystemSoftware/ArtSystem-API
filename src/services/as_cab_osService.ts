import { as_mssql } from "@root/models";
import { ASPEDCAB_OS } from "@root/interfaces";

class as_cab_osService {
    
    async as_get(token: string, aspedcab_os: ASPEDCAB_OS = {} as ASPEDCAB_OS) {
        const { COSNPAGNUM = 1, COSNPAGLIM = 50 } = aspedcab_os;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDCAB_OS>(['COSNPAGNUM', 'COSNPAGLIM']);

        for (const key in aspedcab_os) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_OS)) continue;

            if (aspedcab_os.hasOwnProperty(key) && aspedcab_os[key as keyof ASPEDCAB_OS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH COB AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY COSNID_COS) AS FLOAT) / @COSNPAGLIM) AS COSNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDCAB_OS WITH (NOLOCK)
            )
            SELECT * FROM COB WHERE COSNPAGNUM = @COSNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDCAB_OS WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_os, COSNPAGNUM, COSNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedcab_os: Partial<ASPEDCAB_OS>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDCAB_OS>(['COSNID_COS', 'COSCUSUCAD', 'COSDDATCAD', 'COSCUSUALT', 'COSDDATALT']);

        for (let key in aspedcab_os) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_OS)) continue;

            if (aspedcab_os[key as keyof ASPEDCAB_OS] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedcab_os[key as keyof ASPEDCAB_OS]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDCAB_OS (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedcab_os: Partial<ASPEDCAB_OS>, whereConditions: Partial<ASPEDCAB_OS>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDCAB_OS>(['COSNID_COS','COSCUSUCAD', 'COSDDATCAD', 'COSCUSUALT', 'COSDDATALT']);
        
        for (const [key, value] of Object.entries(aspedcab_os)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_OS) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDCAB_OS
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedcab_os, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedcab_os: Partial<ASPEDCAB_OS>) {
        let conditions: string[] = [];
    
        for (const key in aspedcab_os) {
            if (aspedcab_os.hasOwnProperty(key) && aspedcab_os[key as keyof ASPEDCAB_OS] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDCAB_OS ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_os }, token });
    }
    
    
}

export default new as_cab_osService()