import { as_mssql } from "@root/models";
import { ASPEDITE_AMB } from "@root/interfaces";

class as_iteambService {
    
    async as_get(token: string, aspedite_amb: ASPEDITE_AMB = {} as ASPEDITE_AMB) {
        const { IAMNPAGNUM = 1, IAMNPAGLIM = 50 } = aspedite_amb;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDITE_AMB>(['IAMNPAGNUM', 'IAMNPAGLIM']);

        for (const key in aspedite_amb) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_AMB)) continue;

            if (aspedite_amb.hasOwnProperty(key) && aspedite_amb[key as keyof ASPEDITE_AMB] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH IAM AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY IAMNID_IAM) AS FLOAT) / @IAMNPAGLIM) AS IAMNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDITE_AMB WITH (NOLOCK)
            )
            SELECT * FROM IAM WHERE IAMNPAGNUM = @IAMNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDITE_AMB WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_amb, IAMNPAGNUM, IAMNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedite_amb: Partial<ASPEDITE_AMB>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDITE_AMB>(['IAMNID_IAM','IAMCUSUCAD', 'IAMDDATCAD', 'IAMCUSUALT', 'IAMDDATALT']);

        for (let key in aspedite_amb) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_AMB)) continue;

            if (aspedite_amb[key as keyof ASPEDITE_AMB] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedite_amb[key as keyof ASPEDITE_AMB]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDITE_AMB (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedite_amb: Partial<ASPEDITE_AMB>, whereConditions: Partial<ASPEDITE_AMB>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDITE_AMB>(['IAMNID_IAM','IAMCUSUCAD', 'IAMDDATCAD', 'IAMCUSUALT', 'IAMDDATALT']);
        
        for (const [key, value] of Object.entries(aspedite_amb)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_AMB) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDITE_AMB
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedite_amb, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedite_amb: Partial<ASPEDITE_AMB>) {
        let conditions: string[] = [];
    
        for (const key in aspedite_amb) {
            if (aspedite_amb.hasOwnProperty(key) && aspedite_amb[key as keyof ASPEDITE_AMB] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDITE_AMB ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_amb }, token });
    }
    
    
}
export default new as_iteambService()