import { as_mssql } from "@root/models";
import { ASFINFIN_DET } from "@root/interfaces";
import { as_tokenService } from "@root/services";
import { as_Date } from "@root/utils";
class as_usumenService {
    
 async as_get(token: string, asvalfin: ASFINFIN_DET = {} as ASFINFIN_DET) {
        
        const { FINDDATINI , FINDDATFIN } = asvalfin;

        let conditions: string[] = [];
        // const restrictedFields = new Set<keyof ASFINFIN_DET>(['MENNPAGNUM', 'MENNPAGLIM']);
        const restrictedFields = new Set(Object.keys(asvalfin));
        
        for (const key in asvalfin) {
            
            if (restrictedFields.has(key.toUpperCase() as keyof ASFINFIN_DET)) continue;

            if (asvalfin.hasOwnProperty(key) && asvalfin[key as keyof ASFINFIN_DET] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
            
        }
        
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr = await this.as_ven_script(token,FINDDATINI, FINDDATFIN, prvcsqlwhr);
        

        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...asvalfin }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, asvalfin: Partial<ASFINFIN_DET>) {
        throw new Error('Cannot inert values.');
    }

    async as_Update(token: string, asvalfin: Partial<ASFINFIN_DET>, whereConditions: Partial<ASFINFIN_DET>) {
        throw new Error('Cannot update values.');
    }
    
    async as_Delete(token: string, asvalfin: Partial<ASFINFIN_DET>) {
        throw new Error('Cannot delete values.');
    }
   
