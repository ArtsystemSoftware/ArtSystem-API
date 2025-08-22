import { as_mssql } from "@root/models";
import { ASCADGER } from "@root/interfaces";


class as_gerService {
    
    async as_get(token: string, ascadger: ASCADGER = {} as ASCADGER) {
        const { GERNPAGNUM = 1, GERNPAGLIM = 50 } = ascadger;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASCADGER>(['GERNPAGNUM', 'GERNPAGLIM']);

        for (const key in ascadger) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASCADGER)) continue;

            if (ascadger.hasOwnProperty(key) && ascadger[key as keyof ASCADGER] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH GER AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY GERNID_GER) AS FLOAT) / @GERNPAGLIM) AS GERNPAGNUM,
                       * 
                FROM AS_CAD..ASCADGER WITH (NOLOCK)
            )
            SELECT * FROM GER WHERE GERNPAGNUM = @GERNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASCADGER WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...ascadger, GERNPAGNUM, GERNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, ascadger: Partial<ASCADGER>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASCADGER>(['GERNID_GER', 'GERCUSUCAD', 'GERDDATCAD', 'GERCUSUALT', 'GERDDATALT']);

        for (let key in ascadger) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASCADGER)) continue;

            if (ascadger[key as keyof ASCADGER] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = ascadger[key as keyof ASCADGER]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASCADGER (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, ascadger: Partial<ASCADGER>, whereConditions: Partial<ASCADGER>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASCADGER>(['GERNID_GER', 'GERCUSUCAD', 'GERDDATCAD', 'GERCUSUALT', 'GERDDATALT']);
        
        for (const [key, value] of Object.entries(ascadger)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASCADGER) && value !== undefined) {
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
            UPDATE AS_CAD..ASCADGER
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...ascadger, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, ascadger: Partial<ASCADGER>) {
        let conditions: string[] = [];
    
        for (const key in ascadger) {
            if (ascadger.hasOwnProperty(key) && ascadger[key as keyof ASCADGER] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASCADGER ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...ascadger }, token });
    }
    
    
}

export default new as_gerService()