import fs from 'fs';
import path from 'path';
import os from 'os';
import { as_Date, as_IsDev } from '@root/utils';

const as_LogToFile = (error: any, file: string) => {
    const now = new as_Date();
    const day = String(now.getDate()).padStart(2, '0');
    const filename = `${file}_${day}.log`;
        
    const logsDir = as_IsDev() ? path.join(__dirname, '../../logs') : './logs';
    const logFilePath = path.join(logsDir, filename);

    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    if (fs.existsSync(logFilePath)) {
        const stats = fs.statSync(logFilePath);
        const fileModifiedDate = new Date(stats.mtime);

        const fileMonth = fileModifiedDate.getMonth();
        const fileYear = fileModifiedDate.getFullYear();

        if (fileMonth !== now.getMonth() || fileYear !== now.getFullYear()) {
            fs.unlinkSync(logFilePath);
        }
    }

    // const logMessage = `[${now.toISOString()}] ${JSON.stringify(error)}\n`;
    const logMessage = `[${now.toISOString()}] ${
                                                JSON.stringify(error, null, 2)
                                                .replace(/\\n/g, '\n')
                                                .replace(/\\t/g, '\t')
                                                .replace(/\n/g, os.EOL)}\n\n`;
    console.log(logMessage);

    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error('Failed to write error to log file:', err);
    });
};

export { as_LogToFile };    
