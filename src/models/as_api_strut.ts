import { as_mssql }         from "@root/models";
import { as_api_entServices } from "@root/services";
import { as_Date  }         from "@root/utils";
import { as_api_version }   from "@root/utils";
import { as_tokenUtils }    from "@root/utils";
import { ASENTAPI }         from "@root/interfaces";

const prvcdatbas = 'AS_API';

const as_api_strut_ASGOOGLE_KEY = async() => {
    console.log('ASGOOGLE_KEY - Creating table');
    let query = `
        USE ${prvcdatbas}
        
        IF NOT EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'ASGOOGLE_KEY')
			CREATE TABLE [ASGOOGLE_KEY](
                GOGCUIDGOG UNIQUEIDENTIFIER NOT NULL,	--&& UUID as Primary Key with automatic generation
                GOGCCODKEY [VARCHAR](60)    NOT NULL,	--&& Key of Google API
                GOGCCOD_CX [VARCHAR](25)    NOT NULL,	--&& Custom Search ID
                GOGDDATEXP [DATETIME]           NULL,   --&& DATA DE EXPIRAÇÃO
                GOGDDATCAD [DATETIME]       NOT NULL,   --&& DATA DE CADASTRO
            ) ON [PRIMARY]

        `
        
        await as_mssql.Assqlexec(query);

        console.log('ASGOOGLE_KEY - Adding PK');
        query = `
        USE ${prvcdatbas}
        
        IF OBJECT_ID('ASGOOGLE_KEY_PK','PK') IS NOT NULL
            ALTER TABLE ASGOOGLE_KEY DROP CONSTRAINT ASGOOGLE_KEY_PK

        ALTER TABLE ASGOOGLE_KEY ADD CONSTRAINT ASGOOGLE_KEY_PK PRIMARY KEY    CLUSTERED (GOGCUIDGOG)
            WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

        `
        await as_mssql.Assqlexec(query);

        console.log('ASGOOGLE_KEY - Creating DF');
        query = `
            USE ${prvcdatbas}
            
            IF OBJECT_ID('ASGOOGLE_KEY_DF_GOGCUIDGOG','D') IS NOT NULL
                ALTER TABLE ASGOOGLE_KEY DROP CONSTRAINT ASGOOGLE_KEY_DF_GOGCUIDGOG

            ALTER TABLE ASGOOGLE_KEY ADD CONSTRAINT ASGOOGLE_KEY_DF_GOGCUIDGOG DEFAULT NEWID() FOR GOGCUIDGOG

            IF OBJECT_ID('ASGOOGLE_KEY_DF_GOGDDATCAD','D') IS NOT NULL
                ALTER TABLE ASGOOGLE_KEY DROP CONSTRAINT ASGOOGLE_KEY_DF_GOGDDATCAD

            ALTER TABLE ASGOOGLE_KEY ADD CONSTRAINT ASGOOGLE_KEY_DF_GOGDDATCAD DEFAULT GETDATE() FOR GOGDDATCAD

        `
        await as_mssql.Assqlexec(query);


}

