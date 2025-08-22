import { as_mssql } from "@root/models";
import { ASENTCLI } from "@root/interfaces";


class as_cliService {
    
    async as_get(token: string, asentcli: ASENTCLI = {} as ASENTCLI) {
        const { CLINPAGNUM = 1, CLINPAGLIM = 50 } = asentcli;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTCLI>(['CLINPAGNUM', 'CLINPAGLIM']);

        for (const key in asentcli) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCLI)) continue;

            if (asentcli.hasOwnProperty(key) && asentcli[key as keyof ASENTCLI] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CLI AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CLINID_ENT) AS FLOAT) / @CLINPAGLIM) AS CLINPAGNUM,
                       * 
                FROM AS_CAD..ASENTCLI WITH (NOLOCK)
            )
            SELECT * FROM CLI WHERE CLINPAGNUM = @CLINPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTCLI WITH (NOLOCK) ${prvcsqlwhr}`
        }
        
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcli, CLINPAGNUM, CLINPAGLIM }, token });
        
        return reference?.recordset;
    }
    
    async as_Create(token: string, asentcli: Partial<ASENTCLI>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTCLI>(['CLICUSUCAD', 'CLIDDATCAD', 'CLICUSUALT', 'CLIDDATALT']);

        for (let key in asentcli) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCLI)) continue;

            if (asentcli[key as keyof ASENTCLI] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentcli[key as keyof ASENTCLI]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTCLI (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentcli: Partial<ASENTCLI>, whereConditions: Partial<ASENTCLI>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTCLI>(['CLICUSUCAD', 'CLIDDATCAD', 'CLICUSUALT', 'CLIDDATALT']);
        
        for (const [key, value] of Object.entries(asentcli)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTCLI) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTCLI
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentcli, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentcli: Partial<ASENTCLI>) {
        let conditions: string[] = [];
    
        for (const key in asentcli) {
            if (asentcli.hasOwnProperty(key) && asentcli[key as keyof ASENTCLI] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTCLI ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcli }, token });
    }
    
    
}

export default new as_cliService()