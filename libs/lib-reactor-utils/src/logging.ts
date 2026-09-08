import { Logger } from '@journeyapps/common-logger';

const logger = new Logger({ name: 'Reactor utils' });

export const getUtilsLogger = (name: string) => logger.childLogger(name);
