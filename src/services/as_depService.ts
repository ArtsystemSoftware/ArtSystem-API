import { as_mssql } from "@root/models";
import { ASPRODEP } from "@root/interfaces";


class as_depService {
    
    async as_get(token: string, asprodep: ASPRODEP = {} as ASPRODEP) {
        const { DEPNPAGNUM = 1, DEPNPAGLIM = 50 } = asprodep;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPRODEP>(['DEPNPAGNUM', 'DEPNPAGLIM']);

        for (const key in asprodep) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPRODEP)) continue;

            if (asprodep.hasOwnProperty(key) && asprodep[key as keyof ASPRODEP] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH DEP AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY DEPNID_DEP) AS FLOAT) / @DEPNPAGLIM) AS DEPNPAGNUM,
                       * 
                FROM AS_CAD..ASPRODEP WITH (NOLOCK)
            )
            SELECT * FROM DEP WHERE DEPNPAGNUM = @DEPNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPRODEP WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprodep, DEPNPAGNUM, DEPNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asprodep: Partial<ASPRODEP>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPRODEP>(['DEPNID_DEP','DEPCUSUCAD', 'DEPDDATCAD','DEPCUSUALT', 'DEPDDATALT']);

        for (let key in asprodep) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPRODEP)) continue;

            if (asprodep[key as keyof ASPRODEP] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asprodep[key as keyof ASPRODEP]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPRODEP (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asprodep: Partial<ASPRODEP>, whereConditions: Partial<ASPRODEP>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPRODEP>(['DEPNID_DEP','DEPCUSUCAD', 'DEPDDATCAD','DEPCUSUALT', 'DEPDDATALT']);
        
        for (const [key, value] of Object.entries(asprodep)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPRODEP) && value !== undefined) {
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
            UPDATE AS_CAD..ASPRODEP
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asprodep, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asprodep: Partial<ASPRODEP>) {
        let conditions: string[] = [];
    
        for (const key in asprodep) {
            if (asprodep.hasOwnProperty(key) && asprodep[key as keyof ASPRODEP] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPRODEP ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asprodep }, token });
    }
    
    
}

export default new as_depService()