import { as_mssql } from "@root/models";
import { ASAPIPRO_IMG } from "@root/interfaces";


class as_api_proimgtService {
    
    async as_get(asapipro_img: ASAPIPRO_IMG = {} as ASAPIPRO_IMG) {
        const { PIMNPAGNUM = 1, PIMNPAGLIM = 50 } = asapipro_img;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASAPIPRO_IMG>(['PIMNPAGNUM', 'PIMNPAGLIM']);

        for (const key in asapipro_img) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASAPIPRO_IMG)) continue;

            if (asapipro_img.hasOwnProperty(key) && asapipro_img[key as keyof ASAPIPRO_IMG] !== undefined) {
                conditions.push(`${key} = @${key}`);
                
                if (key === 'PIMCCODEAN') {
                    asapipro_img[key] = String(asapipro_img[key as keyof ASAPIPRO_IMG]).trim().padStart(14, '0'); 
                }

            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        prvcsqlstr = `SELECT * FROM AS_API..ASAPIPRO_IMG WITH (NOLOCK) ${prvcsqlwhr}`
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asapipro_img, PIMNPAGNUM, PIMNPAGLIM } });
    
        return reference?.recordset;
    }
    
    async as_Create(asapipro_img: Partial<ASAPIPRO_IMG>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASAPIPRO_IMG>(['PIMCUIDPIM']);

        for (let key in asapipro_img) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASAPIPRO_IMG)) continue;

            if (asapipro_img[key as keyof ASAPIPRO_IMG] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                if (key === 'PIMCCODEAN') {
                    asapipro_img[key] = String(asapipro_img[key as keyof ASAPIPRO_IMG]).trim().padStart(14, '0'); 
                }
                params[key] = asapipro_img[key as keyof ASAPIPRO_IMG]; 
            }

            
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_API..ASAPIPRO_IMG (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params });
    }

    async as_Update(asapipro_img: Partial<ASAPIPRO_IMG>, whereConditions: Partial<ASAPIPRO_IMG>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASAPIPRO_IMG>(['PIMCUIDPIM']);
        
        for (const [key, value] of Object.entries(asapipro_img)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASAPIPRO_IMG) && value !== undefined) {
                updateFields.push(`${key} = @${key}`);
                if (key === 'PIMCCODEAN') {
                    asapipro_img[key] = String(asapipro_img[key as keyof ASAPIPRO_IMG]).trim().padStart(14, '0'); 
                }
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
            UPDATE AS_API..ASAPIPRO_IMG
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asapipro_img, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params });
    }
    
    async as_Delete(asapipro_img: Partial<ASAPIPRO_IMG>) {
        let conditions: string[] = [];
    
        for (const key in asapipro_img) {
            if (asapipro_img.hasOwnProperty(key) && asapipro_img[key as keyof ASAPIPRO_IMG] !== undefined) {
                conditions.push(`${key} = @${key}`);
                if (key === 'PIMCCODEAN') {
                    asapipro_img[key] = String(asapipro_img[key as keyof ASAPIPRO_IMG]).trim().padStart(14, '0'); 
                }
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_API..ASAPIPRO_IMG ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asapipro_img } });
    }
    
    async as_Clean() {
        const query = 'DELETE FROM AS_API..ASAPIPRO_IMG WHERE PIMCURLIMG IS NULL AND PIMDDATCAD < GETDATE() - 1'
        await as_mssql.Assqlexec(query);
    }
    
}

export default new as_api_proimgtService()