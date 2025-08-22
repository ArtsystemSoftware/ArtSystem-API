import { as_mssql } from "@root/models";
import { ASPGEPGE } from "@root/interfaces";

class as_pgeService {
    
    async as_get(token: string, aspgepge: ASPGEPGE = {} as ASPGEPGE) {
        const { PGENPAGNUM = 1, PGENPAGLIM = 50 } = aspgepge;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPGEPGE>(['PGENPAGNUM', 'PGENPAGLIM']);

        for (const key in aspgepge) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPGEPGE)) continue;

            if (aspgepge.hasOwnProperty(key) && aspgepge[key as keyof ASPGEPGE] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH PGE AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY PGENID_PGE) AS FLOAT) / @PGENPAGLIM) AS PGENPAGNUM,
                       * 
                FROM AS_CAD..ASPGEPGE WITH (NOLOCK)
            )
            SELECT * FROM PGE WHERE PGENPAGNUM = @PGENPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPGEPGE WITH (NOLOCK) ${prvcsqlwhr}`
        }
        
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspgepge, PGENPAGNUM, PGENPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, aspgepge: Partial<ASPGEPGE>) {
        throw new Error('Inserting values is not allowed.');
    }

    async as_Update(token: string, aspgepge: Partial<ASPGEPGE>, whereConditions: Partial<ASPGEPGE>) {
        throw new Error('Updating values is not allowed.');
    }
    
    async as_Delete(token: string, aspgepge: Partial<ASPGEPGE>) {
        throw new Error('Deleting values is not allowed.');
    }
    
    
}
 
export default new as_pgeService()