const as_api_strut_ASAPIPRO_IMG = async () => {
    console.log('ASAPIPRO_IMG - Creating table');
    let query = `
        USE ${prvcdatbas}

        IF NOT EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'ASAPIPRO_IMG')
			CREATE TABLE [ASAPIPRO_IMG](
                PIMCUIDPIM UNIQUEIDENTIFIER NOT NULL,	--&& UUID as Primary Key with automatic generation
                PIMCCODEAN [VARCHAR](14)    NOT NULL,	--&& EAN DO PRODUTO
                PIMCURLIMG [VARCHAR](999)       NULL,	--&& URL DA IMAGEM
                PIMCORIGEM [VARCHAR](20)        NULL,	--&& ORIGEM DA IMAGEM (GOOGLE, ARTSYSTEM, ETC)
                PIMDDATCAD [DATETIME]       NOT NULL,   --&& DATA DE CADASTRO
            ) ON [PRIMARY]

        ELSE
            IF NOT EXISTS(SELECT NAME FROM SYSCOLUMNS WHERE ID = OBJECT_ID('ASAPIPRO_IMG') AND NAME = 'PIMDDATCAD')
				BEGIN
					ALTER TABLE [ASAPIPRO_IMG] ADD PIMDDATCAD [DATETIME] NOT NULL CONSTRAINT ASAPIPRO_IMG_DF_PIMDDATCAD DEFAULT GETDATE()
					ALTER TABLE [ASAPIPRO_IMG] DROP CONSTRAINT ASAPIPRO_IMG_DF_PIMDDATCAD
				END    
            
            IF EXISTS(SELECT NAME FROM SYSCOLUMNS WHERE ID = OBJECT_ID('ASAPIPRO_IMG') AND NAME = 'PIMCURLIMG' AND isnullable = 0)
                BEGIN
                    ALTER TABLE [ASAPIPRO_IMG] ALTER COLUMN PIMCURLIMG [VARCHAR](999)
                END

    `
    
    await as_mssql.Assqlexec(query)

    console.log('ASAPIPRO_IMG - Adding PK');
    query = `
        USE ${prvcdatbas}
        
        IF OBJECT_ID('ASAPIPRO_IMG_PK','PK') IS NOT NULL
            ALTER TABLE ASAPIPRO_IMG DROP CONSTRAINT ASAPIPRO_IMG_PK

        ALTER TABLE ASAPIPRO_IMG ADD CONSTRAINT ASAPIPRO_IMG_PK PRIMARY KEY    CLUSTERED (PIMCUIDPIM)
            WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

    `
    await as_mssql.Assqlexec(query)

    console.log('ASAPIPRO_IMG - Creating DF');
    query = `
        USE ${prvcdatbas}

        IF OBJECT_ID('ASAPIPRO_IMG_DF_PIMCUIDPIM','D') IS NOT NULL
		    ALTER TABLE ASAPIPRO_IMG DROP CONSTRAINT ASAPIPRO_IMG_DF_PIMCUIDPIM

	    ALTER TABLE ASAPIPRO_IMG ADD CONSTRAINT ASAPIPRO_IMG_DF_PIMCUIDPIM DEFAULT NEWID() FOR PIMCUIDPIM
        
        IF OBJECT_ID('ASAPIPRO_IMG_DF_PIMDDATCAD','D') IS NOT NULL
            ALTER TABLE ASAPIPRO_IMG DROP CONSTRAINT ASAPIPRO_IMG_DF_PIMDDATCAD

        ALTER TABLE ASAPIPRO_IMG ADD CONSTRAINT ASAPIPRO_IMG_DF_PIMDDATCAD DEFAULT GETDATE() FOR PIMDDATCAD

    `
    await as_mssql.Assqlexec(query)
}

