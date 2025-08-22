import { as_mssql } from "@root/models";
import { ASENTENT } from "@root/interfaces";


class as_entService {
    
    async as_get(token: string, asentent: ASENTENT = {} as ASENTENT) {
        const { ENTNPAGNUM = 1, ENTNPAGLIM = 50 } = asentent;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTENT>(['ENTNPAGNUM', 'ENTNPAGLIM']);

        for (const key in asentent) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTENT)) continue;

            if (asentent.hasOwnProperty(key) && asentent[key as keyof ASENTENT] !== undefined) {
                // conditions.push(`${key} = @${key}`);

                 if (key === 'ENTCNOMENT') {
                    conditions.push(`${key} LIKE '${asentent.ENTCNOMENT}%'`);
                }
                else if (key === 'ENTCAPELID') {
                    conditions.push(`${key} LIKE '${asentent.ENTCAPELID}%'`);
                } else {
                    conditions.push(`${key} = @${key}`);
                }

            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH ENT AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY ENTNID_ENT) AS FLOAT) / @ENTNPAGLIM) AS ENTNPAGNUM,
                       * 
                FROM AS_CAD..ASENTENT WITH (NOLOCK)
            )
            SELECT * FROM ENT WHERE ENTNPAGNUM = @ENTNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTENT WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentent, ENTNPAGNUM, ENTNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asentent: Partial<ASENTENT>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTENT>(['ENTNID_ENT','ENTCUSUCAD', 'ENTDDATCAD','ENTCUSUALT', 'ENTDDATALT']);

        for (let key in asentent) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTENT)) continue;

            if (asentent[key as keyof ASENTENT] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentent[key as keyof ASENTENT]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTENT (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentent: Partial<ASENTENT>, whereConditions: Partial<ASENTENT>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTENT>(['ENTNID_ENT','ENTCUSUCAD', 'ENTDDATCAD','ENTCUSUALT', 'ENTDDATALT']);
        
        for (const [key, value] of Object.entries(asentent)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTENT) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTENT
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentent, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentent: Partial<ASENTENT>) {
        let conditions: string[] = [];
    
        for (const key in asentent) {
            if (asentent.hasOwnProperty(key) && asentent[key as keyof ASENTENT] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTENT ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentent }, token });
    }
    
    
}

export default new as_entService()