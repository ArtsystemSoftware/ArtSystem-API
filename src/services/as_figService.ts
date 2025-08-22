import { as_mssql } from "@root/models";
import { ASPROFIG } from "@root/interfaces";

class as_figService {
    
    async as_get(token: string, asprofig: ASPROFIG = {} as ASPROFIG) {
        const { FIGNPAGNUM = 1, FIGNPAGLIM = 50 } = asprofig;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROFIG>(['FIGNPAGNUM', 'FIGNPAGLIM']);

        for (const key in asprofig) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROFIG)) continue;

            if (asprofig.hasOwnProperty(key) && asprofig[key as keyof ASPROFIG] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH FIG AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY FIGNID_FIG) AS FLOAT) / @FIGNPAGLIM) AS FIGNPAGNUM,
                       * 
                FROM AS_CAD..ASPROFIG WITH (NOLOCK)
            )
            SELECT * FROM FIG WHERE FIGNPAGNUM = @FIGNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROFIG WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprofig, FIGNPAGNUM, FIGNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asprofig: Partial<ASPROFIG>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROFIG>(['FIGNID_FIG', 'FIGCUSUCAD', 'FIGDDATCAD', 'FIGCUSUALT', 'FIGDDATALT']);

        for (let key in asprofig) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROFIG)) continue;

            if (asprofig[key as keyof ASPROFIG] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asprofig[key as keyof ASPROFIG]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROFIG (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asprofig: Partial<ASPROFIG>, whereConditions: Partial<ASPROFIG>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROFIG>(['FIGNID_FIG', 'FIGCUSUCAD', 'FIGDDATCAD', 'FIGCUSUALT', 'FIGDDATALT']);
        
        for (const [key, value] of Object.entries(asprofig)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROFIG) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROFIG
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asprofig, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asprofig: Partial<ASPROFIG>) {
        let conditions: string[] = [];
    
        for (const key in asprofig) {
            if (asprofig.hasOwnProperty(key) && asprofig[key as keyof ASPROFIG] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROFIG ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprofig }, token });
    }
    
    
}

export default new as_figService()