import { as_mssql } from "@root/models";
import { ASPEDITE_ENT_ITE } from "@root/interfaces";

class as_iteentService {
    
    async as_get(token: string, aspedite_ent_ite: ASPEDITE_ENT_ITE = {} as ASPEDITE_ENT_ITE) {
        const { IETNPAGNUM = 1, IETNPAGLIM = 50 } = aspedite_ent_ite;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDITE_ENT_ITE>(['IETNPAGNUM', 'IETNPAGLIM']);

        for (const key in aspedite_ent_ite) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_ENT_ITE)) continue;

            if (aspedite_ent_ite.hasOwnProperty(key) && aspedite_ent_ite[key as keyof ASPEDITE_ENT_ITE] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH IET AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY IETNID_IET) AS FLOAT) / @IETNPAGLIM) AS IETNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDITE_ENT_ITE WITH (NOLOCK)
            )
            SELECT * FROM IET WHERE IETNPAGNUM = @IETNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDITE_ENT_ITE WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_ent_ite, IETNPAGNUM, IETNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedite_ent_ite: Partial<ASPEDITE_ENT_ITE>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDITE_ENT_ITE>(['IETNID_IET','IETCUSUCAD', 'IETDDATCAD', 'IETCUSUALT', 'IETDDATALT']);

        for (let key in aspedite_ent_ite) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_ENT_ITE)) continue;

            if (aspedite_ent_ite[key as keyof ASPEDITE_ENT_ITE] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedite_ent_ite[key as keyof ASPEDITE_ENT_ITE]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDITE_ENT_ITE (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedite_ent_ite: Partial<ASPEDITE_ENT_ITE>, whereConditions: Partial<ASPEDITE_ENT_ITE>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDITE_ENT_ITE>(['IETNID_IET','IETCUSUCAD', 'IETDDATCAD', 'IETCUSUALT', 'IETDDATALT']);
        
        for (const [key, value] of Object.entries(aspedite_ent_ite)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDITE_ENT_ITE) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDITE_ENT_ITE
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedite_ent_ite, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedite_ent_ite: Partial<ASPEDITE_ENT_ITE>) {
        let conditions: string[] = [];
    
        for (const key in aspedite_ent_ite) {
            if (aspedite_ent_ite.hasOwnProperty(key) && aspedite_ent_ite[key as keyof ASPEDITE_ENT_ITE] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDITE_ENT_ITE ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedite_ent_ite }, token });
    }
    
    
}
export default new as_iteentService()