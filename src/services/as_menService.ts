import { as_mssql } from "@root/models";
import { ASCADMEN } from "@root/interfaces";

class as_menService {
    
    async as_get(token: string, ascadmen: ASCADMEN = {} as ASCADMEN) {
        const { MENNPAGNUM = 1, MENNPAGLIM = 50 } = ascadmen;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASCADMEN>(['MENNPAGNUM', 'MENNPAGLIM']);

        for (const key in ascadmen) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASCADMEN)) continue;

            if (ascadmen.hasOwnProperty(key) && ascadmen[key as keyof ASCADMEN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH MEN AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY MENNID_MEN) AS FLOAT) / @MENNPAGLIM) AS MENNPAGNUM,
                       * 
                FROM AS_CAD..ASCADMEN WITH (NOLOCK)
            )
            SELECT * FROM MEN WHERE MENNPAGNUM = @MENNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASCADMEN WITH (NOLOCK) ${prvcsqlwhr}`
        }
        
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...ascadmen, MENNPAGNUM, MENNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, ascadmen: Partial<ASCADMEN>) {
        throw new Error('Inserting values is not allowed.');
    }

    async as_Update(token: string, ascadmen: Partial<ASCADMEN>, whereConditions: Partial<ASCADMEN>) {
        throw new Error('Updating values is not allowed.');
    }
    
    async as_Delete(token: string, ascadmen: Partial<ASCADMEN>) {
        throw new Error('Deleting values is not allowed.');
    }
    
    
}
 
export default new as_menService()