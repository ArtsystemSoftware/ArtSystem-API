import * as sql from 'mssql';
import * as dotenv from 'dotenv';
import { as_IsDev, as_tokenUtils } from '@root/utils';

dotenv.config({ path: '.env' });
const TIME_OUT = 30000; // 30 seconds
const UTC_TIME = true; // Set to true if you want to use UTC time

interface AS_MSSQLError {
    config: SQLConfig;
    error: sql.MSSQLError;
    SQLstr: string;
}
interface User {
    username: string;
    password: string;
    cpf_cnpj: string;
}

interface SQLConfig {
    server: string;
    user: string;
    password: string;
    port: number;
    requestTimeout: number;
    cancelTimeout: number;
    options: {
        useUTC: boolean;   
        instancename: string;
        encrypt: boolean;
        trustServerCertificate: boolean;
    };
}

class as_Connection {
    private readonly baseConfig: SQLConfig;

    constructor() {
        this.baseConfig = {
            server: process.env.server!,
            user: process.env.user!,
            password: process.env.password!,
            port: parseInt(process.env.port!),
            requestTimeout: TIME_OUT,
            cancelTimeout: TIME_OUT,
            options: {
                useUTC: UTC_TIME, 
                instancename: process.env.instancename!,
                encrypt: false,
                trustServerCertificate: true,
            },
        };
    }

    private async as_ConfigByUser(user: User): Promise<SQLConfig | null> {
        const query = `
            SELECT * FROM AS_API..ASENTAPI WITH (NOLOCK) WHERE cast(APTCCODCPF as bigint) = cast(@cpf_cnpj as bigint)
        `;
        
        let pool: sql.ConnectionPool | null = null;
        
        try {
            pool = new sql.ConnectionPool(this.baseConfig);
            await pool.connect();
            const result = await pool.request()
                .input('cpf_cnpj', sql.BigInt, user.cpf_cnpj)
                .query(query);

            if (result.recordset.length === 0) {
                throw new Error('No server configuration found for the given CPF/CNPJ.');
            }

            const [record] = result.recordset;

            const userSpecificConfig: SQLConfig = {
                ...this.baseConfig,
                user: user.username,
                password: user.password,
                server: record.APTCSERVER,
                port: record.APTN_PORTA,
                options: {
                    ...this.baseConfig.options,
                    instancename: record.APTCINSTAN,
                },
            };

            return userSpecificConfig;
        } catch (error) {
            throw error
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    }

    private async as_ConfigByToken(token: string): Promise<SQLConfig | null> {
        const query = ` SELECT * FROM AS_API..ASARTAPI API WITH (NOLOCK) 
                            LEFT JOIN AS_API..ASENTAPI APT WITH (NOLOCK) ON APT.APTCUIDAPT = API.APICUIDAPT
                            
                        WHERE APICACCTKN = @token
            
        `;
        
        let pool: sql.ConnectionPool | null = null;
        
        try {
            // console.log(process.env) 
            pool = new sql.ConnectionPool(this.baseConfig);
            await pool.connect();
            const result = await pool.request()
                .input('token', token)
                .query(query);

            if (result.recordset.length === 0) {
                throw new Error('No server configuration found for the given token.');
            }

            const [record] = result.recordset;
            
            const user = as_tokenUtils.as_JwtToken_decrypt(record.APIC_TOKEN)
            const userSpecificConfig: SQLConfig = {
                ...this.baseConfig,
                user: user.username,
                password: user.password,
                server: record.APTCSERVER.trim(),
                port: record.APTN_PORTA,
                requestTimeout: TIME_OUT,
                cancelTimeout: TIME_OUT,
                options: {
                    ...this.baseConfig.options,
                    instancename: record.APTCINSTAN,
                },
            };

            return userSpecificConfig;
        } catch (error) {
            throw error
        } finally {
            if (pool) {
                await pool.close();
            }
        }
    }

    async Assqlexec_server (SQLstr: string, params: { [key: string]: any } ) {
                
                const server = as_IsDev() ? 'assoftware.dyndns.org' : '192.168.15.240';

                const SQLConfig: SQLConfig = {
                    server: server,
                    user: 'sa',
                    password: '1s860t77r@',
                    port: 53655,
                    requestTimeout: TIME_OUT,
                    cancelTimeout: TIME_OUT,
                    options: {
                        useUTC: UTC_TIME ,
                        instancename: 'SQLARTSYSTEM',
                        encrypt: false,
                        trustServerCertificate: true,
                    },
                };
            
                const retult = await this.Assqlexec(SQLstr,{params , SQLConfig})
               
                return retult;
    }

    public Assqlexec = async ( SQLstr: string,
                                query?:  {
                                        token?: string ,
                                        params?: { [key: string]: any },
                                        user?: User | null ,
                                        SQLConfig?: SQLConfig | null  
                                        },
                                 
                                ): Promise<sql.IResult<any>> => {

        const {token, params, user, SQLConfig} = query || {}

        
        let config: SQLConfig | null = this.baseConfig
        if (token) {
            config = await this.as_ConfigByToken(token).catch((error) => {throw this.As_SqlError({error, SQLstr: 'Unable to retrive SQL Command', config: this.baseConfig})}) 
        } else if (SQLConfig) {
            config = SQLConfig;
        } 
         else if (user) {
            
            config = await this.as_ConfigByUser(user).catch((error) => {throw this.As_SqlError({error, SQLstr: 'Unable to retrive SQL Command', config: this.baseConfig})}) 
                
        }

        if (!config) throw new Error('Failed to retrieve SQL configuration for the user.');
 
        // 12-07-2024 
        // const pool: sql.ConnectionPool | null  = await sql.connect(config).catch((error) => {throw this.As_SqlError({error, SQLstr, config})});
        // const request = pool.request();
        const pool = new sql.ConnectionPool(config);
        await pool.connect().catch((error) => {throw this.As_SqlError({error, SQLstr, config})});
        const request = pool.request();
        // 12-07-2024

        for (const key in params) {
        if (params.hasOwnProperty(key)) {
        request.input(key, params[key]);
        }
        }

        const result = await request.query(SQLstr)
                                    .catch((error) => {throw this.As_SqlError({error, SQLstr, config})})
                                    .finally(() => pool.close().catch((error) => {throw this.As_SqlError({error, SQLstr, config})} ));

        // if (pool) {
        //     await pool.close().catch((error) => {throw error});
        // }

        return result;

    }

    private As_SqlError({error, SQLstr, config} :AS_MSSQLError) {
        
        const as_error = { 
            server: config.server,
            instancename: config.options.instancename,
            port: config.port,
            user: config.user,
            message: error.originalError?.message || error.message,
            SQLstr, 
        };

        return as_error;
    }
}

export default new as_Connection();
