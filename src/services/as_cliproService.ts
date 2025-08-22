import { as_mssql } from "@root/models";
import { ASENTCLI_PRO } from "@root/interfaces";

class as_cliproService {
    
    async as_get(token: string, asentcli_pro: ASENTCLI_PRO = {} as ASENTCLI_PRO) {
        const { CLPNPAGNUM = 1, CLPNPAGLIM = 50 } = asentcli_pro;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTCLI_PRO>(['CLPNPAGNUM', 'CLPNPAGLIM']);

        for (const key in asentcli_pro) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCLI_PRO)) continue;

            if (asentcli_pro.hasOwnProperty(key) && asentcli_pro[key as keyof ASENTCLI_PRO] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CLP AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CLPNID_CLP) AS FLOAT) / @CLPNPAGLIM) AS CLPNPAGNUM,
                       * 
                FROM AS_CAD..ASENTCLI_PRO WITH (NOLOCK)
            )
            SELECT * FROM CLP WHERE CLPNPAGNUM = @CLPNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTCLI_PRO WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcli_pro, CLPNPAGNUM, CLPNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asentcli_pro: Partial<ASENTCLI_PRO>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTCLI_PRO>(['CLPNID_CLP','CLPCUSUCAD', 'CLPDDATCAD', 'CLPCUSUALT', 'CLPDDATALT']);

        for (let key in asentcli_pro) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCLI_PRO)) continue;

            if (asentcli_pro[key as keyof ASENTCLI_PRO] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentcli_pro[key as keyof ASENTCLI_PRO]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTCLI_PRO (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentcli_pro: Partial<ASENTCLI_PRO>, whereConditions: Partial<ASENTCLI_PRO>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTCLI_PRO>(['CLPNID_CLP','CLPCUSUCAD', 'CLPDDATCAD', 'CLPCUSUALT', 'CLPDDATALT']);
        
        for (const [key, value] of Object.entries(asentcli_pro)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTCLI_PRO) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTCLI_PRO
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentcli_pro, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentcli_pro: Partial<ASENTCLI_PRO>) {
        let conditions: string[] = [];
    
        for (const key in asentcli_pro) {
            if (asentcli_pro.hasOwnProperty(key) && asentcli_pro[key as keyof ASENTCLI_PRO] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTCLI_PRO ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcli_pro }, token });
    }
    
    
}

export default new as_cliproService()