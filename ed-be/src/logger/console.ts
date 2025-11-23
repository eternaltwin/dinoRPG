/* eslint-disable no-console */
import { formatLogRecord, LogHandler, LogLevel, LogRecord } from './index.js';

/**
 * Write logs to JS console.
 */
export const CONSOLE: LogHandler = {
	emit(record: Readonly<LogRecord>): void {
		const formatted = formatLogRecord(record, false);
		switch (record.level) {
			case LogLevel.Debug: {
				console.debug(formatted, record.data);
				break;
			}
			case LogLevel.Log: {
				console.log(formatted, record.data);
				break;
			}
			case LogLevel.Info: {
				console.info(formatted, record.data);
				break;
			}
			case LogLevel.Warn: {
				console.warn(formatted, record.data);
				break;
			}
			case LogLevel.Error:
			default: {
				console.error(formatted, record.data);
				break;
			}
		}
	},
	flush(): Promise<void> {
		// Nothing to do
		return Promise.resolve();
	},
	close(): Promise<void> {
		// Nothing to do
		return Promise.resolve();
	}
};
