import pino, { Logger } from 'pino';


export function getLogger(): Logger {
    return pino({
        enabled: process.env.NODE_ENV === "prod" || process.env.NODE_ENV === "dev" ||
            process.env.LOGGING === "true",
        level: process.env.LOG_LEVEL || "info",
        prettyPrint: {
            translateTime: "yyyy-mm-dd HH:MM:ss",
        }
    });
}
