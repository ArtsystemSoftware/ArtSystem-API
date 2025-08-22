import app from './app';
import * as dotenv from 'dotenv';
import { as_api_version, as_Date } from '@root/utils';
import { as_api_strut } from '@root/models';
// import { as_googleGeoLocation } from '@root/integrations';

// (async () => {
//     const address1 =  {
//      logradouro: 'Rua José Mariano Serrano',
//      numero: 5,
//      localidade: 'São Paulo',
//      cep: '03819140',
//    }
//   const address2 = {
//      logradouro: 'Av. Dr. Getúlio Vargas',
//      numero: 582,
//      localidade: 'Mauá',
//      cep: '09310180',
//    }

//     const routes = await as_googleGeoLocation(address1, address2)
//     console.log(routes)
// })();

// (async () => {
//     try {
//         const route = await as_getDistanceBetweenAddresses("03819120", "Rua Doutor Getúlio Vargas");
//         console.log(route);
//     } catch (err) {
//         console.error(err);
//     }
// })();

dotenv.config({ path: 'src/.env' });
const port = process.env.API_PORT;

// const cred = as_tokenUtils.as_JwtToken_encrypt({username: 'username', password: 'userPassword'});
// console.log(cred)
// console.log(as_tokenUtils.as_JwtToken_decrypt(cred));


process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.env.API_VERSION = 'AS_API 2025h19';
// process.env.TZ = "America/Sao_Paulo";

console.log(`API version: ${as_api_version()}`);
console.log(`Environment: ${process.env.NODE_ENV}`);

as_api_strut.as_api_check_strut().catch((error: Error) => {
    console.error('Error checking API structure:', error);
}
).then(() => {

    const server = app.listen(port, () => {
        console.log(new as_Date().toISOString(),`- API is running at http://localhost:${port}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
        if (error.syscall !== 'listen') {
            throw error;
        }

        const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

        // Handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error(`${bind} requires elevated privileges`);
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error(`${bind} is already in use`);
                process.exit(1);
                break;
            default:
                throw error;
        }
    });

    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });

    process.on('SIGINT', () => {
        console.log('SIGINT signal received: closing HTTP server');
        server.close(() => {
            console.log('HTTP server closed');
        });
    });

});

