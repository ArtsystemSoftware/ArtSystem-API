import { as_mssql } from "@root/models";
import { ASPEDCOMAN } from "@root/interfaces";

class as_cabcomanService {
    
    async as_get(token: string, aspedcoman: ASPEDCOMAN = {} as ASPEDCOMAN) {
        const { PCMNPAGNUM = 1, PCMNPAGLIM = 50 } = aspedcoman;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDCOMAN>(['PCMNPAGNUM', 'PCMNPAGLIM']);

        for (const key in aspedcoman) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCOMAN)) continue;

            if (aspedcoman.hasOwnProperty(key) && aspedcoman[key as keyof ASPEDCOMAN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH PCM AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY PCMNID_PCM) AS FLOAT) / @PCMNPAGLIM) AS PCMNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDCOMAN WITH (NOLOCK)
            )
            SELECT * FROM PCM WHERE PCMNPAGNUM = @PCMNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDCOMAN WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcoman, PCMNPAGNUM, PCMNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedcoman: Partial<ASPEDCOMAN>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDCOMAN>(['PCMNID_PCM', 'PCMCUSUCAD', 'PCMDDATCAD', 'PCMCUSUALT', 'PCMDDATALT']);

        for (let key in aspedcoman) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCOMAN)) continue;

            if (aspedcoman[key as keyof ASPEDCOMAN] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedcoman[key as keyof ASPEDCOMAN]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDCOMAN (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedcoman: Partial<ASPEDCOMAN>, whereConditions: Partial<ASPEDCOMAN>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDCOMAN>(['PCMNID_PCM','PCMCUSUCAD', 'PCMDDATCAD', 'PCMCUSUALT', 'PCMDDATALT']);
        
        for (const [key, value] of Object.entries(aspedcoman)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDCOMAN) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDCOMAN
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedcoman, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedcoman: Partial<ASPEDCOMAN>) {
        let conditions: string[] = [];
    
        for (const key in aspedcoman) {
            if (aspedcoman.hasOwnProperty(key) && aspedcoman[key as keyof ASPEDCOMAN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDCOMAN ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcoman }, token });
    }
    
    
}

export default new as_cabcomanService()