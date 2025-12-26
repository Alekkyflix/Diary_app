import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFilePath = path.join(__dirname, 'error.log');

export const logError = (error, context = '') => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${context}\n${error.stack || error}\n${'-'.repeat(50)}\n`;
    
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) console.error('Failed to write to log file:', err);
    });
};

export default logError;