const as_api_strut_ASENTAPI = async () => {
    
    let query = `
        USE ${prvcdatbas}

        IF EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'APICUIDAPT_RL_APT')
			ALTER TABLE ASARTAPI DROP CONSTRAINT APICUIDAPT_RL_APT
    `
    
    await as_mssql.Assqlexec(query)    


    console.log('ASENTAPI - Creating table');
    query = `
        USE ${prvcdatbas}
		
		IF NOT EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'ASENTAPI')
			CREATE TABLE [ASENTAPI](
				APTCUIDAPT UNIQUEIDENTIFIER NOT NULL,	--&& UUID as Primary Key with automatic generation
				APTCUIDENT UNIQUEIDENTIFIER NOT NULL,	--&& UUID DA ENTIDADE CLIENTE DO ARTSYSTEM
				APTNID_ENT [INT]			NOT NULL,	--&& ID DO CLIENTE
			    APTC_TOKEN [VARCHAR](999)	NOT NULL,	--&& TOKEN DO CLIENTE
                APTCCODCPF [VARCHAR](15)	NOT NULL,	--&& CPF/CNPJ DO CLIENTE
				APTCSERVER [VARCHAR](50)	NOT NULL,	--&& Nome/IP do Servidor
				APTCINSTAN [VARCHAR](30)		NULL,	--&& Instãncia do Banco de dados
				APTN_PORTA [INT]				NULL,	--&& Porta de conexão
				APTCUSUCAD [VARCHAR] (15)		NULL,	--&& USUÁRIO DE CADASTRO
				APTDDATCAD [DATETIME]			NULL,	--&& DATA DE CADASTRO	
				APTCUSUALT [VARCHAR] (15)		NULL,	--&& USUÁRIO DE ALTERAÇÃO
				APTDDATALT [DATETIME]			NULL	--&& DATA DE ALTERAÇÃO
				) ON [PRIMARY]
		Else
			IF NOT EXISTS(SELECT NAME FROM SYSCOLUMNS WHERE ID = OBJECT_ID('ASENTAPI') AND NAME = 'APTCCODCPF')
				ALTER TABLE [ASENTAPI] ADD APTCCODCPF [VARCHAR](15) NOT NULL
                
            IF NOT EXISTS(SELECT NAME FROM SYSCOLUMNS WHERE ID = OBJECT_ID('ASENTAPI') AND NAME = 'APTC_TOKEN')
            BEGIN
		    	ALTER TABLE [ASENTAPI] ADD APTC_TOKEN [VARCHAR](999) NOT NULL CONSTRAINT ASENTAPI_DF_APTC_TOKEN DEFAULT 'TOKEN'   
                ALTER TABLE [ASENTAPI] DROP CONSTRAINT ASENTAPI_DF_APTC_TOKEN
            END 
    `
    

    await as_mssql.Assqlexec(query)

    // PRIMARY KEYS
    console.log('ASENTAPI - Adding PK');
    query = `
        USE ${prvcdatbas}
        IF  OBJECT_ID ('ASENTAPI_PK', 'PK') IS NOT NULL
			ALTER TABLE ASENTAPI DROP CONSTRAINT ASENTAPI_PK

        IF OBJECT_ID('ASENTAPI_PK','PK') IS NOT NULL
            ALTER TABLE ASENTAPI DROP CONSTRAINT ASENTAPI_PK

        ALTER TABLE ASENTAPI ADD CONSTRAINT ASENTAPI_PK PRIMARY KEY    CLUSTERED (APTCUIDAPT)
            WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]


    `
    
    await as_mssql.Assqlexec(query)

    // NON-CLUSTERED KEYS 
    console.log('ASENTAPI - Creating IX');
    query = `
        USE ${prvcdatbas}
        IF EXISTS (SELECT NAME FROM SYS.INDEXES WHERE NAME = 'ASENTAPI_IX_APTCUIDENT')
			DROP INDEX ASENTAPI_IX_APTCUIDENT ON ASENTAPI

        IF EXISTS (SELECT NAME FROM SYS.INDEXES WHERE NAME = 'ASENTAPI_IX_APTCUIDENT')
            DROP INDEX ASENTAPI_IX_APTCUIDENT ON ASENTAPI

        CREATE UNIQUE  NONCLUSTERED INDEX ASENTAPI_IX_APTCUIDENT ON ASENTAPI (APTCUIDENT,APTNID_ENT)
            WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
    `

    await as_mssql.Assqlexec(query)

    //DEFAULTs
    console.log('ASENTAPI - Adding DF');
    query = `
        USE ${prvcdatbas}
        IF  OBJECT_ID ('ASENTAPI_DF_APTCUIDAPT' , 'D' ) IS NOT NULL
			ALTER TABLE ASENTAPI DROP CONSTRAINT ASENTAPI_DF_APTCUIDAPT

        IF OBJECT_ID('ASENTAPI_DF_APTCUIDAPT','D') IS NOT NULL
            ALTER TABLE ASENTAPI DROP CONSTRAINT ASENTAPI_DF_APTCUIDAPT

        ALTER TABLE ASENTAPI ADD CONSTRAINT ASENTAPI_DF_APTCUIDAPT DEFAULT NEWID() FOR APTCUIDAPT

            IF  OBJECT_ID ('ASENTAPI_DF_APTCUIDENT' , 'D' ) IS NOT NULL
                ALTER TABLE ASENTAPI DROP CONSTRAINT ASENTAPI_DF_APTCUIDENT

        IF OBJECT_ID('ASENTAPI_DF_APTCUIDENT','D') IS NOT NULL
            ALTER TABLE ASENTAPI DROP CONSTRAINT ASENTAPI_DF_APTCUIDENT

        ALTER TABLE ASENTAPI ADD CONSTRAINT ASENTAPI_DF_APTCUIDENT DEFAULT NEWID() FOR APTCUIDENT

    `
    await as_mssql.Assqlexec(query)
    
}