   private async as_ven_script(token: string, FINDDATINI: string = '', FINDDATFIN: string = '', prvcsqlwhr: string = ''): Promise<string> {
        
        const user = await as_tokenService.as_getUser(token);
        let prvcsqlstr = `
            	IF OBJECT_ID('tempdb..#_FINFVL') IS NOT NULL
                    DROP TABLE #_FINFVL

                IF OBJECT_ID('tempdb..#_FINFIN') IS NOT NULL
                    DROP TABLE #_FINFIN

                IF OBJECT_ID('tempdb..#_FVLPAG') IS NOT NULL
                    DROP TABLE #_FVLPAG

                IF OBJECT_ID('tempdb..#_FVLLIQ') IS NOT NULL
                    DROP TABLE #_FVLLIQ

                IF OBJECT_ID('tempdb..#_CONSFIN') IS NOT NULL
                    DROP TABLE #_CONSFIN

                IF OBJECT_ID('tempdb..#_USULOJ') IS NOT NULL
                    DROP TABLE #_USULOJ

                IF OBJECT_ID('tempdb..#TIKET') IS NOT NULL
                    DROP TABLE #TIKET

                SET DATEFORMAT DMY
                DECLARE @CSQLSTR VARCHAR(MAX) = ''

                DECLARE @DDATINI DATETIME = '${FINDDATINI ? FINDDATINI : "01'+RIGHT(CONVERT(CHAR(10), GETDATE(), 103),8)+' 00:00:00"}'
                DECLARE @DDATFIN DATETIME = '${FINDDATFIN ? FINDDATFIN : "'+CONVERT(CHAR(10), GETDATE(), 103)+' 23:59:59"}'


                SELECT * INTO tempdb..#_USULOJ FROM AS_CAD..ASENTUSU_LOJ WITH (NOLOCK) WHERE USLNID_USU = ${user.recordset[0].APINID_USU}

                /*******************************************************************************************************/
                /*											  MOVIMENTAÇÃOES										   */
                /*******************************************************************************************************/
                CREATE TABLE #TIKET (MVPNID_LOJ INT, MVPNVLRVDA NUMERIC(14,6), MVPN_TIKET INT)

                SET @CSQLSTR = '
					;WITH TIKET AS (
						SELECT 
							MVP.MVPNID_LOJ,
							MVP.MVPNID_FNC,
							MVP.MVPN_NFNUM, 
							MVP.MVPNVLRVDA,
							ROW_NUMBER() OVER (PARTITION BY MVP.MVPNID_LOJ, MVP.MVPNID_FNC, MVP.MVPN_NFNUM ORDER BY MVP.MVPNID_LOJ, MVP.MVPNID_FNC, MVP.MVPN_NFNUM) AS MVPN_TIKET
								FROM ?..ASPROMVP MVP WITH (NOLOCK) 
									LEFT JOIN ( SELECT MVINID_MVP, SUM(MVINVLRMVI) AS MVINVLRMVI
											FROM ?..ASPROMVP_INC WITH (NOLOCK)
											GROUP BY MVINID_MVP) AS MVI ON MVP.MVPNID_MVP = MVI.MVINID_MVP
                
								WHERE MVP.MVPDDATMOV BETWEEN @DDATINI AND @DDATFIN
									AND MVP.MVPCTIPMVP IN (''VDACX'',''VDALE'',''VDANF'',''VDAPE'')
									AND MVP.MVPNID_LOJ IN (
										SELECT USLNID_LOJ FROM tempdb..#_USULOJ
									)
					), TIKVOL AS (
						SELECT VOL.MVPNID_LOJ,
								COUNT(DISTINCT VOL.MVPN_NFNUM) AS MVPN_TIKET
							FROM TIKET VOL
							GROUP BY VOL.MVPNID_LOJ

					), TIKVLR AS (
						SELECT VLR.MVPNID_LOJ, SUM(VLR.MVPNVLRVDA) MVPNVLRVDA  
							FROM TIKET VLR
							GROUP BY VLR.MVPNID_LOJ
					)
	
					SELECT MVPVLR.MVPNID_LOJ, MVPVLR.MVPNVLRVDA, MVPVOL.MVPN_TIKET
								FROM TIKVLR MVPVLR
						LEFT JOIN TIKVOL MVPVOL ON MVPVOL.MVPNID_LOJ = MVPVLR.MVPNID_LOJ
	
				'
				SET @CSQLSTR = '
					SET DATEFORMAT DMY

					DECLARE @DDATINI DATETIME = '''+CONVERT(char(10),@DDATINI, 103) +' '+ CONVERT(char(10),@DDATINI, 108)+'''
					DECLARE @DDATFIN DATETIME = '''+CONVERT(char(10),@DDATFIN, 103) +' '+ CONVERT(char(10),@DDATFIN, 108)+'''
					IF ''?'' IN (
						SELECT	NAME
							FROM SYS.databaseS WITH (NOLOCK)
							WHERE NAME LIKE ''AS_2%''
							AND CAST(SUBSTRING(NAME,4,6) AS INT) BETWEEN CAST(SUBSTRING(CONVERT(CHAR(10), @DDATINI, 112),1,6) AS INT) 
																	 AND CAST(SUBSTRING(CONVERT(CHAR(10), @DDATFIN, 112),1,6) AS INT) 

					) 
					BEGIN 
						'+@CSQLSTR+'
					END'

				INSERT INTO #TIKET
				EXECUTE sp_MSforeachdb @CSQLSTR
                
                /*******************************************************************************************************/
                /*******************************************************************************************************/

                    SELECT DISTINCT FIN.FINNID_FIN
                        INTO #_FINFVL
                        FROM AS_FIN..ASFINFIN FIN WITH (NOLOCK)
                            LEFT JOIN AS_FIN..ASFINFVL FVL WITH (NOLOCK) ON FIN.FINNID_FIN = FVL.FVLNID_FIN
                            LEFT JOIN AS_FIN..ASFINBAC BAC WITH (NOLOCK) ON FVL.FVLNID_BAC = BAC.BACNID_BAC
                            LEFT JOIN AS_FIN..ASFINBAN BAN WITH (NOLOCK) ON BAC.BACNID_BAN = BAN.BANNID_BAN
                            LEFT JOIN AS_FIN..ASFINAGR AGR WITH (NOLOCK) ON FIN.FINNID_FIN = AGR.AGRNID_AGR AND AGR.AGRCTIPAGR IN ('FINOP','DEPOP')

                        WHERE FVL.FVLDVENVIG BETWEEN @DDATINI AND @DDATFIN AND FIN.FINNID_LOJ IN (
                            SELECT USLNID_LOJ FROM tempdb..#_USULOJ
                        ) AND  FVL.FVLNFLGEXC IS NULL AND AGR.AGRNID_FIN IS NULL

                    SELECT 
                            FIN.FINNID_FIN, FIN.FINNID_LOJ, FIN.FINCTIPOPE, FIN.FINCTIPENT, FIN.FINNID_ENT, FIN.FINC_NFNUM, FIN.FINC_NFSER,
                            FIN.FINC_NFESP, FIN.FINNID_NFC, FIN.FINCCONPAG, FIN.FINDDATENT, FIN.FINDDATEMI, FIN.FINDDATEXC, FIN.FINDDATCAD,
                            FVL.FVLNID_FVL, FVL.FVLNID_PAI, FVL.FVLNID_FIN, FVL.FVLCTIPFVL, FVL.FVLNVALBRU, ISNULL(CPL.FVLNVALBRU,0) AS FVLNVALCPL,
                            FVL.FVLNID_PFI, FVL.FVLCTIPINC, 
                            FVL.FVLDVENVIG, FVL.FVLCTIPJUR, FVL.FVLCTIPCAL, FVL.FVLNID_CCU, FVL.FVLNID_BAC, FVL.FVLNID_MPR, FVL.FVLCDESCRI, 
                            FVL.FVLDDATPAG, FVL.FVLNFLGEXC, FVL.FVLCUSUCAD, FVL.FVLDDATCAD, FVL.FVLCUSUALT, FVL.FVLDDATALT, PFI.PFICDESCRI,
                            CONVERT(INT,ROW_NUMBER() OVER(PARTITION BY FVL.FVLNID_FIN, FVL.FVLCTIPFVL ORDER BY FVL.FVLDVENVIG, FVL.FVLNID_FVL)) AS FVLNNUMPAR,
                            BAN.BANCTIPBAN, AGR.AGRNID_AGR, AGR.AGRCTIPAGR, PFI.PFINEMIBOL, PFI.PFINGERCON
                        INTO #_FINFIN
                        FROM AS_FIN..ASFINFVL         FVL WITH (NOLOCK)
                            INNER JOIN    #_FINFVL _FINFVL WITH (NOLOCK) ON FVL.FVLNID_FIN = _FINFVL.FINNID_FIN
                            LEFT JOIN AS_FIN..ASFINFIN FIN WITH (NOLOCK) ON FVL.FVLNID_FIN =     FIN.FINNID_FIN
                            LEFT JOIN AS_FIN..ASFINPFI PFI WITH (NOLOCK) ON FVL.FVLNID_PFI =     PFI.PFINID_PFI
                            LEFT JOIN AS_FIN..ASFINBAC BAC WITH (NOLOCK) ON FVL.FVLNID_BAC =     BAC.BACNID_BAC
                            LEFT JOIN AS_FIN..ASFINBAN BAN WITH (NOLOCK) ON BAC.BACNID_BAN =     BAN.BANNID_BAN
                            LEFT JOIN AS_FIN..ASFINAGR AGR WITH (NOLOCK) ON FIN.FINNID_FIN =     AGR.AGRNID_AGR AND AGR.AGRCTIPAGR IN ('FINOP','DEPOP')
                            OUTER APPLY ( SELECT SUM(FVLNVALBRU) AS FVLNVALBRU
                                            FROM (
                                            SELECT (CASE WHEN FVLCTIPINC = 'V' THEN FVLNVALBRU ELSE ( FVL.FVLNVALBRU * FVLNVALBRU/100. ) END ) AS FVLNVALBRU 
                                                FROM AS_FIN..ASFINFVL WITH (NOLOCK) 
                                                WHERE FVLNID_PAI = FVL.FVLNID_FVL AND FVLCTIPFVL = 'COMPL' AND FVLNFLGEXC IS NULL
                                            ) _CALCPL
                                        ) CPL
                        WHERE  FVL.FVLNFLGEXC IS NULL AND AGR.AGRNID_FIN IS NULL
                            
                    SELECT B.FVLNID_PAI, B.FVLCTIPFVL, MAX(B.FVLDDATPAG) AS FVLDDATPAG, SUM(B.FVLNVALBRU) AS FVLNVALBXA
                        INTO #_FVLPAG
                        FROM #_FINFIN B
                            LEFT JOIN #_FINFIN A ON B.FVLNID_PAI = A.FVLNID_FVL AND A.FVLCTIPFVL = 'BRUTO'
                        WHERE B.FVLCTIPFVL = 'PAGTO'
                        GROUP BY B.FVLNID_PAI, B.FVLCTIPFVL

                    SELECT FVLNID_PAI, ROUND(SUM(FVLNVALBRU),2,1) AS FVLNVALLIQ, 
                                ROUND(SUM(CASE WHEN FVLCTIPFVL = 'INCID' AND FVLNVALBRU > 0 THEN FVLNVALBRU ELSE 0.00 END),2,1) AS FVLNVALINC_P,
                                ROUND(SUM(CASE WHEN FVLCTIPFVL = 'INCID' AND FVLNVALBRU < 0 THEN FVLNVALBRU ELSE 0.00 END),2,1) AS FVLNVALINC_R
                        INTO #_FVLLIQ
                        FROM (
                                SELECT ISNULL(A.FVLNID_PAI,A.FVLNID_FVL) AS FVLNID_PAI, A.FVLCTIPFVL, (A.FVLNVALBRU + A.FVLNVALCPL) AS FVLNVALBRU 
                                    FROM #_FINFIN A
                                    WHERE A.FVLCTIPINC = 'V' AND A.FVLCTIPFVL = 'BRUTO'
                                UNION ALL
                                SELECT B.FVLNID_PAI, B.FVLCTIPFVL, 
                                    CASE  WHEN B.FVLCTIPCAL = 'S'
                                            THEN -- && Cálculo Simples
                                                ( CASE WHEN B.FVLCTIPINC = 'V' THEN B.FVLNVALBRU 
                                                        ELSE ( (A.FVLNVALBRU + A.FVLNVALCPL) * B.FVLNVALBRU/100. )
                                                        END )*( CASE WHEN B.FVLCTIPJUR = 'F' THEN 1
                                                                        WHEN SIGN(B.FVLNVALBRU)=-1 AND A.FVLDDATPAG > B.FVLDVENVIG THEN 0
                                                                        WHEN SIGN(B.FVLNVALBRU)= 1 AND A.FVLDDATPAG < B.FVLDVENVIG THEN 0 
                                                                        ELSE
                                                                                CASE WHEN SIGN(B.FVLNVALBRU)= 1 AND B.FVLCTIPJUR = 'D' THEN DATEDIFF(D, B.FVLDVENVIG, A.FVLDDATPAG)
                                                                                    WHEN SIGN(B.FVLNVALBRU)= 1 AND B.FVLCTIPJUR = 'M' THEN DATEDIFF(M, B.FVLDVENVIG, A.FVLDDATPAG)
                                                                                    ELSE 1 END
                                                                        END )
                                            ELSE -- && Cálculo Composto
                                                (A.FVLNVALBRU + A.FVLNVALCPL) * (
                                                    POWER( 1 + B.FVLNVALBRU/100. , 
                                                        ( CASE WHEN B.FVLCTIPJUR = 'F' THEN 1
                                                                        WHEN SIGN(B.FVLNVALBRU)=-1 AND A.FVLDDATPAG > B.FVLDVENVIG THEN 0
                                                                        WHEN SIGN(B.FVLNVALBRU)= 1 AND A.FVLDDATPAG < B.FVLDVENVIG THEN 0 
                                                                        ELSE
                                                                                CASE WHEN SIGN(B.FVLNVALBRU)= 1 AND B.FVLCTIPJUR = 'D' THEN DATEDIFF(D, B.FVLDVENVIG, A.FVLDDATPAG)
                                                                                    WHEN SIGN(B.FVLNVALBRU)= 1 AND B.FVLCTIPJUR = 'M' THEN DATEDIFF(M, B.FVLDVENVIG, A.FVLDDATPAG)
                                                                                    ELSE 1 END
                                                                        END ))-1 )
                                            END
                                    FROM #_FINFIN B
                                        OUTER APPLY ( 
                                            SELECT FVLCTIPFVL, FVLNVALBRU, FVLNVALCPL, FVLDDATPAG = ISNULL((SELECT MAX(FVLDDATPAG) AS FVLDDATPAG FROM #_FINFIN WHERE FVLNID_PAI = B.FVLNID_PAI AND FVLCTIPFVL = 'PAGTO'), '26/07/2025')
                                                FROM #_FINFIN WHERE FVLNID_FVL = B.FVLNID_PAI AND FVLCTIPFVL = 'BRUTO' ) A
                                    WHERE B.FVLCTIPFVL = 'INCID'
                                ) AS _FINFVL 
                            GROUP BY FVLNID_PAI

                    SELECT
                            _FINFIN.FINNID_FIN, _FINFIN.FINNID_LOJ, _FINFIN.FINCTIPOPE, _FINFIN.FINCTIPENT, _FINFIN.FINNID_ENT, _FINFIN.FINC_NFNUM,
                            _FINFIN.FINC_NFSER, _FINFIN.FINC_NFESP, _FINFIN.FINDDATENT, _FINFIN.FINDDATEMI, _FINFIN.FVLDVENVIG, _FINFIN.FVLCDESCRI,
                            _FINFIN.PFINEMIBOL, _FINFIN.PFINGERCON, _FINFIN.FVLNVALBRU, _FINFIN.FVLNVALCPL,
                            _FINFIN.FVLNNUMPAR, FVLNTOTPAR = (SELECT MAX(FVLNNUMPAR) FROM #_FINFIN B WHERE B.FVLNID_FIN = _FINFIN.FVLNID_FIN AND B.FVLCTIPFVL = 'BRUTO' ),
                            _FVLLIQ.FVLNVALLIQ  , _FVLLIQ.FVLNVALINC_P, _FVLLIQ.FVLNVALINC_R, 
                            CASE WHEN _FVLPAG.FVLDDATPAG IS NOT NULL THEN 'PAGTO'            ELSE _FINFIN.FVLCTIPFVL END AS FVLCTIPFVL ,
                            CASE WHEN _FVLPAG.FVLDDATPAG IS NOT NULL THEN _FVLPAG.FVLDDATPAG ELSE _FINFIN.FVLDDATPAG END AS FVLDDATPAG ,
                            CASE WHEN _FVLPAG.FVLDDATPAG IS NOT NULL THEN _FVLPAG.FVLNVALBXA ELSE _FINFIN.FVLNVALBRU END AS FVLNVALBXA ,
                            _FVLLIQ.FVLNVALLIQ - ABS(_FVLPAG.FVLNVALBXA) AS FVLNVALABE,

                            _FINFIN.FINCCONPAG, _FINFIN.FVLCTIPINC, _FINFIN.FVLCTIPJUR, _FINFIN.FVLCTIPCAL, 
                            _FINFIN.FVLNID_FVL, _FINFIN.FVLNID_PAI, _FINFIN.FINNID_NFC, _FINFIN.FVLNID_PFI, _FINFIN.PFICDESCRI, _FINFIN.FVLNID_MPR, 
                            _FINFIN.FVLNID_BAC, _FINFIN.BANCTIPBAN, 
                            _FINFIN.FINDDATCAD, _FINFIN.FINDDATEXC, _FINFIN.FVLNFLGEXC, _FINFIN.FVLCUSUCAD, _FINFIN.FVLDDATCAD, _FINFIN.FVLCUSUALT, _FINFIN.FVLDDATALT

                            ,FINBAC.BACNID_BAN, FINBAC.BACCCODCCO, FINAGR.AGRNID_AGR, FINAGR.AGRCTIPAGR
                            ,LOJLOJ.LOJCCODLOJ, LOJENT.ENTCAPELID AS LOJCAPELID, ENTENT.ENTCAPELID, ENTENT.ENTCNOMENT, ENTENT.ENTCTIPPES, ENTENT.ENTCCODCPF
                            ,FVLCHQ.CHQCBANCHQ, FVLCHQ.CHQCAGECHQ, FVLCHQ.CHQCCONCHQ, FVLCHQ.CHQCNUMCHQ, FVLCHQ.CHQCCDCMC7, FVLCHQ.CHQDDATCUS
                            ,FVLBOL.BOLNID_BOL, FVLBOL.BOLCNUMDUP, FVLBOL.BOLDDATDUP, FVLBOL.BOLCTIPBAR, FVLBOL.BOLCCODBAR, FVLBOL.BOLNID_BAC
                            ,_FINFIN.FVLNID_CCU, FVLCCU.CCUCCODCCU, FVLCCU.CCUCDESCRI, FINMPR.MPRCDESCRI
                            ,FINPAG.FPGNID_FPG, FINPAG.FPGNID_FIN, FINPAG.FPGNID_FVL, FINPAG.FPGNVALPAG, FINPAG.FPGDDATPAG, FINPAG.FPGNSEQARQ, FINPAG.FPGDDATLIB, FINPAG.FPGCUSUCAD, FINPAG.FPGDDATCAD
                            ,CHQDEV.DEVCCODMOT, CHQDEV.DEVDDATMOT, CHQDEV.DEVCCODLOC, CHQDEV.DEVDDATLOC, CHQDEV.DEVDDATPRE, CHQDEV.DEVCDESCRI

                        INTO #_CONSFIN
                        FROM #_FINFIN _FINFIN
                            LEFT JOIN #_FVLLIQ _FVLLIQ ON _FINFIN.FVLNID_FVL = _FVLLIQ.FVLNID_PAI
                            LEFT JOIN #_FVLPAG _FVLPAG ON _FINFIN.FVLNID_FVL = _FVLPAG.FVLNID_PAI
                            LEFT JOIN AS_CAD..ASENTLOJ     LOJLOJ WITH (NOLOCK) ON _FINFIN.FINNID_LOJ = LOJLOJ.LOJNID_ENT
                            LEFT JOIN AS_CAD..ASENTENT     LOJENT WITH (NOLOCK) ON  LOJLOJ.LOJNID_ENT = LOJENT.ENTNID_ENT
                            LEFT JOIN AS_CAD..ASENTENT     ENTENT WITH (NOLOCK) ON _FINFIN.FINNID_ENT = ENTENT.ENTNID_ENT
                            LEFT JOIN AS_FIN..ASFINCHQ     FVLCHQ WITH (NOLOCK) ON _FINFIN.FVLNID_FVL = FVLCHQ.CHQNID_FVL
                            LEFT JOIN AS_FIN..ASFINBOL     FVLBOL WITH (NOLOCK) ON _FINFIN.FVLNID_FVL = FVLBOL.BOLNID_FVL
                            LEFT JOIN AS_FIN..ASFINCCU     FVLCCU WITH (NOLOCK) ON _FINFIN.FVLNID_CCU = FVLCCU.CCUNID_CCU
                            LEFT JOIN AS_FIN..ASFINBAC     FINBAC WITH (NOLOCK) ON _FINFIN.FVLNID_BAC = FINBAC.BACNID_BAC
                            LEFT JOIN AS_FIN..ASFINAGR     FINAGR WITH (NOLOCK) ON _FINFIN.AGRNID_AGR = FINAGR.AGRNID_AGR
                            LEFT JOIN AS_FIN..ASFINMPR     FINMPR WITH (NOLOCK) ON _FINFIN.FVLNID_MPR = FINMPR.MPRNID_MPR
                            LEFT JOIN AS_FIN..ASFINFIN_PAG FINPAG WITH (NOLOCK) ON _FINFIN.FVLNID_FVL = FINPAG.FPGNID_FVL
                            OUTER APPLY ( SELECT TOP 1 * FROM AS_FIN..ASFINDEV WITH (NOLOCK) WHERE DEVNID_CHQ = FVLCHQ.CHQNID_CHQ ORDER BY DEVNID_DEV DESC ) CHQDEV

                                        IF OBJECT_ID('tempdb..#_CONSNFC') IS NOT NULL
                                DROP TABLE #_CONSNFC

                            SELECT CONVERT(BIGINT,0) AS NFCNID_NFC, CONVERT(VARCHAR(250),'') AS NFCCOBSERV, CONVERT(CHAR(01),'') AS NFCC_NFSTA INTO #_CONSNFC

                            DECLARE @AS_DBNAME NVARCHAR(MAX) = '', @AS_ID_OBJECT INT, @PESQ_NFESQL NVARCHAR(MAX) = ''
                            
                            
                            DECLARE TMP_DBNAME CURSOR FOR
                                SELECT AS_DBNAME, OBJECT_ID(AS_DBNAME+'..ASNFECAB') AS AS_ID_OBJECT
                                    FROM ( SELECT DISTINCT 'AS_20'+LEFT(FINNID_NFC,4) AS AS_DBNAME FROM #_CONSFIN _CONSFIN WHERE LEFT(FINNID_NFC,2) > 01 and RIGHT(LEFT(FINNID_NFC,4),2) between 1 AND 12 ) DB		
                                    
                                            
                            OPEN TMP_DBNAME
                            FETCH NEXT FROM TMP_DBNAME INTO @AS_DBNAME, @AS_ID_OBJECT
                            WHILE (@@FETCH_STATUS = 0)
                            BEGIN
                                IF @AS_ID_OBJECT is not null
                                    BEGIN
                                        SET @PESQ_NFESQL = N'
                                            SET NOCOUNT ON
                                            INSERT INTO #_CONSNFC ( NFCNID_NFC, NFCCOBSERV, NFCC_NFSTA)
                                            SELECT NFCNID_NFC, NFCCOBSERV, NFCC_NFSTA FROM '+@AS_DBNAME+'..ASNFECAB WITH (NOLOCK)
                                                WHERE NFCNID_NFC IN ( SELECT FINNID_NFC FROM #_CONSFIN )
                                        --&&	  AND NFCCOBSERV IS NOT NULL --&& (DCA) - 05/02/2024
                                            '
                                        EXECUTE(@PESQ_NFESQL)
                                    END
                                FETCH NEXT FROM TMP_DBNAME INTO @AS_DBNAME, @AS_ID_OBJECT
                            END
                            CLOSE TMP_DBNAME
                            DEALLOCATE TMP_DBNAME

                        ; WITH FIN AS (
                        SELECT  _CONSFIN.*,
                                    CASE WHEN FINCTIPOPE = 'P' THEN ISNULL(FVLNVALBRU,0.00) ELSE 0.00 END AS FVLNVALBRU_P,
                                    CASE WHEN FINCTIPOPE = 'P' THEN ISNULL(FVLNVALLIQ,0.00) ELSE 0.00 END AS FVLNVALLIQ_P,
                                    CASE WHEN FINCTIPOPE = 'P' THEN ISNULL(FVLNVALABE,0.00) ELSE 0.00 END AS FVLNVALABE_P,
                                    CASE WHEN FINCTIPOPE = 'P' THEN ISNULL(FVLNVALBXA,0.00) ELSE 0.00 END AS FVLNVALBXA_P,
                                    CASE WHEN FINCTIPOPE = 'R' THEN ISNULL(FVLNVALBRU,0.00) ELSE 0.00 END AS FVLNVALBRU_R,
                                    CASE WHEN FINCTIPOPE = 'R' THEN ISNULL(FVLNVALLIQ,0.00) ELSE 0.00 END AS FVLNVALLIQ_R,
                                    CASE WHEN FINCTIPOPE = 'R' THEN ISNULL(FVLNVALABE,0.00) ELSE 0.00 END AS FVLNVALABE_R,
                                    CASE WHEN FINCTIPOPE = 'R' THEN ISNULL(FVLNVALBXA,0.00) ELSE 0.00 END AS FVLNVALBXA_R,
                                    ISNULL(_CONSNFC.NFCCOBSERV,'') AS NFCCOBSERV,
                                    IsNull(_CONSNFC.NFCC_NFSTA,'') AS NFCC_NFSTA --&& (DCA) - 05/02/2025
                            FROM #_CONSFIN _CONSFIN
                                LEFT JOIN #_CONSNFC _CONSNFC ON _CONSFIN.FINNID_NFC = _CONSNFC.NFCNID_NFC AND _CONSFIN.FVLNID_PAI IS NULL

                            WHERE _CONSFIN.FVLDVENVIG BETWEEN @DDATINI AND @DDATFIN  AND  _CONSFIN.FVLNID_PAI IS NULL
                            ), TOTFIN AS (
                            SELECT	
                                    FINNID_LOJ,
                                    SUM(FVLNVALBRU_P*-1)											AS PAGNVALBRU,
                                    SUM(IIF(ISNULL(FVLNVALABE,0)>0,FVLNVALABE_P,FVLNVALLIQ_P)*-1)	AS PAGNVALLIQ,
                                    SUM(FVLNVALBRU_R)												AS RECNVALBRU,
                                    SUM(IIF(ISNULL(FVLNVALABE,0)>0,FVLNVALABE_R,FVLNVALLIQ_R))		AS RECNVALLIQ 
                                    FROM FIN 
                                    WHERE FIN.FINDDATEXC IS NULL AND FVLCTIPFVL = 'BRUTO'
                                    GROUP BY FVLCTIPFVL, FINNID_LOJ
                            ), TIKET AS (
                                SELECT 
                                        MVPNID_LOJ,
                                        SUM(MVPNVLRVDA)*-1 AS MVPNVLRVDA, 
                                        SUM(MVPN_TIKET)	AS MVPN_TIKET

                                FROM #TIKET MVP
                                GROUP BY MVP.MVPNID_LOJ
                            ), VDAFIN AS ( 
                                SELECT	
                                        LOJ.LOJNID_ENT AS FINNID_LOJ,
                                        LOJ.LOJCCODLOJ AS FINCCODLOJ,
                                        ENT.ENTCAPELID AS FINCAPELID,
                                        ENT.ENTCNOMENT AS FINCNOMENT,
                                        ISNULL(TIK.MVPNVLRVDA,0.00) AS FINNVLRVDA,
                                        ISNULL(TIK.MVPN_TIKET,0.00) AS FINN_TIKET,
                                        ISNULL(FIN.PAGNVALBRU,0.00) AS PAGNVALBRU,
                                        ISNULL(FIN.PAGNVALLIQ,0.00) AS PAGNVALLIQ,
                                        ISNULL(FIN.RECNVALBRU,0.00) AS RECNVALBRU,
                                        ISNULL(FIN.RECNVALLIQ,0.00) AS RECNVALLIQ
                                        FROM tempdb..#_USULOJ USU
                                        LEFT JOIN AS_CAD..ASENTLOJ LOJ WITH (NOLOCK) ON LOJ.LOJNID_ENT = USU.USLNID_LOJ
                                        LEFT JOIN AS_CAD..ASENTENT ENT WITH (NOLOCK) ON ENT.ENTNID_ENT = USU.USLNID_LOJ
                                        LEFT JOIN			 TIKET TIK WITH (NOLOCK) ON TIK.MVPNID_LOJ = USU.USLNID_LOJ
                                        LEFT JOIN			TOTFIN FIN WITH (NOLOCK) ON FIN.FINNID_LOJ = USU.USLNID_LOJ

                            ) SELECT * FROM VDAFIN FIN                                  
                               ${prvcsqlwhr ? prvcsqlwhr : ''}
                            ORDER BY FIN.FINCCODLOJ

                IF OBJECT_ID('tempdb..#tmpFINCCU') IS NOT NULL 
                    DROP TABLE #tmpFINCCU

                IF OBJECT_ID('tempdb..#_CONSNFI') IS NOT NULL
                    DROP TABLE #_CONSNFI

                IF OBJECT_ID('tempdb..#_CONSNFC') IS NOT NULL
                    DROP TABLE #_CONSNFC

                IF OBJECT_ID('tempdb..#_CONSFIN') IS NOT NULL
                    DROP TABLE #_CONSFIN

                IF OBJECT_ID('tempdb..#_FINFVL') IS NOT NULL
                    DROP TABLE #_FINFVL

                IF OBJECT_ID('tempdb..#_FINFIN') IS NOT NULL
                    DROP TABLE #_FINFIN

                IF OBJECT_ID('tempdb..#_FVLPAG') IS NOT NULL
                    DROP TABLE #_FVLPAG

                IF OBJECT_ID('tempdb..#_FVLLIQ') IS NOT NULL
                    DROP TABLE #_FVLLIQ

                IF OBJECT_ID('tempdb..#_USULOJ') IS NOT NULL
                    DROP TABLE #_USULOJ

                IF OBJECT_ID('tempdb..#TIKET') IS NOT NULL
                    DROP TABLE #TIKET
        `;

        return prvcsqlstr
   }

