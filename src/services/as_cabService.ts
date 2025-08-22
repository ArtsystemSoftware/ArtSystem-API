import { as_mssql } from "@root/models";
import { ASPEDCAB } from "@root/interfaces";
import { as_Date } from "@root/utils";


class as_cabService {
    
    async as_get(token: string, aspedcab: ASPEDCAB = {} as ASPEDCAB) {
        const { CABNPAGNUM = 1, CABNPAGLIM = 50 } = aspedcab;
    
        let conditions: string[] = [];
        const restrictedFields = new Set<keyof ASPEDCAB>(['CABNPAGNUM', 'CABNPAGLIM']);

        // console.log('cabddatcad: ', aspedcab.CABDDATCAD);
        for (const key in aspedcab) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB)) continue;

            if (aspedcab.hasOwnProperty(key) && aspedcab[key as keyof ASPEDCAB] !== undefined) {
                if (key === 'CABDDATCAD') {

                    let init = aspedcab.CABDDATCAD?.toString().split(' ')[0];
                    let end = aspedcab.CABDDATCAD?.toString().split(' ')[1] || aspedcab.CABDDATCAD?.toString().split(' ')[0].split('T')[0];
                    init = `${init.split('T')[0]}T${init.split('T')[1] ||'00:00:00'}`
                    end = `${end.split('T')[0]}T${end.split('T')[1] ||'23:59:59'}`

                    conditions.push(`${key} BETWEEN '${init}' AND '${end}'`);

                } else if (key === 'CABCTIPPED') {

                    const cabctipped = aspedcab.CABCTIPPED.split(" ").map(cabctipped => `'${cabctipped}'`).join(",");   

                    conditions.push(`${key} IN (${cabctipped})`);
                } else if (key === 'CABCPEDSTA') {
                    const cabcpedsta = aspedcab.CABCPEDSTA.split(" ").map(cabcpedsta => `'${cabcpedsta}'`).join(",");
                    conditions.push(`${key} IN (${cabcpedsta})`);
                } else {
                    conditions.push(`${key} = @${key}`);
                }
                
            }
        }
    
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr
        if (!prvcsqlwhr) {
            prvcsqlstr = `
            ;WITH CAB AS (
                SELECT	CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CABNID_CAB) AS FLOAT) / @CABNPAGLIM) AS CABNPAGNUM,
                        CAB.CABNID_CAB, CAB.CABCPEDSTA, CAB.CABDDATCAD, CAB.CABCUSUCAD, CAB.CABCTIPPED, CAB.CABCTIPENT, CAB.CABNID_ENT, CAB.CABC_PLACA,
                                    CONVERT(VARCHAR(50), 
                                        CASE WHEN ITE.CABNTOTPED - CAF.CAFNVLRFIN > 0 
                                            THEN 'Pendente: '+CONVERT(VARCHAR(16),ITE.CABNTOTPED-CAF.CAFNVLRFIN)+' Pago: '+CONVERT(VARCHAR(16),CAF.CAFNVLRFIN)
                                            ELSE
                                            CASE CABCPEDSTA 
                                                WHEN 'A' THEN 
                                                    CASE WHEN CAB.CABCTIPPED = 'ORCAM' AND PGE.PGENDIGAMB = 1 THEN 'Venda em Andamento' ELSE 'Aberto' END
                                                WHEN 'U' THEN 'Ordem de Produção'
                                                WHEN 'F' THEN 'Aguardando Aprovação'
                                                WHEN 'P' THEN 'Aprovado'
                                                WHEN 'G' THEN 'Aguardando Gerar NF'
                                                WHEN 'I' THEN 'Aguardando Venda no PDV'
                                                WHEN 'R' THEN 'Reprocessar'
                                                WHEN 'B' THEN 'Baixado'
                                                WHEN 'E' THEN 'Excluído'
                                                WHEN 'C' THEN 'Cancelado'
                                                WHEN 'O' THEN 'OK'
                                                ELSE ' ' END 
                                            END ) AS CABCSTATUS,
                                    'Veículo: '+CAR.CARCPLACAR+' Modelo: '+LTRIM(RTRIM(CAR.CARCMODCAR)) AS CABVEICULO,
                                    CAB.CABCOBSERV, CAB.CABCCONPAG, ENT.ENTCNOMENT, ENT.ENTCAPELID, ENT.ENTCCODCPF, TEL.TELNNUMTEL, 
                                    ITE.CABNTOTPED, AMB.AMBNTOTPED, ITE.CABNTOTPMZ, 
                                    CAF.CAFNVLRFIN, CAR.CARCMARCAR, CAR.CARNANOCAR, CAR.CARNMODCAR,
                                    DATEDIFF(SS,CAB.CABDDATCAD,GETDATE()) AS CABC_TEMPO, CAB.CABDPROENT,
                                    ISNULL(VEN.ENTCAPELID,'') AS VENCAPELID, ISNULL(VEN.ENTCNOMENT,'') AS VENCNOMENT,
                                    PGE.PGENIMPAJU, PGE.PGENDIGAMB, PGE.PGECDESCRI, PGE.PGENEMI_NF, PGE.PGENATUEST, PGE.PGENATUFIN
                            FROM AS_CAD..ASPEDCAB CAB WITH (NOLOCK) 
                                LEFT JOIN AS_CAD..ASENTENT     ENT WITH (NOLOCK) ON CAB.CABNID_ENT = ENT.ENTNID_ENT
                                LEFT JOIN AS_CAD..ASENTENT     VEN WITH (NOLOCK) ON CAB.CABNID_VEN = VEN.ENTNID_ENT
                                LEFT JOIN AS_CAD..ASPGEPGE     PGE WITH (NOLOCK) ON CAB.CABNID_PGE = PGE.PGENID_PGE
                                LEFT JOIN AS_CAD..ASENTCLI_CAR CAR WITH (NOLOCK) ON ENT.ENTNID_ENT = CAR.CARNID_CLI AND CAB.CABC_PLACA = CAR.CARCPLACAR
                                
                                OUTER APPLY (
                                        SELECT	ISNULL(SUM( ROUND((IAM.IAMNQUANTI*IAM.IAMNVLRUNI),2)+ITE.ITENST_VLR+ITE.ITENTOTIPI+ITE.ITENTOTDAC+ITE.ITENTOTENC+ITE.ITENTOTFRE-(ITE.ITENTOTDES+ITE.ITENTOTBON)),0) AS AMBNTOTPED,
                                                ISNULL(SUM( ROUND((IAM.IAMNQUANTI*PRE.PRENVDAPMZ),2)+ITE.ITENST_VLR+ITE.ITENTOTIPI+ITE.ITENTOTDAC+ITE.ITENTOTENC+ITE.ITENTOTFRE-(ITE.ITENTOTDES+ITE.ITENTOTBON)),0) AS AMBNTOTPMZ
                                            FROM AS_CAD..ASPEDITE		ITE WITH (NOLOCK)
                                                LEFT JOIN AS_CAD..ASPEDITE_AMB	IAM WITH (NOLOCK) ON ITE.ITENID_PRO = IAM.IAMNID_PRO AND ITE.ITENID_CAB = IAM.IAMNID_CAB
                                                LEFT JOIN AS_CAD..ASPROPRE PRE WITH (NOLOCK) ON ITE.ITENID_PRO = PRE.PRENID_PRO AND PRE.PRENID_LOJ = 1
                                                OUTER APPLY ( SELECT KITNID_PRI, COUNT(DISTINCT KITNID_PRO) AS KITNQTDITE
                                                                FROM AS_CAD..ASPROKIT WITH (NOLOCK) WHERE KITNID_PRI = ITE.ITENID_PRO AND KITCTIPCAD = 'KIT' GROUP BY KITNID_PRI ) KIT
                                            WHERE ITE.ITENID_CAB = CAB.CABNID_CAB AND ISNULL(KIT.KITNQTDITE,0)=0 
                                        ) AMB

                                OUTER APPLY (
                                    SELECT	SUM( ROUND((ITE.ITENQUANTI*ITE.ITENVLRUNI),2)+ITE.ITENST_VLR+ITE.ITENTOTIPI+ITE.ITENTOTDAC+ITE.ITENTOTENC+ITE.ITENTOTFRE-(ITE.ITENTOTDES+ITE.ITENTOTBON)) AS CABNTOTPED,
                                            CONVERT(NUMERIC(14,2),0) AS CABNTOTPMZ
                                        FROM AS_CAD..ASPEDITE ITE WITH (NOLOCK)
                                            OUTER APPLY ( SELECT KITNID_PRI, COUNT(DISTINCT KITNID_PRO) AS KITNQTDITE
                                                            FROM AS_CAD..ASPROKIT WITH (NOLOCK) WHERE KITNID_PRI = ITE.ITENID_PRO AND KITCTIPCAD = 'KIT' GROUP BY KITNID_PRI ) KIT
                                        WHERE ITE.ITENID_CAB = CAB.CABNID_CAB AND ISNULL(KIT.KITNQTDITE,0)=0 
                                    ) ITE
                                
                                OUTER APPLY ( 
                                        SELECT SUM(CAFNVLRFIN - CAFNVLRTRO) AS CAFNVLRFIN FROM AS_CAD..ASPEDCAB_FIN WITH (NOLOCK) WHERE CAFNID_CAB = CAB.CABNID_CAB 
                                        ) CAF

                                OUTER APPLY ( 
                                        SELECT TOP 1 TELNCODDDD, TELNNUMTEL FROM AS_CAD..ASENTTEL WITH (NOLOCK) WHERE TELNID_ENT = CAB.CABNID_ENT 
                                        ) TEL 
            )
            SELECT * FROM CAB WHERE CABNPAGNUM = @CABNPAGNUM
             ORDER BY CAB.CABDDATCAD DESC
            `;

        } else {
            prvcsqlstr = `SELECT	CEILING(CAST(ROW_NUMBER() OVER (ORDER BY CABNID_CAB) AS FLOAT) / @CABNPAGLIM) AS CABNPAGNUM,
		CAB.CABNID_CAB, CAB.CABCPEDSTA, CAB.CABDDATCAD, CAB.CABCUSUCAD, CAB.CABCTIPPED, CAB.CABCTIPENT, CAB.CABNID_ENT, CAB.CABC_PLACA,
					CONVERT(VARCHAR(50), 
						CASE WHEN ITE.CABNTOTPED - CAF.CAFNVLRFIN > 0 
							THEN 'Pendente: '+CONVERT(VARCHAR(16),ITE.CABNTOTPED-CAF.CAFNVLRFIN)+' Pago: '+CONVERT(VARCHAR(16),CAF.CAFNVLRFIN)
							ELSE
							CASE CABCPEDSTA 
								WHEN 'A' THEN 
									CASE WHEN CAB.CABCTIPPED = 'ORCAM' AND PGE.PGENDIGAMB = 1 THEN 'Venda em Andamento' ELSE 'Aberto' END
								WHEN 'U' THEN 'Ordem de Produção'
								WHEN 'F' THEN 'Aguardando Aprovação'
								WHEN 'P' THEN 'Aprovado'
								WHEN 'G' THEN 'Aguardando Gerar NF'
								WHEN 'I' THEN 'Aguardando Venda no PDV'
								WHEN 'R' THEN 'Reprocessar'
								WHEN 'B' THEN 'Baixado'
								WHEN 'E' THEN 'Excluído'
								WHEN 'C' THEN 'Cancelado'
								WHEN 'O' THEN 'OK'
								ELSE ' ' END 
							END ) AS CABCSTATUS,
					'Veículo: '+CAR.CARCPLACAR+' Modelo: '+LTRIM(RTRIM(CAR.CARCMODCAR)) AS CABVEICULO,
					CAB.CABCOBSERV, CAB.CABCCONPAG, ENT.ENTCNOMENT, ENT.ENTCAPELID, ENT.ENTCCODCPF, TEL.TELNNUMTEL, 
					ITE.CABNTOTPED, AMB.AMBNTOTPED, ITE.CABNTOTPMZ, 
					CAF.CAFNVLRFIN, CAR.CARCMARCAR, CAR.CARNANOCAR, CAR.CARNMODCAR,
					DATEDIFF(SS,CAB.CABDDATCAD,GETDATE()) AS CABC_TEMPO, CAB.CABDPROENT,
					ISNULL(VEN.ENTCAPELID,'') AS VENCAPELID, ISNULL(VEN.ENTCNOMENT,'') AS VENCNOMENT,
					PGE.PGENIMPAJU, PGE.PGENDIGAMB, PGE.PGECDESCRI, PGE.PGENEMI_NF, PGE.PGENATUEST, PGE.PGENATUFIN
			FROM AS_CAD..ASPEDCAB CAB WITH (NOLOCK) 
				LEFT JOIN AS_CAD..ASENTENT     ENT WITH (NOLOCK) ON CAB.CABNID_ENT = ENT.ENTNID_ENT
				LEFT JOIN AS_CAD..ASENTENT     VEN WITH (NOLOCK) ON CAB.CABNID_VEN = VEN.ENTNID_ENT
				LEFT JOIN AS_CAD..ASPGEPGE     PGE WITH (NOLOCK) ON CAB.CABNID_PGE = PGE.PGENID_PGE
				LEFT JOIN AS_CAD..ASENTCLI_CAR CAR WITH (NOLOCK) ON ENT.ENTNID_ENT = CAR.CARNID_CLI AND CAB.CABC_PLACA = CAR.CARCPLACAR
				
				OUTER APPLY (
						SELECT	ISNULL(SUM( ROUND((IAM.IAMNQUANTI*IAM.IAMNVLRUNI),2)+ITE.ITENST_VLR+ITE.ITENTOTIPI+ITE.ITENTOTDAC+ITE.ITENTOTENC+ITE.ITENTOTFRE-(ITE.ITENTOTDES+ITE.ITENTOTBON)),0) AS AMBNTOTPED,
								ISNULL(SUM( ROUND((IAM.IAMNQUANTI*PRE.PRENVDAPMZ),2)+ITE.ITENST_VLR+ITE.ITENTOTIPI+ITE.ITENTOTDAC+ITE.ITENTOTENC+ITE.ITENTOTFRE-(ITE.ITENTOTDES+ITE.ITENTOTBON)),0) AS AMBNTOTPMZ
							FROM AS_CAD..ASPEDITE		ITE WITH (NOLOCK)
								LEFT JOIN AS_CAD..ASPEDITE_AMB	IAM WITH (NOLOCK) ON ITE.ITENID_PRO = IAM.IAMNID_PRO AND ITE.ITENID_CAB = IAM.IAMNID_CAB
								LEFT JOIN AS_CAD..ASPROPRE PRE WITH (NOLOCK) ON ITE.ITENID_PRO = PRE.PRENID_PRO AND PRE.PRENID_LOJ = 1
								OUTER APPLY ( SELECT KITNID_PRI, COUNT(DISTINCT KITNID_PRO) AS KITNQTDITE
												FROM AS_CAD..ASPROKIT WITH (NOLOCK) WHERE KITNID_PRI = ITE.ITENID_PRO AND KITCTIPCAD = 'KIT' GROUP BY KITNID_PRI ) KIT
							WHERE ITE.ITENID_CAB = CAB.CABNID_CAB AND ISNULL(KIT.KITNQTDITE,0)=0 
						) AMB

				OUTER APPLY (
					SELECT	SUM( ROUND((ITE.ITENQUANTI*ITE.ITENVLRUNI),2)+ITE.ITENST_VLR+ITE.ITENTOTIPI+ITE.ITENTOTDAC+ITE.ITENTOTENC+ITE.ITENTOTFRE-(ITE.ITENTOTDES+ITE.ITENTOTBON)) AS CABNTOTPED,
							CONVERT(NUMERIC(14,2),0) AS CABNTOTPMZ
						FROM AS_CAD..ASPEDITE ITE WITH (NOLOCK)
							OUTER APPLY ( SELECT KITNID_PRI, COUNT(DISTINCT KITNID_PRO) AS KITNQTDITE
											FROM AS_CAD..ASPROKIT WITH (NOLOCK) WHERE KITNID_PRI = ITE.ITENID_PRO AND KITCTIPCAD = 'KIT' GROUP BY KITNID_PRI ) KIT
						WHERE ITE.ITENID_CAB = CAB.CABNID_CAB AND ISNULL(KIT.KITNQTDITE,0)=0 
					) ITE
				
				OUTER APPLY ( 
						SELECT SUM(CAFNVLRFIN - CAFNVLRTRO) AS CAFNVLRFIN FROM AS_CAD..ASPEDCAB_FIN WITH (NOLOCK) WHERE CAFNID_CAB = CAB.CABNID_CAB 
						) CAF

				OUTER APPLY ( 
						SELECT TOP 1 TELNCODDDD, TELNNUMTEL FROM AS_CAD..ASENTTEL WITH (NOLOCK) WHERE TELNID_ENT = CAB.CABNID_ENT 
						) TEL  
                         ${prvcsqlwhr}
                         ORDER BY CAB.CABDDATCAD DESC
                         `
        }
            
        const reference = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab, CABNPAGNUM, CABNPAGLIM }, token });
    
        return reference?.recordset;
    }
    
    async as_Create(token: string, aspedcab: Partial<ASPEDCAB>) {
        
        let columns: string[] = [];
        let values: string[] = [];
        let params: { [key: string]: any } = {}; 
    
        const restrictedFields = new Set<keyof ASPEDCAB>(['CABNID_CAB', 'CABCUSUCAD', 'CABDDATCAD', 'CABCUSUALT', 'CABDDATALT']);

        for (let key in aspedcab) {
            if (restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB)) continue;

            if (aspedcab[key as keyof ASPEDCAB] !== undefined) {  
                columns.push(key);               
                values.push(`@${key}`);          
                params[key] = aspedcab[key as keyof ASPEDCAB]; 
            }
        }
    
        if (columns.length === 0) {
            throw new Error('No fields provided for insert.');
        }
    
        const prvcsqlstr = `
            INSERT INTO AS_CAD..ASPEDCAB (${columns.join(', ')})
            VALUES (${values.join(', ')})
        `;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }

    async as_Update(token: string, aspedcab: Partial<ASPEDCAB>, whereConditions: Partial<ASPEDCAB>) {
        let updateFields: string[] = [];
        let whereFields: string[] = [];
    
        const restrictedFields = new Set<keyof ASPEDCAB>(['CABNID_CAB', 'CABCUSUCAD', 'CABDDATCAD', 'CABCUSUALT', 'CABDDATALT']);
        
        for (const [key, value] of Object.entries(aspedcab)) {
            if (!restrictedFields.has(key.toUpperCase() as keyof ASPEDCAB) && value !== undefined) {
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
            UPDATE AS_CAD..ASPEDCAB
            SET ${setClause}
            WHERE ${whereClause}
        `;

        const params = { ...aspedcab, ...whereConditions };
    
        await as_mssql.Assqlexec(prvcsqlstr, { params, token });
    }
    
    async as_Delete(token: string, aspedcab: Partial<ASPEDCAB>) {
        let conditions: string[] = [];
    
        for (const key in aspedcab) {
            if (aspedcab.hasOwnProperty(key) && aspedcab[key as keyof ASPEDCAB] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
        }
    
        if (conditions.length === 0) {
            throw new Error("No conditions provided for the WHERE clause. At least one field is required for deletion.");
        }
    
        const whereClause = `WHERE ${conditions.join(' AND ')}`;
        const prvcsqlstr = `DELETE FROM AS_CAD..ASPEDCAB ${whereClause}`;
    
        await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspedcab }, token });
    }
    
    
}

export default new as_cabService()