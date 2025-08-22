import { as_mssql } from "@root/models";
import { ASPROPRO } from "@root/interfaces";

class as_proService {
    
    async as_get(token: string, aspropro: ASPROPRO = {} as ASPROPRO) {
        const { PRONPAGNUM = 1, PRONPAGLIM = 50 } = aspropro;
        
        //console.log('aspropro: ', aspropro);

        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPROPRO>(['PRONPAGNUM', 'PRONPAGLIM']);

        for (const key in aspropro) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROPRO)) continue;

            if (aspropro.hasOwnProperty(key) && aspropro[key as keyof ASPROPRO] !== undefined) {
             
                // if (key === 'PRONID_PRO') {
                //     aspropro.PROCCONSUL = aspropro.PRONID_PRO;
                // } 
                // else if (key === 'PROCCODPRO') {
                //     aspropro.PROCCONSUL = aspropro.PROCCODPRO;
                // }    
                // else if (key === 'PROCDESCRI') {
                //     aspropro.PROCCONSUL = aspropro.PROCDESCRI;
                //     // conditions.push(`${key} LIKE '${aspropro.PROCDESCRI}%'`);
                // }
                // else if (key === 'PROCDESRES') {
                //     aspropro.PROCCONSUL = aspropro.PROCDESRES;
                //     // conditions.push(`${key} LIKE '${aspropro.PROCDESRES}%'`);
                // }
                // else if (key === 'PROCDESINT') {
                //     aspropro.PROCCONSUL = aspropro.PROCDESINT;
                //     // conditions.push(`${key} LIKE '${aspropro.PROCDESINT}%'`); 
                // } else if (key === 'REFCCODREF') {
                //     aspropro.PROCCONSUL = aspropro.REFCCODREF || '';
                    
                // } else {
                //     conditions.push(`${key} = @${key}`);
                // }

                if (key === 'PROCDESCRI') {
                    conditions.push(`${key} LIKE '${aspropro.PROCDESCRI}%'`);
                }
                else if (key === 'PROCDESRES') {
                    conditions.push(`${key} LIKE '${aspropro.PROCDESRES}%'`);
                }
                else if (key === 'PROCDESINT') {
                    conditions.push(`${key} LIKE '${aspropro.PROCDESINT}%'`); 
                } 
                else if (key === 'PRONNAOVDA') {
                    conditions.push(`ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = @${key}`); 
                } 
                else {
                    conditions.push(`${key} = @${key}`);
                }

            }
        }

        //console.log('conditions: ', conditions);
        const prvcsqlwhr
         = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH PRO AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY PRONID_PRO) AS FLOAT) / @PRONPAGLIM) AS PRONPAGNUM,
                       * 
                FROM AS_CAD..ASPROPRO WITH (NOLOCK)
            )
            SELECT * FROM PRO 
             WHERE PRONPAGNUM = @PRONPAGNUM
            --&&AND ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = 0
             `;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPROPRO WITH (NOLOCK) 
                            ${prvcsqlwhr} 
                            --&&AND ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = 0
                           ORDER BY PROCDESCRI`
        }
            
        // console.log("prvcsqlstr:",prvcsqlstr);
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspropro, PRONPAGNUM, PRONPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspropro: Partial<ASPROPRO>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROPRO>(['PRONID_PRO', 'PROCUSUCAD', 'PRODDATCAD', 'PROCUSUALT', 'PRODDATALT']);

        for (let key in aspropro) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROPRO)) continue;

            if (aspropro[key as keyof ASPROPRO] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspropro[key as keyof ASPROPRO]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROPRO (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspropro: Partial<ASPROPRO>, whereConditions: Partial<ASPROPRO>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROPRO>(['PRONID_PRO','PROCCODPRO', 'PROCUSUCAD', 'PRODDATCAD', 'PROCUSUALT', 'PRODDATALT']);
        
        for (const [key, value] of Object.entries(aspropro)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROPRO) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROPRO
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspropro, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspropro: Partial<ASPROPRO>) {
        let conditions: string[] = [];
    
        for (const key in aspropro) {
            if (aspropro.hasOwnProperty(key) && aspropro[key as keyof ASPROPRO] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROPRO ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspropro }, token });
    }
    
    
}

export default new as_proService()