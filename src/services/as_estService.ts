import { as_mssql } from "@root/models";
import { ASPROEST } from "@root/interfaces";

class as_estService {
    
    async as_get(token: string, asprodep: ASPROEST = {} as ASPROEST) {
        const { ESTNPAGNUM = 1, ESTNPAGLIM = 50 } = asprodep;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROEST>(['ESTNPAGNUM', 'ESTNPAGLIM']);

        for (const key in asprodep) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROEST)) continue;

            if (asprodep.hasOwnProperty(key) && asprodep[key as keyof ASPROEST] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH EST AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY ESTNID_EST) AS FLOAT) / @ESTNPAGLIM) AS ESTNPAGNUM,
                       * 
                FROM AS_CAD..ASPROEST WITH (NOLOCK)
            )
            SELECT * FROM EST WHERE ESTNPAGNUM = @ESTNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROEST WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprodep, ESTNPAGNUM, ESTNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asprodep: Partial<ASPROEST>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROEST>(['ESTNID_EST','ESTCUSUCAD', 'ESTDDATCAD','ESTCUSUALT', 'ESTDDATALT']);

        for (let key in asprodep) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROEST)) continue;

            if (asprodep[key as keyof ASPROEST] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asprodep[key as keyof ASPROEST]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROEST (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asprodep: Partial<ASPROEST>, whereConditions: Partial<ASPROEST>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROEST>(['ESTNID_EST','ESTCUSUCAD', 'ESTDDATCAD','ESTCUSUALT', 'ESTDDATALT']);
        
        for (const [key, value] of Object.entries(asprodep)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROEST) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROEST
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asprodep, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asprodep: Partial<ASPROEST>) {
        let conditions: string[] = [];
    
        for (const key in asprodep) {
            if (asprodep.hasOwnProperty(key) && asprodep[key as keyof ASPROEST] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROEST ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprodep }, token });
    }
    
    
}

export default new as_estService()