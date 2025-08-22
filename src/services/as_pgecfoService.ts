import { as_mssql } from "@root/models";
import { ASPGECFO } from "@root/interfaces";

class as_pgecfoService {
    
    async as_get(token: string, aspgecfo: ASPGECFO = {} as ASPGECFO) {
        const { PCFNPAGNUM = 1, PCFNPAGLIM = 50 } = aspgecfo;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPGECFO>(['PCFNPAGNUM', 'PCFNPAGLIM']);

        for (const key in aspgecfo) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPGECFO)) continue;

            if (aspgecfo.hasOwnProperty(key) && aspgecfo[key as keyof ASPGECFO] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH PGE AS (
                SELECT CEILING(CAST(ROW_NUMBER() OVER (ORDER BY PCFNID_PCF) AS FLOAT) / @PCFNPAGLIM) AS PCFNPAGNUM,
                       * 
                FROM AS_CAD..ASPGECFO WITH (NOLOCK)
            )
            SELECT * FROM PGE WHERE PCFNPAGNUM = @PCFNPAGNUM`;

        } else {
            prvcsqlstr = `SELECT * FROM AS_CAD..ASPGECFO WITH (NOLOCK) ${prvcsqlwhr}`
        }
        
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspgecfo, PCFNPAGNUM, PCFNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, aspgecfo: Partial<ASPGECFO>) {
        throw new Error('Inserting values is not allowed.');
    }

    async as_Update(token: string, aspgecfo: Partial<ASPGECFO>, whereConditions: Partial<ASPGECFO>) {
        throw new Error('Updating values is not allowed.');
    }
    
    async as_Delete(token: string, aspgecfo: Partial<ASPGECFO>) {
        throw new Error('Deleting values is not allowed.');
    }
    
    
}
 
export default new as_pgecfoService()