import { as_mssql } from "@root/models";
import { ASCEPCEP } from "@root/interfaces";


class as_cepService {
    
    async as_get(token: string, ascepcep: ASCEPCEP = {} as ASCEPCEP) {
        const { CEPNPAGNUM = 1, CEPNPAGLIM = 50 } = ascepcep;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASCEPCEP>(['CEPNPAGNUM', 'CEPNPAGLIM']);

        for (const key in ascepcep) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASCEPCEP)) continue;

            if (ascepcep.hasOwnProperty(key) && ascepcep[key as keyof ASCEPCEP] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CEP AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CEPNID_CEP) AS FLOAT) / @CEPNPAGLIM) AS CEPNPAGNUM,
                       * 
                FROM AS_CAD..ASCEPCEP CEP WITH (NOLOCK)
                LEFT JOIN AS_CAD..ASCADGER LOG WITH (NOLOCK) ON LOG.GERNID_GER = CEP.CEPNID_LOG AND LOG.GERCTIPCAD = 'LOGR'
                LEFT JOIN AS_CAD..ASCEPBAI BAI WITH (NOLOCK) ON BAI.BAINID_BAI = CEP.CEPNID_BAI
                LEFT JOIN AS_CAD..ASCEPMUN MUN WITH (NOLOCK) ON MUN.MUNNID_MUN = BAI.BAINID_MUN
            )
            SELECT * FROM CEP WHERE CEPNPAGNUM = @CEPNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT *   FROM AS_CAD..ASCEPCEP CEP WITH (NOLOCK)
                                LEFT JOIN AS_CAD..ASCADGER LOG WITH (NOLOCK) ON LOG.GERNID_GER = CEP.CEPNID_LOG AND LOG.GERCTIPCAD = 'LOGR'
                                LEFT JOIN AS_CAD..ASCEPBAI BAI WITH (NOLOCK) ON BAI.BAINID_BAI = CEP.CEPNID_BAI
                                LEFT JOIN AS_CAD..ASCEPMUN MUN WITH (NOLOCK) ON MUN.MUNNID_MUN = BAI.BAINID_MUN 
                                ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...ascepcep, CEPNPAGNUM, CEPNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, ascepcep: Partial<ASCEPCEP>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASCEPCEP>(['CEPNID_CEP','CEPCUSUCAD', 'CEPDDATCAD','CEPCUSUALT', 'CEPDDATALT']);

        for (let key in ascepcep) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASCEPCEP)) continue;

            if (ascepcep[key as keyof ASCEPCEP] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = ascepcep[key as keyof ASCEPCEP]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASCEPCEP (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, ascepcep: Partial<ASCEPCEP>, whereConditions: Partial<ASCEPCEP>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASCEPCEP>(['CEPNID_CEP','CEPCUSUCAD', 'CEPDDATCAD','CEPCUSUALT', 'CEPDDATALT']);
        
        for (const [key, value] of Object.entries(ascepcep)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASCEPCEP) && value !== undefined) {
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
            UPDATE AS_CAD..ASCEPCEP
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...ascepcep, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, ascepcep: Partial<ASCEPCEP>) {
        let conditions: string[] = [];
    
        for (const key in ascepcep) {
            if (ascepcep.hasOwnProperty(key) && ascepcep[key as keyof ASCEPCEP] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASCEPCEP ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...ascepcep }, token });
    }
    
    
}

export default new as_cepService()