const as_api_strut_Credential = async () => {
    // console.log('Creating Credential structure');
    let query = ``
    let asentapi: Partial<ASENTAPI> = {
                                        APTNID_ENT: 1, 
                                        APTCCODCPF: '014405027000179', 
                                        APTCSERVER: '192.168.15.240',
                                        APTCINSTAN: 'SARTSYSTEM',
                                        APTN_PORTA: 53655,
                                      }

    const response = (await as_api_entServices.as_get({APTCCODCPF: asentapi.APTCCODCPF} as ASENTAPI))[0];
    
    if (response) {
        return;
    }

    query = `SELECT * FROM AS_CAD..ASENTENT WHERE ENTCCODCPF = @APTCCODCPF`
    const asentent = (await as_mssql.Assqlexec_server(query, {APTCCODCPF: '014405027000179'})).recordset[0];
    asentapi.APTNID_ENT = asentent.ENTNID_ENT;
    asentapi.APTC_TOKEN = as_tokenUtils.as_JwtToken_encrypt({username: 'sa', password: '1s860t77r@'});

    await as_api_entServices.as_Create(asentapi);
    
}

const as_api_strut_ASARTAPI = async () => {

    console.log('ASARTAPI - Creating table');
    let query = `
        USE ${prvcdatbas}
		
		IF NOT EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'ASARTAPI')
			CREATE TABLE [ASARTAPI](
				APICUIDAPI UNIQUEIDENTIFIER NOT NULL,	--&& UUID as Primary Key with automatic generation
				APICUIDAPT UNIQUEIDENTIFIER NOT NULL,	--&& UUID DA TABELA ASENTAPI
				APINID_USU [INT]			NOT NULL,	--&& ID DO USUÁRIO NO BANCO DE DADOS DO CLIENTE DO ARTSYSTEM
				APICUSUNOM [VARCHAR] (25)	NOT NULL,	--&& NOME DO USUÁRIO 
				APIC_TOKEN [VARCHAR](999)   NOT NULL,   --&& TOKEN COM CREDENCIAIS DE CONEXÃO (SOMENTE DE USO INTERNO DA API)
				APICACCTKN [VARCHAR](999)	NOT NULL,	--&& ACCESS TOKEN DO USUÁRIO 
				APICRFSTKN [VARCHAR](999)	NOT NULL,	--&& REFRESH TOKEN DO USUÁRIO
				APINEXPDAT [INT]			NOT NULL,	--&& VIDA ÚTIL DO TOKEN AM SEGUNDOS
				APIDDATTKN [DATETIME]		NOT NULL,	--&& DATA DE CRIAÇÃO DO TOKEN
				APICUSUCAD [VARCHAR] (15)		NULL,	--&& USUÁRIO DE CADASTRO
				APIDDATCAD [DATETIME]			NULL,	--&& DATA DE CADASTRO	
				APICUSUALT [VARCHAR] (15)		NULL,	--&& USUÁRIO DE ALTERAÇÃO
				APIDDATALT [DATETIME]			NULL	--&& DATA DE ALTERAÇÃO
				) ON [PRIMARY]
        ELSE
            IF NOT EXISTS(SELECT NAME FROM SYSCOLUMNS WHERE ID = OBJECT_ID('ASARTAPI') AND NAME = 'APIC_TOKEN')
            BEGIN
                ALTER TABLE [ASARTAPI] ADD APIC_TOKEN [VARCHAR](999) NOT NULL CONSTRAINT ASARTAPI_DF_APIC_TOKEN DEFAULT 'TOKEN'   
                ALTER TABLE [ASARTAPI] DROP CONSTRAINT ASARTAPI_DF_APIC_TOKEN
            END          
    `
    await as_mssql.Assqlexec(query)

    // PRIMARY KEYS
    console.log('ASARTAPI - Adding PK');
    query = `
        USE ${prvcdatbas}

        IF  OBJECT_ID ('ASARTAPI_PK', 'PK') IS NOT NULL
			ALTER TABLE ASARTAPI DROP CONSTRAINT ASARTAPI_PK

        IF OBJECT_ID('ASARTAPI_PK','PK') IS NOT NULL
            ALTER TABLE ASARTAPI DROP CONSTRAINT ASARTAPI_PK

        ALTER TABLE ASARTAPI ADD CONSTRAINT ASARTAPI_PK PRIMARY KEY    CLUSTERED (APICUIDAPI)
            WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]

    `
    
    await as_mssql.Assqlexec(query)

    // NON-CLUSTERED KEYS 
    console.log('ASARTAPI - Creating IX');
    query = `
        USE ${prvcdatbas}

        IF EXISTS (SELECT NAME FROM SYS.INDEXES WHERE NAME = 'ASARTAPI_IX_APICACCTKN')
			DROP INDEX ASARTAPI_IX_APICACCTKN ON ASARTAPI

        IF EXISTS (SELECT NAME FROM SYS.INDEXES WHERE NAME = 'ASARTAPI_IX_APICACCTKN')
            DROP INDEX ASARTAPI_IX_APICACCTKN ON ASARTAPI

        CREATE UNIQUE  NONCLUSTERED INDEX ASARTAPI_IX_APICACCTKN ON ASARTAPI (APICACCTKN,APICUIDAPT)
            WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
        
            IF EXISTS (SELECT NAME FROM SYS.INDEXES WHERE NAME = 'ASARTAPI_IX_APICRFSTKN')
                DROP INDEX ASARTAPI_IX_APICRFSTKN ON ASARTAPI

        IF EXISTS (SELECT NAME FROM SYS.INDEXES WHERE NAME = 'ASARTAPI_IX_APICRFSTKN')
            DROP INDEX ASARTAPI_IX_APICRFSTKN ON ASARTAPI

        CREATE UNIQUE  NONCLUSTERED INDEX ASARTAPI_IX_APICRFSTKN ON ASARTAPI (APICRFSTKN,APICUIDAPT)
            WITH( STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON) ON [PRIMARY]
        

    `

    await as_mssql.Assqlexec(query)

    //DEFAULTs
    console.log('ASARTAPI - Adding DF');
    query = `
        USE ${prvcdatbas}

        IF  OBJECT_ID ('ASARTAPI_DF_APICUIDAPI' , 'D' ) IS NOT NULL
			ALTER TABLE ASARTAPI DROP CONSTRAINT ASARTAPI_DF_APICUIDAPI

        IF OBJECT_ID('ASARTAPI_DF_APICUIDAPI','D') IS NOT NULL
            ALTER TABLE ASARTAPI DROP CONSTRAINT ASARTAPI_DF_APICUIDAPI

        ALTER TABLE ASARTAPI ADD CONSTRAINT ASARTAPI_DF_APICUIDAPI DEFAULT NEWID() FOR APICUIDAPI

            IF  OBJECT_ID ('ASARTAPI_DF_APIDDATTKN' , 'D' ) IS NOT NULL
                ALTER TABLE ASARTAPI DROP CONSTRAINT ASARTAPI_DF_APIDDATTKN

        IF OBJECT_ID('ASARTAPI_DF_APIDDATTKN','D') IS NOT NULL
            ALTER TABLE ASARTAPI DROP CONSTRAINT ASARTAPI_DF_APIDDATTKN

        ALTER TABLE ASARTAPI ADD CONSTRAINT ASARTAPI_DF_APIDDATTKN DEFAULT GETDATE() FOR APIDDATTKN
    `

    await as_mssql.Assqlexec(query);

    // RELATIONSHIPS
    console.log('ASARTAPI - Adding RL');
    query = `
        USE ${prvcdatbas}

        IF EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'APICUIDAPT_RL_APT')
			ALTER TABLE ASARTAPI DROP CONSTRAINT APICUIDAPT_RL_APT

	
        IF EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'APICUIDAPT_RL_APT')
            ALTER TABLE ASARTAPI DROP CONSTRAINT APICUIDAPT_RL_APT
        
        IF EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'ASARTAPI') AND
        EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'ASENTAPI')
        BEGIN 
            ALTER TABLE ASARTAPI WITH CHECK ADD  CONSTRAINT APICUIDAPT_RL_APT FOREIGN KEY(APICUIDAPT) REFERENCES ASENTAPI (APTCUIDAPT) 
            ALTER TABLE ASARTAPI      CHECK      CONSTRAINT APICUIDAPT_RL_APT
        END
        

    `

    await as_mssql.Assqlexec(query)

}

