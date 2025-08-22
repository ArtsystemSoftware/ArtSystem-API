import { as_mssql } from "@root/models";
import { ASENTUSU_MEN } from "@root/interfaces";

class as_usumenService {
    
    async as_get(token: string, asentusu_men: ASENTUSU_MEN = {} as ASENTUSU_MEN) {
        const { MENNPAGNUM = 1, MENNPAGLIM = 50 } = asentusu_men;
    
        let conditions: string[] = [];
        // const restrictedFields = new Set<keyof ASENTUSU_MEN>(['MENNPAGNUM', 'MENNPAGLIM']);
        const restrictedFields = new Set(Object.keys(asentusu_men));
        
        for (const key in asentusu_men) {
            
            if (restrictedFields.has(key.toUpperCase() as keyof ASENTUSU_MEN)) continue;

            if (asentusu_men.hasOwnProperty(key) && asentusu_men[key as keyof ASENTUSU_MEN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
            
        }
        
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            DECLARE @NID_USU INT = @MENNID_USU
            DECLARE @NID_GRP INT = (SELECT USUNID_GRP FROM AS_CAD..ASENTUSU WITH (NOLOCK) WHERE USUNID_ENT = @NID_USU)

            SELECT  CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CADMEN.MENNID_MEN) AS FLOAT) / @MENNPAGLIM) AS MENNPAGNUM,
                    CADMEN.MENNID_MEN, CADMEN.MENNID_PAI, CADMEN.MENCDESCRI, CADMEN.MENCCOMAND, CADMEN.MENCORDMEN,
                        USUGRP.USGNID_MEN, MENUSU.USMNID_MEN, MENUSU.USMLRETMEN, MENUSU.USMCLIBESP
                FROM AS_CAD..ASCADMEN_VIEW CADMEN WITH (NOLOCK) 
                        LEFT JOIN AS_CAD..ASENTUSU_GRP USUGRP WITH (NOLOCK) ON CADMEN.MENNID_MEN = USUGRP.USGNID_MEN AND USUGRP.USGNID_GRP = @NID_GRP
                        LEFT JOIN AS_CAD..ASENTUSU_MEN MENUSU WITH (NOLOCK) ON CADMEN.MENNID_MEN = MENUSU.USMNID_MEN AND MENUSU.USMNID_USU = @NID_USU
                WHERE	( USUGRP.USGNID_MEN IS NOT NULL AND ISNULL(MENUSU.USMLRETMEN,1) = 1 ) OR 
                        ( MENUSU.USMNID_MEN IS NOT NULL AND ISNULL(MENUSU.USMLRETMEN,1) = 1 )`;
        } else {
            prvcsqlstr = `  DECLARE @NID_USU INT = @MENNID_USU
                            DECLARE @NID_GRP INT = (SELECT USUNID_GRP FROM AS_CAD..ASENTUSU WITH (NOLOCK) WHERE USUNID_ENT = @NID_USU)

                            SELECT	CADMEN.MENNID_MEN, CADMEN.MENNID_PAI, CADMEN.MENCDESCRI, CADMEN.MENCCOMAND, CADMEN.MENCORDMEN,
                                    USUGRP.USGNID_MEN, MENUSU.USMNID_MEN, MENUSU.USMLRETMEN, MENUSU.USMCLIBESP
                                    FROM AS_CAD..ASCADMEN_VIEW CADMEN WITH (NOLOCK) 
                                            LEFT JOIN AS_CAD..ASENTUSU_GRP USUGRP WITH (NOLOCK) ON CADMEN.MENNID_MEN = USUGRP.USGNID_MEN AND USUGRP.USGNID_GRP = @NID_GRP
                                            LEFT JOIN AS_CAD..ASENTUSU_MEN MENUSU WITH (NOLOCK) ON CADMEN.MENNID_MEN = MENUSU.USMNID_MEN AND MENUSU.USMNID_USU = @NID_USU
                                    WHERE	( USUGRP.USGNID_MEN IS NOT NULL AND ISNULL(MENUSU.USMLRETMEN,1) = 1 ) OR 
                                            ( MENUSU.USMNID_MEN IS NOT NULL AND ISNULL(MENUSU.USMLRETMEN,1) = 1 ) ${prvcsqlwhr}
                                            ORDER BY CADMEN.MENCORDMEN`
        }
        
        
        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asentusu_men, MENNPAGNUM, MENNPAGLIM }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asentusu_men: Partial<ASENTUSU_MEN>) {
        throw new Error('Cannot inert values.');
    }

    async as_Update(token: string, asentusu_men: Partial<ASENTUSU_MEN>, whereConditions: Partial<ASENTUSU_MEN>) {
        throw new Error('Cannot update values.');
    }
    
    async as_Delete(token: string, asentusu_men: Partial<ASENTUSU_MEN>) {
        throw new Error('Cannot delete values.');
    }
    
    
}
 
export default new as_usumenService()