   // Validar as quantidades de tiketes vendidos por loja, caso volte a utiliza esta função
   private async as_ent_script(token: string, FINDDATINI: string = '', FINDDATFIN: string = '', prvcsqlwhr: string = ''): Promise<string> {

        const user = await as_tokenService.as_getUser(token);
        let prvcsqlstr = `
                            /*******************************************************************************************/
                            /*******************************************************************************************/
                            IF OBJECT_ID('tempdb..#_FINFVL') IS NOT NULL
                                DROP TABLE #_FINFVL

                            IF OBJECT_ID('tempdb..#_FINFIN') IS NOT NULL
                                DROP TABLE #_FINFIN

                            IF OBJECT_ID('tempdb..#_FVLPAG') IS NOT NULL
                                DROP TABLE #_FVLPAG

                            IF OBJECT_ID('tempdb..#_FVLLIQ') IS NOT NULL
                                DROP TABLE #_FVLLIQ

                            IF OBJECT_ID('tempdb..#_CONSFIN') IS NOT NULL
                                DROP TABLE #_CONSFIN
                            
                            IF OBJECT_ID('tempdb..#_USULOJ') IS NOT NULL
                                DROP TABLE #_USULOJ

                            SET DATEFORMAT DMY
                            DECLARE @DDATINI DATETIME = '${FINDDATINI ? FINDDATINI : "01'+RIGHT(CONVERT(CHAR(10), GETDATE(), 103),8)+' 00:00:00"}'
                            DECLARE @DDATFIN DATETIME = '${FINDDATFIN ? FINDDATFIN : "'+CONVERT(CHAR(10), GETDATE(), 103)+' 23:59:59"}'
                            DECLARE @CNOMDBA CHAR(09) = ''

                            SELECT * INTO tempdb..#_USULOJ FROM AS_CAD..ASENTUSU_LOJ WITH (NOLOCK) WHERE USLNID_USU = ${user.recordset[0].APINID_USU}

                                SELECT DISTINCT FIN.FINNID_FIN
                                    INTO #_FINFVL
                                    FROM AS_FIN..ASFINFIN FIN WITH (NOLOCK)
                                        LEFT JOIN AS_FIN..ASFINFVL FVL WITH (NOLOCK) ON FIN.FINNID_FIN = FVL.FVLNID_FIN
                                        LEFT JOIN AS_FIN..ASFINBAC BAC WITH (NOLOCK) ON FVL.FVLNID_BAC = BAC.BACNID_BAC
                                        LEFT JOIN AS_FIN..ASFINBAN BAN WITH (NOLOCK) ON BAC.BACNID_BAN = BAN.BANNID_BAN
                                        LEFT JOIN AS_FIN..ASFINAGR AGR WITH (NOLOCK) ON FIN.FINNID_FIN = AGR.AGRNID_AGR AND AGR.AGRCTIPAGR IN ('FINOP','DEPOP')

                                    WHERE FIN.FINNID_LOJ IN ( 
                                       -- SELECT LOJNID_ENT FROM AS_CAD..ASENTLOJ WITH (NOLOCK) WHERE LOJCLICART IS NULL
                                       SELECT USLNID_LOJ FROM tempdb..#_USULOJ
                                    ) 
                                      AND FVL.FVLNFLGEXC IS NULL AND AGR.AGRNID_FIN IS NULL
                                      
                                      --&& (DCA) - 20/05/2025
                                      AND FIN.FINDDATENT BETWEEN @DDATINI AND @DDATFIN  
                                      --&& (DCA) - 20/05/2025

                                SELECT 
                                        FIN.FINNID_FIN, FIN.FINNID_LOJ, FIN.FINCTIPOPE, FIN.FINCTIPENT, FIN.FINNID_ENT, FIN.FINC_NFNUM, FIN.FINC_NFSER,
                                        FIN.FINC_NFESP, FIN.FINNID_NFC, FIN.FINCCONPAG, FIN.FINDDATENT, FIN.FINDDATEMI, FIN.FINDDATEXC, FIN.FINDDATCAD,
                                        FVL.FVLNID_FVL, FVL.FVLNID_PAI, FVL.FVLNID_FIN, FVL.FVLCTIPFVL, FVL.FVLNVALBRU, ISNULL(CPL.FVLNVALBRU,0) AS FVLNVALCPL,
                                        FVL.FVLNID_PFI, FVL.FVLCTIPINC, 
                                        FVL.FVLDVENVIG, FVL.FVLCTIPJUR, FVL.FVLCTIPCAL, FVL.FVLNID_CCU, FVL.FVLNID_BAC, FVL.FVLNID_MPR, FVL.FVLCDESCRI, 
                                        FVL.FVLDDATPAG, FVL.FVLNFLGEXC, FVL.FVLCUSUCAD, FVL.FVLDDATCAD, FVL.FVLCUSUALT, FVL.FVLDDATALT, PFI.PFICDESCRI,
                                        CONVERT(INT,ROW_NUMBER() OVER(PARTITION BY FVL.FVLNID_FIN, FVL.FVLCTIPFVL ORDER BY FVL.FVLDVENVIG, FVL.FVLNID_FVL)) AS FVLNNUMPAR,
                                        BAN.BANCTIPBAN, AGR.AGRNID_AGR, AGR.AGRCTIPAGR, PFI.PFINEMIBOL, PFI.PFINGERCON
                                    INTO #_FINFIN
                                    FROM AS_FIN..ASFINFVL         FVL WITH (NOLOCK)
                                        INNER JOIN    #_FINFVL _FINFVL WITH (NOLOCK) ON FVL.FVLNID_FIN = _FINFVL.FINNID_FIN
                                        LEFT JOIN AS_FIN..ASFINFIN FIN WITH (NOLOCK) ON FVL.FVLNID_FIN =     FIN.FINNID_FIN
                                        LEFT JOIN AS_FIN..ASFINPFI PFI WITH (NOLOCK) ON FVL.FVLNID_PFI =     PFI.PFINID_PFI
                                        LEFT JOIN AS_FIN..ASFINBAC BAC WITH (NOLOCK) ON FVL.FVLNID_BAC =     BAC.BACNID_BAC
                                        LEFT JOIN AS_FIN..ASFINBAN BAN WITH (NOLOCK) ON BAC.BACNID_BAN =     BAN.BANNID_BAN
                                        LEFT JOIN AS_FIN..ASFINAGR AGR WITH (NOLOCK) ON FIN.FINNID_FIN =     AGR.AGRNID_AGR AND AGR.AGRCTIPAGR IN ('FINOP','DEPOP')
                                        OUTER APPLY ( SELECT SUM(FVLNVALBRU) AS FVLNVALBRU
                                                        FROM (
                                                        SELECT (CASE WHEN FVLCTIPINC = 'V' THEN FVLNVALBRU ELSE ( FVL.FVLNVALBRU * FVLNVALBRU/100. ) END ) AS FVLNVALBRU 
                                                            FROM AS_FIN..ASFINFVL WITH (NOLOCK) 
                                                            WHERE FVLNID_PAI = FVL.FVLNID_FVL AND FVLCTIPFVL = 'COMPL' AND FVLNFLGEXC IS NULL
                                                        ) _CALCPL
                                                    ) CPL
                                    WHERE  FVL.FVLNFLGEXC IS NULL AND AGR.AGRNID_FIN IS NULL
                                            
                                SELECT B.FVLNID_PAI, B.FVLCTIPFVL, MAX(B.FVLDDATPAG) AS FVLDDATPAG, SUM(B.FVLNVALBRU) AS FVLNVALBXA
                                    INTO #_FVLPAG
                                    FROM #_FINFIN B
                                        LEFT JOIN #_FINFIN A ON B.FVLNID_PAI = A.FVLNID_FVL AND A.FVLCTIPFVL = 'BRUTO'
                                    WHERE B.FVLCTIPFVL = 'PAGTO'
                                    GROUP BY B.FVLNID_PAI, B.FVLCTIPFVL

                                SELECT FVLNID_PAI, ROUND(SUM(FVLNVALBRU),2,1) AS FVLNVALLIQ, 
                                            ROUND(SUM(CASE WHEN FVLCTIPFVL = 'INCID' AND FVLNVALBRU > 0 THEN FVLNVALBRU ELSE 0.00 END),2,1) AS FVLNVALINC_P,
                                            ROUND(SUM(CASE WHEN FVLCTIPFVL = 'INCID' AND FVLNVALBRU < 0 THEN FVLNVALBRU ELSE 0.00 END),2,1) AS FVLNVALINC_R
                                    INTO #_FVLLIQ
                                    FROM (
                                            SELECT ISNULL(A.FVLNID_PAI,A.FVLNID_FVL) AS FVLNID_PAI, A.FVLCTIPFVL, (A.FVLNVALBRU + A.FVLNVALCPL) AS FVLNVALBRU 
                                                FROM #_FINFIN A
                                                WHERE A.FVLCTIPINC = 'V' AND A.FVLCTIPFVL = 'BRUTO'
                                            UNION ALL
                                            SELECT B.FVLNID_PAI, B.FVLCTIPFVL, 
                                                CASE  WHEN B.FVLCTIPCAL = 'S'
                                                        THEN -- && Cálculo Simples
                                                            ( CASE WHEN B.FVLCTIPINC = 'V' THEN B.FVLNVALBRU 
                                                                        ELSE ( (A.FVLNVALBRU + A.FVLNVALCPL) * B.FVLNVALBRU/100. )
                                                                        END )*( CASE WHEN B.FVLCTIPJUR = 'F' THEN 1
                                                                                        WHEN SIGN(B.FVLNVALBRU)=-1 AND A.FVLDDATPAG > B.FVLDVENVIG THEN 0
                                                                                        WHEN SIGN(B.FVLNVALBRU)= 1 AND A.FVLDDATPAG < B.FVLDVENVIG THEN 0 
                                                                                        ELSE
                                                                                            CASE WHEN SIGN(B.FVLNVALBRU)= 1 AND B.FVLCTIPJUR = 'D' THEN DATEDIFF(D, B.FVLDVENVIG, A.FVLDDATPAG)
                                                                                                    WHEN SIGN(B.FVLNVALBRU)= 1 AND B.FVLCTIPJUR = 'M' THEN DATEDIFF(M, B.FVLDVENVIG, A.FVLDDATPAG)
                                                                                                    ELSE 1 END
                                                                                        END )
                                                        ELSE -- && Cálculo Composto
                                                            (A.FVLNVALBRU + A.FVLNVALCPL) * (
                                                                POWER( 1 + B.FVLNVALBRU/100. , 
                                                                    ( CASE WHEN B.FVLCTIPJUR = 'F' THEN 1
                                                                                        WHEN SIGN(B.FVLNVALBRU)=-1 AND A.FVLDDATPAG > B.FVLDVENVIG THEN 0
                                                                                        WHEN SIGN(B.FVLNVALBRU)= 1 AND A.FVLDDATPAG < B.FVLDVENVIG THEN 0 
                                                                                        ELSE
                                                                                            CASE WHEN SIGN(B.FVLNVALBRU)= 1 AND B.FVLCTIPJUR = 'D' THEN DATEDIFF(D, B.FVLDVENVIG, A.FVLDDATPAG)
                                                                                                    WHEN SIGN(B.FVLNVALBRU)= 1 AND B.FVLCTIPJUR = 'M' THEN DATEDIFF(M, B.FVLDVENVIG, A.FVLDDATPAG)
                                                                                                    ELSE 1 END
                                                                                        END ))-1 )
                                                        END
                                                FROM #_FINFIN B
                                                    OUTER APPLY ( 
                                                        SELECT FVLCTIPFVL, FVLNVALBRU, FVLNVALCPL, FVLDDATPAG = ISNULL((SELECT MAX(FVLDDATPAG) AS FVLDDATPAG FROM #_FINFIN WHERE FVLNID_PAI = B.FVLNID_PAI AND FVLCTIPFVL = 'PAGTO'), CONVERT(CHAR(10),GETDATE(),103))
                                                            FROM #_FINFIN WHERE FVLNID_FVL = B.FVLNID_PAI AND FVLCTIPFVL = 'BRUTO' ) A
                                                WHERE B.FVLCTIPFVL = 'INCID'
                                            ) AS _FINFVL 
                                        GROUP BY FVLNID_PAI

                                SELECT
                                        _FINFIN.FINNID_FIN, _FINFIN.FINNID_LOJ, _FINFIN.FINCTIPOPE, _FINFIN.FINCTIPENT, _FINFIN.FINNID_ENT, _FINFIN.FINC_NFNUM,
                                        _FINFIN.FINC_NFSER, _FINFIN.FINC_NFESP, _FINFIN.FINDDATENT, _FINFIN.FINDDATEMI, _FINFIN.FVLDVENVIG, _FINFIN.FVLCDESCRI,
                                        _FINFIN.PFINEMIBOL, _FINFIN.PFINGERCON, _FINFIN.FVLNVALBRU, _FINFIN.FVLNVALCPL,
                                        _FINFIN.FVLNNUMPAR, FVLNTOTPAR = (SELECT MAX(FVLNNUMPAR) FROM #_FINFIN B WHERE B.FVLNID_FIN = _FINFIN.FVLNID_FIN AND B.FVLCTIPFVL = 'BRUTO' ),
                                        _FVLLIQ.FVLNVALLIQ  , _FVLLIQ.FVLNVALINC_P, _FVLLIQ.FVLNVALINC_R, 
                                        CASE WHEN _FVLPAG.FVLDDATPAG IS NOT NULL THEN 'PAGTO'            ELSE _FINFIN.FVLCTIPFVL END AS FVLCTIPFVL ,
                                        CASE WHEN _FVLPAG.FVLDDATPAG IS NOT NULL THEN _FVLPAG.FVLDDATPAG ELSE _FINFIN.FVLDDATPAG END AS FVLDDATPAG ,
                                        CASE WHEN _FVLPAG.FVLDDATPAG IS NOT NULL THEN _FVLPAG.FVLNVALBXA ELSE _FINFIN.FVLNVALBRU END AS FVLNVALBXA ,
                                        _FVLLIQ.FVLNVALLIQ - ABS(_FVLPAG.FVLNVALBXA) AS FVLNVALABE,

                                        _FINFIN.FINCCONPAG, _FINFIN.FVLCTIPINC, _FINFIN.FVLCTIPJUR, _FINFIN.FVLCTIPCAL, 
                                        _FINFIN.FVLNID_FVL, _FINFIN.FVLNID_PAI, _FINFIN.FINNID_NFC, _FINFIN.FVLNID_PFI, _FINFIN.PFICDESCRI, _FINFIN.FVLNID_MPR, 
                                        _FINFIN.FVLNID_BAC, _FINFIN.BANCTIPBAN, 
                                        _FINFIN.FINDDATCAD, _FINFIN.FINDDATEXC, _FINFIN.FVLNFLGEXC, _FINFIN.FVLCUSUCAD, _FINFIN.FVLDDATCAD, _FINFIN.FVLCUSUALT, _FINFIN.FVLDDATALT

                                        ,FINBAC.BACNID_BAN, FINBAC.BACCCODCCO, FINAGR.AGRNID_AGR, FINAGR.AGRCTIPAGR
                                        ,LOJLOJ.LOJCCODLOJ, LOJENT.ENTCAPELID AS LOJCAPELID, ENTENT.ENTCAPELID, ENTENT.ENTCNOMENT, ENTENT.ENTCTIPPES, ENTENT.ENTCCODCPF
                                        ,FVLCHQ.CHQCBANCHQ, FVLCHQ.CHQCAGECHQ, FVLCHQ.CHQCCONCHQ, FVLCHQ.CHQCNUMCHQ, FVLCHQ.CHQCCDCMC7, FVLCHQ.CHQDDATCUS
                                        ,FVLBOL.BOLNID_BOL, FVLBOL.BOLCNUMDUP, FVLBOL.BOLDDATDUP, FVLBOL.BOLCTIPBAR, FVLBOL.BOLCCODBAR, FVLBOL.BOLNID_BAC
                                        ,_FINFIN.FVLNID_CCU, FVLCCU.CCUCCODCCU, FVLCCU.CCUCDESCRI, FINMPR.MPRCDESCRI
                                        ,FINPAG.FPGNID_FPG, FINPAG.FPGNID_FIN, FINPAG.FPGNID_FVL, FINPAG.FPGNVALPAG, FINPAG.FPGDDATPAG, FINPAG.FPGNSEQARQ, FINPAG.FPGDDATLIB, FINPAG.FPGCUSUCAD, FINPAG.FPGDDATCAD
                                        ,CHQDEV.DEVCCODMOT, CHQDEV.DEVDDATMOT, CHQDEV.DEVCCODLOC, CHQDEV.DEVDDATLOC, CHQDEV.DEVDDATPRE, CHQDEV.DEVCDESCRI

                                    INTO #_CONSFIN
                                    FROM #_FINFIN _FINFIN
                                        LEFT JOIN #_FVLLIQ _FVLLIQ ON _FINFIN.FVLNID_FVL = _FVLLIQ.FVLNID_PAI
                                        LEFT JOIN #_FVLPAG _FVLPAG ON _FINFIN.FVLNID_FVL = _FVLPAG.FVLNID_PAI
                                        LEFT JOIN AS_CAD..ASENTLOJ     LOJLOJ WITH (NOLOCK) ON _FINFIN.FINNID_LOJ = LOJLOJ.LOJNID_ENT
                                        LEFT JOIN AS_CAD..ASENTENT     LOJENT WITH (NOLOCK) ON  LOJLOJ.LOJNID_ENT = LOJENT.ENTNID_ENT
                                        LEFT JOIN AS_CAD..ASENTENT     ENTENT WITH (NOLOCK) ON _FINFIN.FINNID_ENT = ENTENT.ENTNID_ENT
                                        LEFT JOIN AS_FIN..ASFINCHQ     FVLCHQ WITH (NOLOCK) ON _FINFIN.FVLNID_FVL = FVLCHQ.CHQNID_FVL
                                        LEFT JOIN AS_FIN..ASFINBOL     FVLBOL WITH (NOLOCK) ON _FINFIN.FVLNID_FVL = FVLBOL.BOLNID_FVL
                                        LEFT JOIN AS_FIN..ASFINCCU     FVLCCU WITH (NOLOCK) ON _FINFIN.FVLNID_CCU = FVLCCU.CCUNID_CCU
                                        LEFT JOIN AS_FIN..ASFINBAC     FINBAC WITH (NOLOCK) ON _FINFIN.FVLNID_BAC = FINBAC.BACNID_BAC
                                        LEFT JOIN AS_FIN..ASFINAGR     FINAGR WITH (NOLOCK) ON _FINFIN.AGRNID_AGR = FINAGR.AGRNID_AGR
                                        LEFT JOIN AS_FIN..ASFINMPR     FINMPR WITH (NOLOCK) ON _FINFIN.FVLNID_MPR = FINMPR.MPRNID_MPR
                                        LEFT JOIN AS_FIN..ASFINFIN_PAG FINPAG WITH (NOLOCK) ON _FINFIN.FVLNID_FVL = FINPAG.FPGNID_FVL
                                        OUTER APPLY ( SELECT TOP 1 * FROM AS_FIN..ASFINDEV WITH (NOLOCK) WHERE DEVNID_CHQ = FVLCHQ.CHQNID_CHQ ORDER BY DEVNID_DEV DESC ) CHQDEV

                                                    IF OBJECT_ID('tempdb..#_CONSNFC') IS NOT NULL
                                            DROP TABLE #_CONSNFC

                                        SELECT CONVERT(BIGINT,0) AS NFCNID_NFC, CONVERT(VARCHAR(250),'') AS NFCCOBSERV, CONVERT(CHAR(01),'') AS NFCC_NFSTA INTO #_CONSNFC

                                        DECLARE @AS_DBNAME NVARCHAR(MAX) = '', @AS_ID_OBJECT INT, @PESQ_NFESQL NVARCHAR(MAX) = ''
                                            
                                        /* --&& (DCA) - 05/02/2025
                                        DECLARE TMP_DBNAME CURSOR FOR
                                            SELECT AS_DBNAME, OBJECT_ID(AS_DBNAME+'..ASNFECAB') AS AS_ID_OBJECT
                                                FROM ( SELECT DISTINCT 'AS_20'+LEFT(FINNID_NFC,4) AS AS_DBNAME FROM #_CONSFIN _CONSFIN WHERE LEFT(FINNID_NFC,2) = 20 ) DB
                                        */ --&& (DCA) - 05/02/2025
                                            
                                        DECLARE TMP_DBNAME CURSOR FOR
                                            SELECT AS_DBNAME, OBJECT_ID(AS_DBNAME+'..ASNFECAB') AS AS_ID_OBJECT
                                                FROM ( SELECT DISTINCT 'AS_20'+LEFT(FINNID_NFC,4) AS AS_DBNAME FROM #_CONSFIN _CONSFIN WHERE LEFT(FINNID_NFC,2) > 01 and RIGHT(LEFT(FINNID_NFC,4),2) between 1 AND 12 ) DB		
                                                    
                                                            
                                        OPEN TMP_DBNAME
                                        FETCH NEXT FROM TMP_DBNAME INTO @AS_DBNAME, @AS_ID_OBJECT
                                        WHILE (@@FETCH_STATUS = 0)
                                        BEGIN
                                            IF @AS_ID_OBJECT is not null
                                                BEGIN
                                                    SET @PESQ_NFESQL = N'
                                                        SET NOCOUNT ON
                                                        INSERT INTO #_CONSNFC ( NFCNID_NFC, NFCCOBSERV, NFCC_NFSTA)
                                                        SELECT NFCNID_NFC, NFCCOBSERV, NFCC_NFSTA FROM '+@AS_DBNAME+'..ASNFECAB WITH (NOLOCK)
                                                            WHERE NFCNID_NFC IN ( SELECT FINNID_NFC FROM #_CONSFIN )
                                                    --&&	  AND NFCCOBSERV IS NOT NULL --&& (DCA) - 05/02/2024
                                                        '
                                                    EXECUTE(@PESQ_NFESQL)
                                                END
                                            FETCH NEXT FROM TMP_DBNAME INTO @AS_DBNAME, @AS_ID_OBJECT
                                        END
                                        CLOSE TMP_DBNAME
                                        DEALLOCATE TMP_DBNAME

                                    


                            /*******************************************************************************************/
                            /*******************************************************************************************/

                            DECLARE @CSQLSTR NVARCHAR(MAX) = ''
                            DECLARE DBA CURSOR FOR
                                SELECT	NAME
                                    FROM SYS.databaseS WITH (NOLOCK)
                                    WHERE NAME LIKE 'AS_2%'
                                    AND CAST(SUBSTRING(NAME,4,6) AS INT) BETWEEN CAST(SUBSTRING(CONVERT(CHAR(10), @DDATINI, 112),1,6) AS INT) 
                                                                            AND CAST(SUBSTRING(CONVERT(CHAR(10), @DDATFIN, 112),1,6) AS INT) 

                                ORDER BY CAST(SUBSTRING(NAME,4,6) AS INT)

                            OPEN DBA

                            FETCH NEXT FROM DBA INTO @CNOMDBA

                            WHILE(@@FETCH_STATUS = 0)
                            BEGIN
                                
                                SET @CSQLSTR = @CSQLSTR + 'SELECT	MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNID_LOJ, 
                                                                    MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNID_PRO, 
                                                                    MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPDDATMOV, 
                                                                    MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPCTIPMVP, 
                                                                    MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPN_NFNUM, 
                                                                    MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNID_FNC,
                                                                    DATEPART(hh,MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPDDATMOV)         AS MVPNHORMOV,
                                                                    MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNQTDMOV*-1                   AS MVPNQTDMOV,
                                                                    (ABS(MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNCUSDIG)*MVPNQTDMOV)*-1 AS MVPNCUSDIG,
                                                                    (ABS(MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNCUSREP)*MVPNQTDMOV)*-1 AS MVPNCUSREP,
                                                                    (ABS(MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNCUSCSI)*MVPNQTDMOV)*-1 AS MVPNCUSCSI,
                                                                    MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNVLRVDA*-1                   AS MVPNVLRVDA,
                                                                    ISNULL(MVI'+SUBSTRING(@CNOMDBA,4,6)+'.MVINVLRMVI*-1,0)         AS MVINVLRMVI,
                                                                    CASE WHEN MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNVLROFE = 1 THEN 2 ELSE 1 END AS MVPNVLROFE 
                                                                FROM '+@CNOMDBA+'..ASPROMVP MVP'+SUBSTRING(@CNOMDBA,4,6)+' WITH (NOLOCK) '	+ CHAR(13)+CHAR(10) + '
                                                            LEFT JOIN ( SELECT MVINID_MVP, SUM(MVINVLRMVI) AS MVINVLRMVI
                                                                    FROM '+@CNOMDBA+'..ASPROMVP_INC WITH (NOLOCK)
                                                                    GROUP BY MVINID_MVP) AS MVI'+SUBSTRING(@CNOMDBA,4,6)+' ON MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNID_MVP = MVI'+SUBSTRING(@CNOMDBA,4,6)+'.MVINID_MVP
                                                        '+
                                                        'WHERE MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPDDATMOV BETWEEN @DDATINI AND @DDATFIN '  + CHAR(13)+CHAR(10) + 
                                                        '  AND MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPCTIPMVP IN (''VDACX'',''VDALE'',''VDANF'',''VDAPE'')
                                                           AND MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNID_LOJ IN (
																SELECT USLNID_LOJ FROM tempdb..#_USULOJ
														   )
                                                        '		

                                FETCH NEXT FROM DBA INTO @CNOMDBA

                                IF @@FETCH_STATUS = 0
                                    SET @CSQLSTR = @CSQLSTR + CHAR(13)+CHAR(10) +
                                                        '' + CHAR(13)+CHAR(10) +
                                                        'UNION ALL' +
                                                        '' + CHAR(13)+CHAR(10) + CHAR(13)+CHAR(10)
                            END

                            SET @CSQLSTR = '
                                ;WITH VLRFIN AS (
                                SELECT  _CONSFIN.*,
                                            CASE WHEN FINCTIPOPE = ''P'' THEN ISNULL(FVLNVALBRU,0.00) ELSE 0.00 END AS FVLNVALBRU_P,
                                            CASE WHEN FINCTIPOPE = ''P'' THEN ISNULL(FVLNVALLIQ,0.00) ELSE 0.00 END AS FVLNVALLIQ_P,
                                            CASE WHEN FINCTIPOPE = ''P'' THEN ISNULL(FVLNVALABE,0.00) ELSE 0.00 END AS FVLNVALABE_P,
                                            CASE WHEN FINCTIPOPE = ''P'' THEN ISNULL(FVLNVALBXA,0.00) ELSE 0.00 END AS FVLNVALBXA_P,
                                            CASE WHEN FINCTIPOPE = ''R'' THEN ISNULL(FVLNVALBRU,0.00) ELSE 0.00 END AS FVLNVALBRU_R,
                                            CASE WHEN FINCTIPOPE = ''R'' THEN ISNULL(FVLNVALLIQ,0.00) ELSE 0.00 END AS FVLNVALLIQ_R,
                                            CASE WHEN FINCTIPOPE = ''R'' THEN ISNULL(FVLNVALABE,0.00) ELSE 0.00 END AS FVLNVALABE_R,
                                            CASE WHEN FINCTIPOPE = ''R'' THEN ISNULL(FVLNVALBXA,0.00) ELSE 0.00 END AS FVLNVALBXA_R,
                                            ISNULL(_CONSNFC.NFCCOBSERV,'''') AS NFCCOBSERV,
                                            IsNull(_CONSNFC.NFCC_NFSTA,'''') AS NFCC_NFSTA --&& (DCA) - 05/02/2025
                                    FROM #_CONSFIN _CONSFIN
                                        LEFT JOIN #_CONSNFC _CONSNFC ON _CONSFIN.FINNID_NFC = _CONSNFC.NFCNID_NFC AND _CONSFIN.FVLNID_PAI IS NULL

                                    WHERE _CONSFIN.FVLNID_PAI IS NULL
                                     --&& (DCA) - 20/05/2025
                                      AND _CONSFIN.FINDDATENT BETWEEN @DDATINI AND @DDATFIN  
                                     --&& (DCA) - 20/05/2025 
                                  
                                    ), TOTFIN AS (
                                            
                                    SELECT  FINNID_LOJ,
                                            SUM(IIF(FINCTIPOPE=''P'',FVLNVALBRU*-1,0))											AS PAGNVALBRU,
                                            SUM(IIF(FINCTIPOPE=''P'',IIF(ISNULL(FVLNVALABE,0)>0,FVLNVALABE,FVLNVALLIQ)*-1,0))	AS PAGNVALLIQ,
                                            SUM(IIF(FINCTIPOPE=''R'',FVLNVALBRU,0))												AS RECNVALBRU,
                                            SUM(IIF(FINCTIPOPE=''R'',IIF(ISNULL(FVLNVALABE,0)>0,FVLNVALABE,FVLNVALLIQ),0))		AS RECNVALLIQ 
                                        FROM VLRFIN FIN 
                                        WHERE FIN.FINDDATEXC IS NULL AND FVLCTIPFVL = ''BRUTO''
                                        GROUP BY FVLCTIPFVL, FINNID_LOJ
                                
                                ), _PESMES AS (
                                ' + @CSQLSTR + '
                                ), _TIKET AS (
                                
                                    SELECT	MAX(TIK.MVPNID_LOJ)		AS MVPNID_LOJ, 
                                            COUNT(TIK.MVPN_TIKET)	AS MVPN_TIKET
                                            FROM (
                                                    SELECT	ROW_NUMBER() OVER (PARTITION BY MVP.MVPNID_LOJ, MVP.MVPNID_FNC, MVP.MVPN_NFNUM ORDER BY MVP.MVPNID_LOJ, MVP.MVPNID_FNC, MVP.MVPN_NFNUM) AS MVPN_TIKET,
                                                    MVP.MVPNID_LOJ, MVP.MVPNID_FNC, MVP.MVPN_NFNUM 
                                                    FROM _PESMES MVP 
                                    
                                                    GROUP BY MVP.MVPNID_LOJ, MVP.MVPNID_FNC, MVP.MVPN_NFNUM
                                        ) AS TIK
                                        GROUP BY TIK.MVPNID_LOJ

                                ), PROMVP AS (
                                SELECT  MVP.MVPNID_LOJ, SUM(MVPNVLRVDA) MVPNVLRVDA  
                                        FROM _PESMES MVP	
                                    GROUP BY MVP.MVPNID_LOJ
                                ), VDAFIN AS ( 
                                SELECT		ENT.ENTNID_ENT AS FINNID_LOJ, 
                                            LOJ.LOJCCODLOJ AS FINCCODLOJ,
                                            ENT.ENTCAPELID AS FINCAPELID,
                                            ENT.ENTCNOMENT AS FINCNOMENT,
                                            MVP.MVPNVLRVDA AS FINNVLRVDA,
                                            TIK.MVPN_TIKET AS FINN_TIKET,
                                            FIN.PAGNVALBRU,	  
                                            FIN.PAGNVALLIQ,
                                            FIN.RECNVALBRU,
                                            FIN.RECNVALLIQ
                                            
                                        FROM PROMVP MVP
                                    LEFT JOIN AS_CAD..ASENTENT ENT WITH (NOLOCK) ON ENT.ENTNID_ENT = MVP.MVPNID_LOJ
                                    LEFT JOIN AS_CAD..ASENTLOJ LOJ WITH (NOLOCK) ON LOJ.LOJNID_ENT = MVP.MVPNID_LOJ
                                    LEFT JOIN			 TOTFIN FIN WITH (NOLOCK) ON FIN.FINNID_LOJ = MVP.MVPNID_LOJ
                                    LEFT JOIN			 _TIKET TIK WITH (NOLOCK) ON TIK.MVPNID_LOJ = MVP.MVPNID_LOJ
                                    ) SELECT * FROM VDAFIN FIN
                                        ${prvcsqlwhr ? prvcsqlwhr : ''}
                                      ORDER BY FIN.FINCCODLOJ

                                

                            '
                            EXECUTE SP_EXECUTESQL @CSQLSTR, N'@DDATINI DATETIME, @DDATFIN DATETIME ', @DDATINI, @DDATFIN 

                            CLOSE DBA
                            DEALLOCATE DBA

                            IF OBJECT_ID('tempdb..#tmpFINCCU') IS NOT NULL 
                                DROP TABLE #tmpFINCCU

                            IF OBJECT_ID('tempdb..#_CONSNFI') IS NOT NULL
                                DROP TABLE #_CONSNFI

                            IF OBJECT_ID('tempdb..#_CONSNFC') IS NOT NULL
                                DROP TABLE #_CONSNFC

                            IF OBJECT_ID('tempdb..#_CONSFIN') IS NOT NULL
                                DROP TABLE #_CONSFIN

                            IF OBJECT_ID('tempdb..#_FINFVL') IS NOT NULL
                                DROP TABLE #_FINFVL

                            IF OBJECT_ID('tempdb..#_FINFIN') IS NOT NULL
                                DROP TABLE #_FINFIN

                            IF OBJECT_ID('tempdb..#_FVLPAG') IS NOT NULL
                                DROP TABLE #_FVLPAG

                            IF OBJECT_ID('tempdb..#_FVLLIQ') IS NOT NULL
                                DROP TABLE #_FVLLIQ

                            IF OBJECT_ID('tempdb..#_USULOJ') IS NOT NULL
                                DROP TABLE #_USULOJ    
                            `
        return prvcsqlstr;
    }
}
 
export default new as_usumenService()