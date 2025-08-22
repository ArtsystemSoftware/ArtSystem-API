import { as_mssql } from "@root/models";
import { ASPROMOV_RAN } from "@root/interfaces";
import { as_tokenService } from "@root/services";

class as_usumenService {
    
 async as_get(token: string, aspromov_ran: ASPROMOV_RAN = {} as ASPROMOV_RAN) {
        
        const { MVPDDATINI , MVPDDATFIN, MVPNRANKIN = 10 } = aspromov_ran;
        
        let conditions: string[] = [];
        // const restrictedFields = new Set<keyof ASPROMOV_RAN>(['MENNPAGNUM', 'MENNPAGLIM']);
        const restrictedFields = new Set(Object.keys(aspromov_ran));
        const user = await as_tokenService.as_getUser(token);

        for (const key in aspromov_ran) {
            
            if (restrictedFields.has(key.toUpperCase() as keyof ASPROMOV_RAN)) continue;

            if (aspromov_ran.hasOwnProperty(key) && aspromov_ran[key as keyof ASPROMOV_RAN] !== undefined) {
                conditions.push(`${key} = @${key}`);
            }
            
        }
        
        const prvcsqlwhr = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        let prvcsqlstr = `
                            
                            SET DATEFORMAT DMY
                            DECLARE @DDATINI DATETIME = '${MVPDDATINI ? MVPDDATINI : "01'+RIGHT(CONVERT(CHAR(10), GETDATE(), 103),8)+' 00:00:00"}'
                            DECLARE @DDATFIN DATETIME = '${MVPDDATFIN ? MVPDDATFIN : "'+CONVERT(CHAR(10), GETDATE(), 103)+' 23:59:59"}'
                            DECLARE @CNOMDBA CHAR(09) = ''
                            DECLARE @CSQLSTR NVARCHAR(MAX) = ''
                            DECLARE @CID_LOJ NVARCHAR(MAX) = (
                                                                SELECT STUFF((
                                                                    SELECT ', ' + CAST(LOJNID_ENT AS VARCHAR)
                                                                    FROM AS_CAD..ASENTLOJ WITH (NOLOCK)
                                                                    WHERE LOJCLICART IS NULL
                                                                    AND LOJNID_ENT IN (
                                                                        SELECT USLNID_LOJ FROM AS_CAD..ASENTUSU_LOJ WITH (NOLOCK) 
                                                                        WHERE USLNID_USU = ${user.recordset[0].APINID_USU}
                                                                    )
                                                                    FOR XML PATH(''), TYPE).value('.', 'NVARCHAR(MAX)')
                                                                , 1, 2, '')
                                                            )

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
                                                                    SUM(MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNQTDMOV)*(-1) AS MVPNQTDMOV,
																	SUM(MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNVLRVDA)*(-1) AS MVPNVLRVDA
                                                            FROM '+@CNOMDBA+'..ASPROMVP MVP'+SUBSTRING(@CNOMDBA,4,6)+' WITH (NOLOCK) 
                                                            WHERE MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPCTIPMVP IN (''VDACX'',''VDALE'',''VDANF'',''VDAPE'')
                                                            AND MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPDDATMOV BETWEEN @DDATINI AND @DDATFIN
                                                            AND MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNID_LOJ IN ('+@CID_LOJ+')

                                                        GROUP BY MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNID_LOJ, 
                                                                MVP'+SUBSTRING(@CNOMDBA,4,6)+'.MVPNID_PRO'

                                FETCH NEXT FROM DBA INTO @CNOMDBA

                                IF @@FETCH_STATUS = 0
                                    SET @CSQLSTR = @CSQLSTR + CHAR(13)+CHAR(10) +
                                                        '' + CHAR(13)+CHAR(10) +
                                                        'UNION ALL' +
                                                        '' + CHAR(13)+CHAR(10) + CHAR(13)+CHAR(10)
                            END

                            SET @CSQLSTR = ';WITH MOVPRO AS ('+
                                                                @CSQLSTR
                                                            +'), MOVTOT AS (
                                                            SELECT MVP.MVPNID_LOJ, 
                                                                    MVP.MVPNID_PRO, 
                                                                    SUM(MVP.MVPNQTDMOV) AS MVPNQTDMOV,
																	SUM(MVP.MVPNVLRVDA) AS MVPNVLRVDA
                                                                FROM MOVPRO MVP GROUP BY MVP.MVPNID_LOJ, MVP.MVPNID_PRO ),
                                                                MOVRAN AS (
                                                                SELECT	LOJ.LOJNID_ENT,
                                                                        LOJ.LOJCCODLOJ,
                                                                        ENT.ENTCAPELID AS LOJCAPELID,
                                                                        PRO.PROCCODPRO,
                                                                        PRO.PROCDESCRI,
                                                                        MVP.MVPNQTDMOV,
																		MVP.MVPNVLRVDA,
                                                                        ROW_NUMBER() OVER(PARTITION BY MVP.MVPNID_LOJ ORDER BY MVP.MVPNQTDMOV DESC ) AS MVPNRANKIN
                                                                    FROM MOVTOT MVP 
                                                            LEFT JOIN AS_CAD..ASPROPRO PRO WITH (NOLOCK) ON PRO.PRONID_PRO = MVP.MVPNID_PRO
                                                            LEFT JOIN AS_CAD..ASENTENT ENT WITH (NOLOCK) ON ENT.ENTNID_ENT = MVP.MVPNID_LOJ
                                                            LEFT JOIN AS_CAD..ASENTLOJ LOJ WITH (NOLOCK) ON LOJ.LOJNID_ENT = MVP.MVPNID_LOJ
                                                            ) SELECT * FROM MOVRAN
                                                               WHERE MVPNRANKIN <= ${MVPNRANKIN}
                                                                ORDER BY LOJCCODLOJ, MVPNRANKIN
                                                                '


                                EXECUTE SP_EXECUTESQL @CSQLSTR, N'@DDATINI DATETIME, @DDATFIN DATETIME ', @DDATINI, @DDATFIN 
                                CLOSE DBA
                                DEALLOCATE DBA
                            `
        

        const result = await as_mssql.Assqlexec(prvcsqlstr, { params: { ...aspromov_ran }, token });
    
        return result?.recordset;
    }
    
    async as_Create(token: string, aspromov_ran: Partial<ASPROMOV_RAN>) {
        throw new Error('Cannot inert values.');
    }

    async as_Update(token: string, aspromov_ran: Partial<ASPROMOV_RAN>, whereConditions: Partial<ASPROMOV_RAN>) {
        throw new Error('Cannot update values.');
    }
    
    async as_Delete(token: string, aspromov_ran: Partial<ASPROMOV_RAN>) {
        throw new Error('Cannot delete values.');
    }
    
    
}
 
export default new as_usumenService()