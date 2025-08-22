import { as_mssql } from "@root/models";
import { ASENTUSU_LOJ } from "@root/interfaces";

class as_usulojService {
    
    async as_get(token: string, asentusu_loj: ASENTUSU_LOJ = {} as ASENTUSU_LOJ) {
        // const { VENNPAGNUM = 1, VENNPAGLIM = 50 } = asentusu_loj;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTUSU_LOJ>(['USLCUSUCAD', 'USLCUSUALT']);

        for (const key in asentusu_loj) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTUSU_LOJ)) continue;

            if (asentusu_loj.hasOwnProperty(key) && asentusu_loj[key as keyof ASENTUSU_LOJ] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr 
        prvcsqlstr = `
                        SELECT  ENT.*, LOJ.*, USL.*
                             FROM AS_CAD..ASENTUSU_LOJ  USL WITH (NOLOCK) 
                        LEFT JOIN AS_CAD..ASENTENT      ENT WITH (NOLOCK) ON USL.USLNID_LOJ = ENT.ENTNID_ENT
                        LEFT JOIN AS_CAD..ASENTLOJ      LOJ WITH (NOLOCK) ON USL.USLNID_LOJ = LOJ.LOJNID_ENT
                        ${prvcsqlwhr}
                        ORDER BY USL.USLNLOJPRI DESC, LOJ.LOJCCODLOJ
                        `
            
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentusu_loj }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asentusu_loj: Partial<ASENTUSU_LOJ>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTUSU_LOJ>(['USLCUSUCAD', 'USLDDATCAD', 'USLCUSUALT', 'USLDDATALT']);

        for (let key in asentusu_loj) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTUSU_LOJ)) continue;

            if (asentusu_loj[key as keyof ASENTUSU_LOJ] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentusu_loj[key as keyof ASENTUSU_LOJ]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTUSU_LOJ (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentusu_loj: Partial<ASENTUSU_LOJ>, whereConditions: Partial<ASENTUSU_LOJ>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTUSU_LOJ>(['USLCUSUCAD', 'USLDDATCAD', 'USLCUSUALT', 'USLDDATALT']);
        
        for (const [key, value] of Object.entries(asentusu_loj)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTUSU_LOJ) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTUSU_LOJ
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentusu_loj, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentusu_loj: Partial<ASENTUSU_LOJ>) {
        let conditions: string[] = [];
    
        for (const key in asentusu_loj) {
            if (asentusu_loj.hasOwnProperty(key) && asentusu_loj[key as keyof ASENTUSU_LOJ] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTUSU_LOJ ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentusu_loj }, token });
    }
    
    
}

export default new as_usulojService()