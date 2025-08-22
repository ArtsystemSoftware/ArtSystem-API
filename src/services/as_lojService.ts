import { as_mssql } from "@root/models";
import { ASENTLOJ } from "@root/interfaces";
import { as_tokenService } from "@root/services";

class as_lojService {
    
    async as_get(token: string, asentloj: ASENTLOJ = {} as ASENTLOJ) {
        const { LOJNPAGNUM = 1, LOJNPAGLIM = 50 } = asentloj;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTLOJ>(['LOJNPAGNUM', 'LOJNPAGLIM']);
        const user = await as_tokenService.as_getUser(token);

        for (const key in asentloj) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTLOJ)) continue;

            if (asentloj.hasOwnProperty(key) && asentloj[key as keyof ASENTLOJ] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH LOJ AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY LOJNID_ENT) AS FLOAT) / @LOJNPAGLIM) AS LOJNPAGNUM,
                       * 
                FROM AS_CAD..ASENTLOJ LOJ WITH (NOLOCK) 
           LEFT JOIN AS_CAD..ASENTENT ENT WITH (NOLOCK) ON ENT.ENTNID_ENT = LOJ.LOJNID_ENT 
                WHERE LOJNID_ENT IN (
                    SELECT USLNID_LOJ FROM AS_CAD..ASENTUSU_LOJ WITH (NOLOCK) WHERE USLNID_USU = ${user.recordset[0].APINID_USU}
                )
            )
            SELECT * FROM LOJ WHERE LOJNPAGNUM = @LOJNPAGNUM ORDER BY LOJ.LOJCCODLOJ`;

        } else {
            prvcsqlstr = `
                            SELECT * 
                                 FROM AS_CAD..ASENTLOJ LOJ WITH (NOLOCK) 
                            LEFT JOIN AS_CAD..ASENTENT ENT WITH (NOLOCK) ON ENT.ENTNID_ENT = LOJ.LOJNID_ENT 
                            ${prvcsqlwhr}
                            AND LOJNID_ENT IN (
                                SELECT USLNID_LOJ FROM AS_CAD..ASENTUSU_LOJ WITH (NOLOCK) WHERE USLNID_USU = ${user.recordset[0].APINID_USU}
                            )  
                            ORDER BY LOJ.LOJCCODLOJ 
                            `
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentloj, LOJNPAGNUM, LOJNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asentloj: Partial<ASENTLOJ>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTLOJ>(['LOJCUSUCAD', 'LOJDDATCAD', 'LOJCUSUALT', 'LOJDDATALT']);

        for (let key in asentloj) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTLOJ)) continue;

            if (asentloj[key as keyof ASENTLOJ] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentloj[key as keyof ASENTLOJ]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTLOJ (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentloj: Partial<ASENTLOJ>, whereConditions: Partial<ASENTLOJ>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTLOJ>(['LOJCUSUCAD', 'LOJDDATCAD', 'LOJCUSUALT', 'LOJDDATALT']);
        
        for (const [key, value] of Object.entries(asentloj)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTLOJ) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTLOJ
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentloj, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentloj: Partial<ASENTLOJ>) {
        let conditions: string[] = [];
    
        for (const key in asentloj) {
            if (asentloj.hasOwnProperty(key) && asentloj[key as keyof ASENTLOJ] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTLOJ ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentloj }, token });
    }
    
    
}

export default new as_lojService()