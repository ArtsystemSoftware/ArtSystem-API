import { as_mssql } from "@root/models";
import { ASPEDCAB_COM } from "@root/interfaces";

class as_cabcomService {
    
    async as_get(token: string, aspedcab_com: ASPEDCAB_COM = {} as ASPEDCAB_COM) {
        const { CBCNPAGNUM = 1, CBCNPAGLIM = 50 } = aspedcab_com;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDCAB_COM>(['CBCNPAGNUM', 'CBCNPAGLIM']);

        for (const key in aspedcab_com) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_COM)) continue;

            if (aspedcab_com.hasOwnProperty(key) && aspedcab_com[key as keyof ASPEDCAB_COM] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CBC AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CBCNID_CBC) AS FLOAT) / @CBCNPAGLIM) AS CBCNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDCAB_COM WITH (NOLOCK)
            )
            SELECT * FROM CBC WHERE CBCNPAGNUM = @CBCNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDCAB_COM WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_com, CBCNPAGNUM, CBCNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedcab_com: Partial<ASPEDCAB_COM>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDCAB_COM>(['CBCNID_CBC', 'CBCCUSUCAD', 'CBCDDATCAD', 'CBCCUSUALT', 'CBCDDATALT']);

        for (let key in aspedcab_com) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_COM)) continue;

            if (aspedcab_com[key as keyof ASPEDCAB_COM] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedcab_com[key as keyof ASPEDCAB_COM]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDCAB_COM (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedcab_com: Partial<ASPEDCAB_COM>, whereConditions: Partial<ASPEDCAB_COM>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDCAB_COM>(['CBCNID_CBC','CBCNID_ENT','CBCNID_ITE','CBCNID_CAB', 'CBCCUSUCAD', 'CBCDDATCAD', 'CBCCUSUALT', 'CBCDDATALT']);
        
        for (const [key, value] of Object.entries(aspedcab_com)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_COM) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDCAB_COM
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedcab_com, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedcab_com: Partial<ASPEDCAB_COM>) {
        let conditions: string[] = [];
    
        for (const key in aspedcab_com) {
            if (aspedcab_com.hasOwnProperty(key) && aspedcab_com[key as keyof ASPEDCAB_COM] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDCAB_COM ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_com }, token });
    }
    
    
}

export default new as_cabcomService()