//////////////////////////////////////////////
const as_api_strut_database = async () => {
    const query = `SELECT ISNULL(DB_ID('${prvcdatbas}'),0) AS DB_ID`;
    
    const result = await as_mssql.Assqlexec(query)

    if (result.recordset[0].DB_ID === 0) {
        console.log(`Creating database ${prvcdatbas}`);
        const createQuery = `CREATE DATABASE [${prvcdatbas}] COLLATE SQL_Latin1_General_CP1_CI_AI`;
        await as_mssql.Assqlexec(createQuery).then(() => {
            console.log(`Database ${prvcdatbas} created successfully.`);
        }).catch((error: Error) => {
            console.error(`Error creating database ${prvcdatbas}:`, error);
        });
    }
}
const as_api_strut_update = async () => {
    const version_date = new as_Date('2025-07-17 18:00:00')
    let update_date = false;
    

    let query = `
        IF NOT EXISTS(	SELECT * FROM ${prvcdatbas}.SYS.EXTENDED_PROPERTIES WHERE NAME='VERSION' )     
			EXEC ${prvcdatbas}.sys.sp_addextendedproperty @name=N'VERSION', @value='${as_api_version()}'

		IF NOT EXISTS( SELECT * FROM ${prvcdatbas}.SYS.EXTENDED_PROPERTIES WHERE NAME='VERSION_DATE' )     
			EXEC ${prvcdatbas}.sys.sp_addextendedproperty @name=N'VERSION_DATE', @value='${new as_Date(version_date.getTime()-1000).as_toISOString()}'
    `
    await as_mssql.Assqlexec(query)
    
    query = `
        SET DATEFORMAT DMY
        SELECT CAST(VALUE AS DATETIME) AS VALUE, VALUE as VALUE2 FROM ${prvcdatbas}.SYS.EXTENDED_PROPERTIES WHERE NAME='VERSION_DATE'
        `;
  
    const result = await as_mssql.Assqlexec(query)
    const api_date = result.recordset[0].VALUE;
    

    if (api_date < new as_Date('2025-07-04 12:00:00')) {
        update_date = true;
        query = `

            IF EXISTS (SELECT NAME FROM AS_CAD..SYSOBJECTS WHERE NAME = 'ASENTAPI') AND
               EXISTS (SELECT NAME FROM AS_API..SYSOBJECTS WHERE NAME = 'ASENTAPI')
               BEGIN
                    INSERT INTO AS_API..ASENTAPI 
                        (APTCUIDAPT, APTCUIDENT, APTNID_ENT, APTCCODCPF, APTCSERVER, APTCINSTAN, APTN_PORTA )
                    SELECT  APTCUIDAPT, APTCUIDENT, APTNID_ENT, APTCCODCPF, APTCSERVER, APTCINSTAN, APTN_PORTA 
                    FROM AS_CAD..ASENTAPI WITH (NOLOCK)
                    WHERE APTCCODCPF NOT IN (
                        SELECT APTCCODCPF FROM AS_API..ASENTAPI WITH (NOLOCK) 
                    )
                END


            IF EXISTS (SELECT NAME FROM AS_CAD..SYSOBJECTS WHERE NAME = 'ASARTAPI') AND
               EXISTS (SELECT NAME FROM AS_API..SYSOBJECTS WHERE NAME = 'ASARTAPI')
               BEGIN
                    INSERT INTO AS_API..ASARTAPI 
                        (APICUIDAPI, APICUIDAPT, APINID_USU, APICUSUNOM, APIC_SENHA, APICACCTKN, APICRFSTKN, APINEXPDAT, APIDDATTKN )
                    SELECT APICUIDAPI, APICUIDAPT, APINID_USU, APICUSUNOM, APIC_SENHA, APICACCTKN, APICRFSTKN, APINEXPDAT, APIDDATTKN 
                    FROM AS_CAD..ASARTAPI
                    WHERE APICUIDAPI NOT IN (
                        SELECT APICUIDAPI FROM AS_API..ASARTAPI WITH (NOLOCK)
                    )
                END
        `;

        await as_mssql.Assqlexec(query)
    }

    if (api_date < new as_Date('2025-07-09 09:00:00')) {
        update_date = true;
        await as_api_strut_ASAPIPRO_IMG(); 
    }
    
    if (api_date < new as_Date('2025-07-09 16:00:00')) {
        update_date = true;

        await as_api_strut_ASGOOGLE_KEY(); 

        query = `
            INSERT INTO ${prvcdatbas}..ASGOOGLE_KEY (GOGCCODKEY, GOGCCOD_CX, GOGDDATEXP)
                                            VALUES  ('AIzaSyDaNwHwdQ4wdP526ozFAe15J1y8u_fvyr4','b0ae99ecfc8684afd', NULL),
                                                    ('AIzaSyAAIDcHPzXmy4Ic9XAXLdMPeGlAhfIQrYg','e26c99ca41a7f4f4c', NULL),
                                                    ('AIzaSyBBwhuoI1zmyvLxsRpkc4z0bOXCgJnI7w0','e26c99ca41a7f4f4c', NULL),
                                                    ('AIzaSyBlgTdHxExnWxuCIQ5YjVriFJRKnHWDpeM','e26c99ca41a7f4f4c', NULL),
                                                    ('AIzaSyB6YghstGKC4EUVFFMZuuLKGcEwsUSFqtE','e26c99ca41a7f4f4c', NULL),
                                                    ('AIzaSyA4AaYiQXxvCEwn32cyalZkh6d6AaMWB6M','f09640fb7c62b459c', NULL)
        `
        await as_mssql.Assqlexec(query);
    }

    if (api_date < new as_Date('2025-07-17 12:00:00')) {
        update_date = true;
        await as_api_strut_ASENTAPI()

        const token = as_tokenUtils.as_JwtToken_encrypt({username: 'sa', password: '1s860t77r@'});
        query = `
            UPDATE ${prvcdatbas}..ASENTAPI SET APTC_TOKEN = '${token}' WHERE APTC_TOKEN = 'TOKEN' 
        `
        await as_mssql.Assqlexec(query);
    }

    if (api_date < new as_Date('2025-07-17 13:30:00')) { 
        update_date = true;
        await as_api_strut_ASARTAPI()

        query = `
            SELECT * FROM ${prvcdatbas}..ASARTAPI WITH (NOLOCK) --&&WHERE APTC_TOKEN = 'TOKEN'
        `

        const data = await as_mssql.Assqlexec(query)
        query = ``
        for (const user of data.recordset) {
                const cred = {
                    id: user.APINID_USU,
                    username: user.APICUSUNOM.trim(),
                    password: user.APIC_SENHA.trim()
                }
                const token = as_tokenUtils.as_JwtToken_encrypt(cred);
                
                query = `${query}
                UPDATE ${prvcdatbas}..ASARTAPI SET APIC_TOKEN = '${token}' WHERE APICUIDAPI = '${user.APICUIDAPI}'
                `
        }
        
        await as_mssql.Assqlexec(query)

    }

    if (api_date < new as_Date('2025-07-17 18:00:00')) { 
        // update_date = true;
        query = `
            use ${prvcdatbas}

            IF EXISTS(SELECT NAME FROM SYSCOLUMNS WHERE ID = OBJECT_ID('ASARTAPI') AND NAME = 'APIC_SENHA')
                ALTER TABLE [ASARTAPI] DROP COLUMN APIC_SENHA

        `
        await as_mssql.Assqlexec(query)
    }
    if (update_date) {
        console.log('Updating API version and date...');
        query = `
            EXEC ${prvcdatbas}.sys.sp_updateextendedproperty @name=N'VERSION', @value=N'${as_api_version()}'
            EXEC ${prvcdatbas}.sys.sp_updateextendedproperty @name=N'VERSION_DATE', @value=N'${version_date.as_toISOString()}'
        `;

        await as_mssql.Assqlexec(query)
    }
}

