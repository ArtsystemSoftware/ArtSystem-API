import { as_mssql } from "@root/models";
import { ASPEDCAB_OS_ITE } from "@root/interfaces";

class as_cabiosService {
    
    async as_get(token: string, aspedcab_os_ite: ASPEDCAB_OS_ITE = {} as ASPEDCAB_OS_ITE) {
        const { IOSNPAGNUM = 1, IOSNPAGLIM = 50 } = aspedcab_os_ite;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDCAB_OS_ITE>(['IOSNPAGNUM', 'IOSNPAGLIM']);

        for (const key in aspedcab_os_ite) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_OS_ITE)) continue;

            if (aspedcab_os_ite.hasOwnProperty(key) && aspedcab_os_ite[key as keyof ASPEDCAB_OS_ITE] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH IOS AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY IOSNID_IOS) AS FLOAT) / @IOSNPAGLIM) AS IOSNPAGNUM,
                       * 
                FROM AS_CAD..ASPEDCAB_OS_ITE WITH (NOLOCK)
            )
            SELECT * FROM IOS WHERE IOSNPAGNUM = @IOSNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPEDCAB_OS_ITE WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_os_ite, IOSNPAGNUM, IOSNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedcab_os_ite: Partial<ASPEDCAB_OS_ITE>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDCAB_OS_ITE>(['IOSNID_IOS', 'IOSCUSUCAD', 'IOSDDATCAD', 'IOSCUSUALT', 'IOSDDATALT']);

        for (let key in aspedcab_os_ite) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_OS_ITE)) continue;

            if (aspedcab_os_ite[key as keyof ASPEDCAB_OS_ITE] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedcab_os_ite[key as keyof ASPEDCAB_OS_ITE]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDCAB_OS_ITE (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedcab_os_ite: Partial<ASPEDCAB_OS_ITE>, whereConditions: Partial<ASPEDCAB_OS_ITE>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDCAB_OS_ITE>(['IOSNID_IOS','IOSCUSUCAD', 'IOSDDATCAD', 'IOSCUSUALT', 'IOSDDATALT']);
        
        for (const [key, value] of Object.entries(aspedcab_os_ite)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB_OS_ITE) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDCAB_OS_ITE
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedcab_os_ite, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedcab_os_ite: Partial<ASPEDCAB_OS_ITE>) {
        let conditions: string[] = [];
    
        for (const key in aspedcab_os_ite) {
            if (aspedcab_os_ite.hasOwnProperty(key) && aspedcab_os_ite[key as keyof ASPEDCAB_OS_ITE] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDCAB_OS_ITE ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab_os_ite }, token });
    }
    
    
}

export default new as_cabiosService()