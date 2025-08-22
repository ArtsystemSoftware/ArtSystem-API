import { as_mssql } from "@root/models";
import { ASPRONUT } from "@root/interfaces";

class as_nutService {
    
    async as_get(token: string, aspronut: ASPRONUT = {} as ASPRONUT) {
        const { NUTNPAGNUM = 1, NUTNPAGLIM = 50 } = aspronut;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPRONUT>(['NUTNPAGNUM', 'NUTNPAGLIM']);

        for (const key in aspronut) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPRONUT)) continue;

            if (aspronut.hasOwnProperty(key) && aspronut[key as keyof ASPRONUT] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH NUT AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY NUTNID_NUT) AS FLOAT) / @NUTNPAGLIM) AS NUTNPAGNUM,
                       * 
                FROM AS_CAD..ASPRONUT WITH (NOLOCK)
            )
            SELECT * FROM NUT WHERE NUTNPAGNUM = @NUTNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPRONUT WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspronut, NUTNPAGNUM, NUTNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspronut: Partial<ASPRONUT>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPRONUT>(['NUTNID_NUT', 'NUTCUSUCAD', 'NUTDDATCAD', 'NUTCUSUALT', 'NUTDDATALT']);

        for (let key in aspronut) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPRONUT)) continue;

            if (aspronut[key as keyof ASPRONUT] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspronut[key as keyof ASPRONUT]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPRONUT (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspronut: Partial<ASPRONUT>, whereConditions: Partial<ASPRONUT>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPRONUT>(['NUTNID_NUT', 'NUTCUSUCAD', 'NUTDDATCAD', 'NUTCUSUALT', 'NUTDDATALT']);
        
        for (const [key, value] of Object.entries(aspronut)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPRONUT) && value !== undefined) {
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
            UPDATE AS_CAD..ASPRONUT
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspronut, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspronut: Partial<ASPRONUT>) {
        let conditions: string[] = [];
    
        for (const key in aspronut) {
            if (aspronut.hasOwnProperty(key) && aspronut[key as keyof ASPRONUT] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPRONUT ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspronut }, token });
    }
    
    
}

export default new as_nutService()