//////////////////////////////////////////////
const as_api_check_strut = async () => {
    console.log('Checking if API Database exists');
    await as_api_strut_database();

    console.log('API Database structure check...');
    const query = `
        USE ${prvcdatbas}

        IF NOT EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'ASENTAPI') OR NOT EXISTS (SELECT NAME FROM SYSOBJECTS WHERE NAME = 'ASARTAPI')
	        SELECT 1 APIN_STRUT
        ELSE
            SELECT 0 APIN_STRUT

    `
    const result = await as_mssql.Assqlexec(query);

    if (result.recordset[0].APIN_STRUT === 1) {
        console.log('Creating structure...');
        console.log('--------------------------');
        await as_api_strut_ASENTAPI();
        console.log('--------------------------');
        await as_api_strut_ASARTAPI();
        console.log('--------------------------');
        await as_api_strut_ASAPIPRO_IMG(); 
        console.log('--------------------------');
        await as_api_strut_ASGOOGLE_KEY(); 
        console.log('--------------------------');
        
    }
    
    console.log('Checking Credential...');
    await as_api_strut_Credential()
    
    console.log('API Database structure is OK.');
    
    console.log('Checking API updates...');
    await as_api_strut_update();
    console.log('API is up to date...');
}

export default {as_api_check_strut};