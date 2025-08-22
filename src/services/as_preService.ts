import { as_mssql } from "@root/models";
import { ASPROEAN, ASPROPRE, ASPROPRO } from "@root/interfaces";

type Aspropre = ASPROPRE & ASPROPRO & ASPROEAN;

class as_preService {
    
    async as_get(token: string, aspropre: Aspropre = {} as Aspropre) {
        const { PRENPAGNUM = 1, PRENPAGLIM = 50 } = aspropre;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof Aspropre>(['PRENPAGNUM', 'PRENPAGLIM']);

        for (const key in aspropre) {
            if (restrictedFields.has(key.toUpperCase() as keyof Aspropre)) continue;

            if (aspropre.hasOwnProperty(key) && aspropre[key as keyof Aspropre] !== undefined) {

                if (key === 'USUNID_ENT') continue; 

                if (key === 'PRONNAOVDA') {
                    conditions.push(`ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = @${key}`);
                } else {
                    conditions.push(`${key} = @${key}`);
                }

            }
        }
    
        // let prvcsqlwhr = ''
        // if (conditions.length > 0) {
        //     prvcsqlwhr = `WHERE PRENVDAATU > 0
		// 					AND ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = 0
        //                     AND ${conditions.join(' AND ')}`;
        // } else {
        //     prvcsqlwhr = `WHERE PRENVDAATU > 0
		// 					AND ISNULL(PROXNAOVDA.query('/PROXNAOVDA/APP').value('.','INT'),0) = 0
        //                     `;
        // }
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // console.log(prvcsqlwhr)
        let prvcsqlstr = `  
                                SELECT 
											CEILING(CAST(ROW_NUMBER() OVER (ORDER BY PRENID_PRE) AS FLOAT) / @PRENPAGLIM) AS PRENPAGNUM,
											(SELECT FIGCTRITIP FROM AS_CAD..AS_PRE_FIG(PRE.PRENIDFIGU,2,NULL)) AS PRECTRITIP,
											PRE.*,
											PRO.PROCCODPRO,
											PRO.PROCCODNCM,
											PRO.PROCDESCRI,
											PRO.PRONID_EMB,
											PRO.PRONPESADO,
											EAN.EANNQTDEMB,
											EAN.EANNID_EAN,
											EST.ESTNESTATU,
											EST.ESTNESTAVA,
											EST.ESTNESTDEP,
											EST.ESTNESTLOJ,
											ASS.ASSNQTDBXA,
											_ESTTOT.ESTNESTTOT,
											FNC.*,
											ISNULL(KIT.KITNQTDITE, 0 ) AS KITNQTDITE,
											ISNULL(KIT.KITNVLRVDA, 0 ) AS KITNVLRVDA,
											ISNULL(PTP.PTPNVDAATU, PRE.PRENVDAATU) AS PTPNVDAATU,
										--	ISNULL(ITE.ITENVLRUNI, PRE.PRENVDAATU) AS ITENVLRUNI,
											ISNULL(NULLIF(PRE.PRENOFEGER,0), PRE.PRENVDAATU) AS PRENOFEATU
                        
												 FROM AS_CAD..ASPROPRE PRE WITH (NOLOCK)
											LEFT JOIN AS_CAD..ASENTFNC FNC WITH (NOLOCK) ON FNC.FNCNID_ENT = PRE.PRENID_FNC
											LEFT JOIN AS_CAD..ASPROASS ASS WITH (NOLOCK) ON ASS.ASSNID_PRO = PRE.PRENID_PRO
											LEFT JOIN AS_CAD..ASPROPRO PRO WITH (NOLOCK) ON PRO.PRONID_PRO = PRE.PRENID_PRO
                        
										  OUTER APPLY ( SELECT TOP 1 *
																FROM AS_CAD..ASPROEAN WITH (NOLOCK)
															   WHERE PRONID_PRO = EANNID_PRO ) EAN
                        
										 OUTER APPLY (SELECT IIF(ISNULL(LFTASS.ASSNID_ASS,0) > 0, FLOOR(ISNULL(ASSEST.ESTNESTATU,0)/IIF(ISNULL(LFTASS.ASSNQTDBXA,0)> 0,ISNULL(LFTASS.ASSNQTDBXA,0), 1)), OUTEST.ESTNESTATU) AS ESTNESTATU,
															 IIF(ISNULL(LFTASS.ASSNID_ASS,0) > 0, FLOOR(ISNULL(ASSEST.ESTNESTAVA,0)/IIF(ISNULL(LFTASS.ASSNQTDBXA,0)> 0,ISNULL(LFTASS.ASSNQTDBXA,0), 1)), OUTEST.ESTNESTAVA) AS ESTNESTAVA,
															 IIF(ISNULL(LFTASS.ASSNID_ASS,0) > 0, FLOOR(ISNULL(ASSEST.ESTNESTDEP,0)/IIF(ISNULL(LFTASS.ASSNQTDBXA,0)> 0,ISNULL(LFTASS.ASSNQTDBXA,0), 1)), OUTEST.ESTNESTDEP) AS ESTNESTDEP,
															 IIF(ISNULL(LFTASS.ASSNID_ASS,0) > 0, FLOOR(ISNULL(ASSEST.ESTNESTLOJ,0)/IIF(ISNULL(LFTASS.ASSNQTDBXA,0)> 0,ISNULL(LFTASS.ASSNQTDBXA,0), 1)), OUTEST.ESTNESTLOJ) AS ESTNESTLOJ
                        
																			FROM AS_CAD..ASPROEST OUTEST WITH (NOLOCK)
																	   LEFT JOIN AS_CAD..ASPROEST ASSEST WITH (NOLOCK) ON ASSEST.ESTNID_PRO = (
																		SELECT ASSNID_PRI FROM AS_CAD..ASPROASS WITH (NOLOCK) WHERE ASSNID_PRO = PRE.PRENID_PRO
																													 )
																													  AND ASSEST.ESTNID_LOJ = PRE.PRENID_LOJ
																	  LEFT JOIN AS_CAD..ASPROASS LFTASS WITH (NOLOCK) ON LFTASS.ASSNID_PRO = PRE.PRENID_PRO
																		   WHERE OUTEST.ESTNID_PRO = PRE.PRENID_PRO
																			 AND OUTEST.ESTNID_LOJ = PRE.PRENID_LOJ
																		   ) AS EST
                        
										  OUTER APPLY ( SELECT	KITNID_PRI, COUNT(DISTINCT KITNID_PRO) AS KITNQTDITE, SUM(KITNQTDVDA*KITNVLRVDA) AS KITNVLRVDA
																FROM AS_CAD..ASPROKIT WITH (NOLOCK)
															   WHERE KITNID_PRI = PRE.PRENID_PRO AND KITCTIPCAD = 'KIT'
															GROUP BY KITNID_PRI ) KIT
                        
										  OUTER APPLY ( SELECT PTPNVDAATU
																FROM AS_CAD..ASPROTAB WITH (NOLOCK)
															   WHERE PTPNID_PRO = PRO.PRONID_PRO
																 AND PTPNID_PTP = @NID_PTP ) PTP

										  OUTER APPLY (SELECT   SUM(IIF(ISNULL(LFTASS.ASSNID_PRO,0) > 0, FLOOR(ISNULL(ASSEST.ESTNESTATU,0)/IIF(ISNULL(LFTASS.ASSNQTDBXA,0)> 0,ISNULL(LFTASS.ASSNQTDBXA,0), 1)), OUTEST.ESTNESTATU)) AS ESTNESTTOT
																  FROM AS_CAD..ASPROEST OUTEST WITH (NOLOCK)
															   LEFT JOIN AS_CAD..ASPROEST ASSEST WITH (NOLOCK) ON ASSEST.ESTNID_PRO = (
																SELECT ASSNID_PRI FROM AS_CAD..ASPROASS WITH (NOLOCK) WHERE ASSNID_PRO = PRE.PRENID_PRO
																											 )
															  LEFT JOIN AS_CAD..ASPROASS LFTASS WITH (NOLOCK) ON LFTASS.ASSNID_PRO = PRE.PRENID_PRO
																   WHERE OUTEST.ESTNID_PRO = PRE.PRENID_PRO
																   ) AS _ESTTOT
                                          /*
										  OUTER APPLY ( SELECT TOP 1 ITENID_CAB, ITENID_PRO, ITENVLRUNI, ITENVLRTAB
															FROM AS_CAD..ASPEDITE	  WITH (NOLOCK)
															JOIN AS_CAD..ASPEDCAB CAB WITH (NOLOCK) ON ITENID_CAB=CABNID_CAB
														   WHERE CABCTIPPED = @CTIPPED
															 AND CABNID_ENT = @NID_ENT
															 AND ITENID_PRO = PRONID_PRO AND CAB.CABCPEDSTA IN ('O','B')
														ORDER BY CABNID_CAB DESC) ITE
                                            */            
                        
											`
        if (prvcsqlwhr) {
            // console.log("prvcsqlwhr: ", prvcsqlwhr);
            prvcsqlstr = `
            DECLARE @NID_ENT INT = (SELECT ENTNID_ENT FROM AS_CAD..ASENTENT WITH (NOLOCK) WHERE ENTNID_ENT = ${aspropre.USUNID_ENT})
            DECLARE @NID_PTP INT = (SELECT CLINID_PTP FROM AS_CAD..ASENTCLI WITH (NOLOCK) WHERE CLINID_ENT = @NID_ENT)
            DECLARE @CTIPPED CHAR(5) = 'VDANF'
            
            ;WITH PRE AS (
                ${prvcsqlstr} ${prvcsqlwhr}
            )
            SELECT * FROM PRE WHERE PRENPAGNUM = @PRENPAGNUM
            ORDER BY PROCDESCRI
            `;

        } else {
            prvcsqlstr = `  DECLARE @NID_ENT INT = (SELECT ENTNID_ENT FROM AS_CAD..ASENTENT WITH (NOLOCK) WHERE ENTNID_ENT = ${aspropre.USUNID_ENT})
                            DECLARE @NID_PTP INT = (SELECT CLINID_PTP FROM AS_CAD..ASENTCLI WITH (NOLOCK) WHERE CLINID_ENT = @NID_ENT)
                            DECLARE @CTIPPED CHAR(5) = 'VDANF'
                            
                            ${prvcsqlstr} ${prvcsqlwhr}
                            ORDER BY PRO.PROCDESCRI
                            `
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspropre, PRENPAGNUM, PRENPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspropre: Partial<ASPROPRE>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPROPRE>(['PRENID_PRE', 'PRECUSUCAD', 'PREDDATCAD', 'PRECUSUALT', 'PREDDATALT']);

        for (let key in aspropre) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROPRE)) continue;

            if (aspropre[key as keyof ASPROPRE] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspropre[key as keyof ASPROPRE]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPROPRE (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspropre: Partial<ASPROPRE>, whereConditions: Partial<ASPROPRE>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPROPRE>(['PRENID_PRE', 'PRECUSUCAD', 'PREDDATCAD', 'PRECUSUALT', 'PREDDATALT']);
        
        for (const [key, value] of Object.entries(aspropre)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPROPRE) && value !== undefined) {
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
            UPDATE AS_CAD..ASPROPRE
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspropre, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspropre: Partial<ASPROPRE>) {
        let conditions: string[] = [];
    
        for (const key in aspropre) {
            if (aspropre.hasOwnProperty(key) && aspropre[key as keyof ASPROPRE] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPROPRE ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspropre }, token });
    }
    
    
}

export default new as_preService()