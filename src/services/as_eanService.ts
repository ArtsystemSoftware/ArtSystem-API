import { as_mssql } from "@root/models";
import { ASPROEAN } from "@root/interfaces";

class as_eanService {
    
    async as_get(token: string, asproean: ASPROEAN = {} as ASPROEAN) {
        const { EANNPAGNUM = 1, EANNPAGLIM = 50 } = asproean;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROEAN>(['EANNPAGNUM', 'EANNPAGLIM']);

        for (const key in asproean) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROEAN)) continue;

            if (asproean.hasOwnProperty(key) && asproean[key as keyof ASPROEAN] !== undefined) {

                if (key === 'EANNNAOVDA') {
                    conditions.push(`EANNID_PRO IN (
                                        SELECT PRONID_PRO FROM AS_CAD..ASPROPRO WITH (NOLOCK)
                                        WHERE ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = @${key}
                                    )`);

                } else {

                    conditions.push(`${key} = @${key}`);
                }
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH EAN AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY EANNID_EAN) AS FLOAT) / @EANNPAGLIM) AS EANNPAGNUM,
                       * 
                FROM AS_CAD..ASPROEAN WITH (NOLOCK)
            )
            SELECT * FROM EAN 
             WHERE EANNPAGNUM = @EANNPAGNUM
             `;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROEAN WITH (NOLOCK) 
                            ${prvcsqlwhr}
                            /*
                            AND EANNID_PRO IN (
                                SELECT PRONID_PRO FROM AS_CAD..ASPROPRO WITH (NOLOCK)
                                WHERE ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = 0
                            )
                            */
                            `
        }
       
        const response = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproean, EANNPAGNUM, EANNPAGLIM }, token });
    
        return response?.recordset;
    }
    
    async as_Create(token: string, asproean: Partial<ASPROEAN>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROEAN>(['EANNID_EAN', 'EANCUSUCAD', 'EANDDATCAD', 'EANCUSUALT', 'EANDDATALT']);

        for (let key in asproean) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROEAN)) continue;

            if (asproean[key as keyof ASPROEAN] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asproean[key as keyof ASPROEAN]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROEAN (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asproean: Partial<ASPROEAN>, whereConditions: Partial<ASPROEAN>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROEAN>(['EANNID_EAN', 'EANCUSUCAD', 'EANDDATCAD', 'EANCUSUALT', 'EANDDATALT']);
        
        for (const [key, value] of Object.entries(asproean)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROEAN) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROEAN
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asproean, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asproean: Partial<ASPROEAN>) {
        let conditions: string[] = [];
    
        for (const key in asproean) {
            if (asproean.hasOwnProperty(key) && asproean[key as keyof ASPROEAN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROEAN ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproean }, token });
    }
    
    
}

export default new as_eanService()