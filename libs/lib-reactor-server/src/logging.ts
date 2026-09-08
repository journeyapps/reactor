import { LogLevel, Logger, NodeConsoleLoggerTransport } from '@journeyapps/common-logger';

export const reactorServerLogger = new Logger({
  name: 'Reactor server',
  level: LogLevel.INFO,
  transport: new NodeConsoleLoggerTransport()
});
