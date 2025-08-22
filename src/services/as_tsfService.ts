import { as_mssql } from "@root/models";
import { ASTESFIN } from "@root/interfaces";


class as_tsfService {
    
    async as_get(token: string, astesfin: ASTESFIN = {} as ASTESFIN) {
        const { TSFNPAGNUM = 1, TSFNPAGLIM = 50 } = astesfin;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASTESFIN>(['TSFNPAGNUM', 'TSFNPAGLIM']);

        for (const key in astesfin) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASTESFIN)) continue;

            if (astesfin.hasOwnProperty(key) && astesfin[key as keyof ASTESFIN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
                ;WITH TSF AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY TSFNID_TSF) AS FLOAT) / @TSFNPAGLIM) AS TSFNPAGNUM,
                       * 
                        FROM AS_CAD..ASTESFIN FIN WITH (NOLOCK)
                    LEFT JOIN AS_CAD..ASCADGER GER WITH (NOLOCK) ON GER.GERNID_GER = FIN.TSFNID_FIN
                )
                SELECT * FROM TSF WHERE TSFNPAGNUM = @TSFNPAGNUM
            `;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASTESFIN FIN WITH (NOLOCK)
                              LEFT JOIN AS_CAD..ASCADGER GER WITH (NOLOCK) ON GER.GERNID_GER = FIN.TSFNID_FIN
                              ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...astesfin, TSFNPAGNUM, TSFNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, astesfin: Partial<ASTESFIN>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASTESFIN>(['TSFNID_TSF', 'TSFCUSUCAD', 'TSFDDATCAD', 'TSFCUSUALT', 'TSFDDATALT']);

        for (let key in astesfin) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASTESFIN)) continue;

            if (astesfin[key as keyof ASTESFIN] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = astesfin[key as keyof ASTESFIN]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASTESFIN (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, astesfin: Partial<ASTESFIN>, whereConditions: Partial<ASTESFIN>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASTESFIN>(['TSFNID_TSF', 'TSFCUSUCAD', 'TSFDDATCAD', 'TSFCUSUALT', 'TSFDDATALT']);
        
        for (const [key, value] of Object.entries(astesfin)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASTESFIN) && value !== undefined) {
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
            UPDATE AS_CAD..ASTESFIN
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...astesfin, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, astesfin: Partial<ASTESFIN>) {
        let conditions: string[] = [];
    
        for (const key in astesfin) {
            if (astesfin.hasOwnProperty(key) && astesfin[key as keyof ASTESFIN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASTESFIN ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...astesfin }, token });
    }
    
    
}

export default new as_tsfService()