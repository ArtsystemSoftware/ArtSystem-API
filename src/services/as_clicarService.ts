import { as_mssql } from "@root/models";
import { ASENTCLI_CAR } from "@root/interfaces";

class as_clicarService {
    
    async as_get(token: string, asentcli_car: ASENTCLI_CAR = {} as ASENTCLI_CAR) {
        const { CARNPAGNUM = 1, CARNPAGLIM = 50 } = asentcli_car;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASENTCLI_CAR>(['CARNPAGNUM', 'CARNPAGLIM']);

        for (const key in asentcli_car) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCLI_CAR)) continue;

            if (asentcli_car.hasOwnProperty(key) && asentcli_car[key as keyof ASENTCLI_CAR] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CAR AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CARNID_CAR) AS FLOAT) / @CARNPAGLIM) AS CARNPAGNUM,
                       * 
                FROM AS_CAD..ASENTCLI_CAR WITH (NOLOCK)
            )
            SELECT * FROM CAR WHERE CARNPAGNUM = @CARNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASENTCLI_CAR WITH (NOLOCK) ${prvcsqlwhr}`
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcli_car, CARNPAGNUM, CARNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, asentcli_car: Partial<ASENTCLI_CAR>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASENTCLI_CAR>(['CARNID_CAR','CARCUSUCAD', 'CARDDATCAD', 'CARCUSUALT', 'CARDDATALT']);

        for (let key in asentcli_car) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTCLI_CAR)) continue;

            if (asentcli_car[key as keyof ASENTCLI_CAR] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = asentcli_car[key as keyof ASENTCLI_CAR]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASENTCLI_CAR (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, asentcli_car: Partial<ASENTCLI_CAR>, whereConditions: Partial<ASENTCLI_CAR>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASENTCLI_CAR>(['CARNID_CAR','CARCUSUCAD', 'CARDDATCAD', 'CARCUSUALT', 'CARDDATALT']);
        
        for (const [key, value] of Object.entries(asentcli_car)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASENTCLI_CAR) && value !== undefined) {
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
            UPDATE AS_CAD..ASENTCLI_CAR
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...asentcli_car, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, asentcli_car: Partial<ASENTCLI_CAR>) {
        let conditions: string[] = [];
    
        for (const key in asentcli_car) {
            if (asentcli_car.hasOwnProperty(key) && asentcli_car[key as keyof ASENTCLI_CAR] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASENTCLI_CAR ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentcli_car }, token });
    }
    
    
}

export default new as_clicarService()