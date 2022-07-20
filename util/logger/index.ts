
declare module 'webserver-v4-logger' {

    class Logger {

        constructor(dirpath: string)

        logError(err: Error): void
        logInfo(message: string): void
        logDebug(message: string): void
        logWarn(message: string): void
        log(message: string): void

    }
}
