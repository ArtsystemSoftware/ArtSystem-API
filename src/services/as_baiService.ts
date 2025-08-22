import { as_mssql } from "@root/models";
import { ASCEPBAI } from "@root/interfaces";

class as_baiService {
    
    async as_get(token: string, ascepcep: ASCEPBAI = {} as ASCEPBAI) {
        const { BAINPAGNUM = 1, BAINPAGLIM = 50 } = ascepcep;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASCEPBAI>(['BAINPAGNUM', 'BAINPAGLIM']);

        for (const key in ascepcep) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASCEPBAI)) continue;

            if (ascepcep.hasOwnProperty(key) && ascepcep[key as keyof ASCEPBAI] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH BAI AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY BAINID_BAI) AS FLOAT) / @BAINPAGLIM) AS BAINPAGNUM,
                       * 
                FROM AS_CAD..ASCEPBAI WITH (NOLOCK)
            )
            SELECT * FROM BAI WHERE BAINPAGNUM = @BAINPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASCEPBAI WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...ascepcep, BAINPAGNUM, BAINPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, ascepcep: Partial<ASCEPBAI>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASCEPBAI>(['BAINID_BAI','BAICUSUCAD', 'BAIDDATCAD','BAICUSUALT', 'BAIDDATALT']);

        for (let key in ascepcep) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASCEPBAI)) continue;

            if (ascepcep[key as keyof ASCEPBAI] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = ascepcep[key as keyof ASCEPBAI]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASCEPBAI (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, ascepcep: Partial<ASCEPBAI>, whereConditions: Partial<ASCEPBAI>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASCEPBAI>(['BAINID_BAI','BAICUSUCAD', 'BAIDDATCAD','BAICUSUALT', 'BAIDDATALT']);
        
        for (const [key, value] of Object.entries(ascepcep)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASCEPBAI) && value !== undefined) {
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
            UPDATE AS_CAD..ASCEPBAI
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...ascepcep, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, ascepcep: Partial<ASCEPBAI>) {
        let conditions: string[] = [];
    
        for (const key in ascepcep) {
            if (ascepcep.hasOwnProperty(key) && ascepcep[key as keyof ASCEPBAI] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASCEPBAI ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...ascepcep }, token });
    }
    
    
}

export default new as_baiService()