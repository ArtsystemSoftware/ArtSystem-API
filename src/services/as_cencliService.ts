import { as_mssql } from "@root/models";
import { ASENTCEN_CLI } from "@root/interfaces";

class as_cencliService {
    
    async as_get(token: string, asentcen_cli: ASENTCEN_CLI = {} as ASENTCEN_CLI) {
        const { CCLNPAGNUM = 1, CCLNPAGLIM = 50 } = asentcen_cli;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTCEN_CLI>(['CCLNPAGNUM', 'CCLNPAGLIM']);

        for (const key in asentcen_cli) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCEN_CLI)) continue;

            if (asentcen_cli.hasOwnProperty(key) && asentcen_cli[key as keyof ASENTCEN_CLI] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CCL AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CCLNID_CCL) AS FLOAT) / @CCLNPAGLIM) AS CCLNPAGNUM,
                       * 
                FROM AS_CAD..ASENTCEN_CLI WITH (NOLOCK)
            )
            SELECT * FROM CCL WHERE CCLNPAGNUM = @CCLNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTCEN_CLI WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcen_cli, CCLNPAGNUM, CCLNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asentcen_cli: Partial<ASENTCEN_CLI>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTCEN_CLI>(['CCLNID_CCL','CCLCUSUCAD', 'CCLDDATCAD','CCLCUSUALT', 'CCLDDATALT']);

        for (let key in asentcen_cli) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCEN_CLI)) continue;

            if (asentcen_cli[key as keyof ASENTCEN_CLI] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentcen_cli[key as keyof ASENTCEN_CLI]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTCEN_CLI (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentcen_cli: Partial<ASENTCEN_CLI>, whereConditions: Partial<ASENTCEN_CLI>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTCEN_CLI>(['CCLNID_CCL','CCLCUSUCAD', 'CCLDDATCAD','CCLCUSUALT', 'CCLDDATALT']);
        
        for (const [key, value] of Object.entries(asentcen_cli)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTCEN_CLI) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTCEN_CLI
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentcen_cli, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentcen_cli: Partial<ASENTCEN_CLI>) {
        let conditions: string[] = [];
    
        for (const key in asentcen_cli) {
            if (asentcen_cli.hasOwnProperty(key) && asentcen_cli[key as keyof ASENTCEN_CLI] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTCEN_CLI ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcen_cli }, token });
    }
    
    
}

export default new as_cencliService()