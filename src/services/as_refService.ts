import { as_mssql } from "@root/models";
import { ASPROREF } from "@root/interfaces";

class as_refService {
    
    async as_get(token: string, asproref: ASPROREF = {} as ASPROREF) {
        const { REFNPAGNUM = 1, REFNPAGLIM = 50 } = asproref;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROREF>(['REFNPAGNUM', 'REFNPAGLIM']);

        for (const key in asproref) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROREF)) continue;

            if (asproref.hasOwnProperty(key) && asproref[key as keyof ASPROREF] !== undefined) {
                if (key === 'REFNNAOVDA') {
                    conditions.push(`REFNID_PRO IN (
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
            ;WITH REF AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY REFNID_REF) AS FLOAT) / @REFNPAGLIM) AS REFNPAGNUM,
                       * 
                FROM AS_CAD..ASPROREF WITH (NOLOCK)
            )
            SELECT * FROM REF 
                INNER JOIN AS_CAD..ASCADGER GER 
                ON REF.REFNID_EMB = GER.GERNID_GER 
                AND GER.GERCTIPCAD = 'PROE'
                WHERE REFNPAGNUM = @REFNPAGNUM
               /*
               AND REFNID_PRO IN (
                SELECT PRONID_PRO FROM AS_CAD..ASPROPRO WITH (NOLOCK)
                WHERE ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = 0
               )
               */
            `;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROREF REF WITH (NOLOCK) 
                            INNER JOIN AS_CAD..ASCADGER GER 
                            ON REF.REFNID_EMB = GER.GERNID_GER 
                            ${prvcsqlwhr}
                            AND GER.GERCTIPCAD = 'PROE'
                            /*
                            AND REFNID_PRO IN (
                                SELECT PRONID_PRO FROM AS_CAD..ASPROPRO WITH (NOLOCK)
                                WHERE ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = 0
                            )
                            */
                            `
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproref, REFNPAGNUM, REFNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asproref: Partial<ASPROREF>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROREF>(['REFNID_REF', 'REFCUSUCAD', 'REFDDATCAD', 'REFCUSUALT', 'REFDDATALT']);

        for (let key in asproref) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROREF)) continue;

            if (asproref[key as keyof ASPROREF] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asproref[key as keyof ASPROREF]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROREF (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asproref: Partial<ASPROREF>, whereConditions: Partial<ASPROREF>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROREF>(['REFNID_REF', 'REFCUSUCAD', 'REFDDATCAD', 'REFCUSUALT', 'REFDDATALT']);
        
        for (const [key, value] of Object.entries(asproref)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROREF) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROREF
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asproref, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asproref: Partial<ASPROREF>) {
        let conditions: string[] = [];
    
        for (const key in asproref) {
            if (asproref.hasOwnProperty(key) && asproref[key as keyof ASPROREF] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROREF ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asproref }, token });
    }
    
    
}

export default new as_refService()