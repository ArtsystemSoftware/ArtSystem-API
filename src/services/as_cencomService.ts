import { as_mssql } from "@root/models";
import { ASENTCEN_COM } from "@root/interfaces";

class as_cencomService {
    
    async as_get(token: string, asentcen_com: ASENTCEN_COM = {} as ASENTCEN_COM) {
        const { CNCNPAGNUM = 1, CNCNPAGLIM = 50 } = asentcen_com;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTCEN_COM>(['CNCNPAGNUM', 'CNCNPAGLIM']);

        for (const key in asentcen_com) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCEN_COM)) continue;

            if (asentcen_com.hasOwnProperty(key) && asentcen_com[key as keyof ASENTCEN_COM] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CNC AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CNCNID_CNC) AS FLOAT) / @CNCNPAGLIM) AS CNCNPAGNUM,
                       * 
                FROM AS_CAD..ASENTCEN_COM WITH (NOLOCK)
            )
            SELECT * FROM CNC WHERE CNCNPAGNUM = @CNCNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTCEN_COM WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcen_com, CNCNPAGNUM, CNCNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asentcen_com: Partial<ASENTCEN_COM>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTCEN_COM>(['CNCNID_CNC','CNCCUSUCAD', 'CNCDDATCAD','CNCCUSUALT', 'CNCDDATALT']);

        for (let key in asentcen_com) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCEN_COM)) continue;

            if (asentcen_com[key as keyof ASENTCEN_COM] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentcen_com[key as keyof ASENTCEN_COM]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTCEN_COM (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentcen_com: Partial<ASENTCEN_COM>, whereConditions: Partial<ASENTCEN_COM>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTCEN_COM>(['CNCNID_CNC','CNCCUSUCAD', 'CNCDDATCAD','CNCCUSUALT', 'CNCDDATALT']);
        
        for (const [key, value] of Object.entries(asentcen_com)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTCEN_COM) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTCEN_COM
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentcen_com, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentcen_com: Partial<ASENTCEN_COM>) {
        let conditions: string[] = [];
    
        for (const key in asentcen_com) {
            if (asentcen_com.hasOwnProperty(key) && asentcen_com[key as keyof ASENTCEN_COM] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTCEN_COM ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcen_com }, token });
    }
    
    
}

export default new as_cencomService()