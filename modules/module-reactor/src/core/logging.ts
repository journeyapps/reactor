import { LogLevel, Logger } from '@journeyapps/common-logger';
import { ENV } from '../env';

export const resolveReactorLogLevel = (level = ENV.REACTOR_LOG_LEVEL): LogLevel => {
  const normalized = level?.toUpperCase() as LogLevel | undefined;
  return normalized && Object.values(LogLevel).includes(normalized) ? normalized : LogLevel.INFO;
};

export const REACTOR_DEFAULT_LOG_LEVEL = resolveReactorLogLevel();

const LOGGER_WORDS: Record<string, string> = {
  CMD: 'Command',
  DND: 'Drag and drop',
  UX: 'UX'
};

const LOGGER_NAMES: Record<string, string> = {
  ACTION_STORE: 'Actions',
  CMD_PALLET_STORE: 'Command palette',
  COMBO_BOX_STORE: 'Combobox',
  COMBO_BOX_STORE_2: 'Combobox v2',
  DIALOG_STORE: 'Dialogs',
  DIALOG_STORE_2: 'Dialogs v2',
  LOGGER_STORE: 'Logging',
  THEME_STORE: 'Themes'
};

export const formatLoggerName = (name: string) => {
  if (LOGGER_NAMES[name]) {
    return LOGGER_NAMES[name];
  }
  if (!/^[A-Z0-9_]+$/.test(name)) {
    return name;
  }

  const words = name.split('_').filter((word) => word !== 'STORE');
  return words
    .map(
      (word, index) => LOGGER_WORDS[word] ?? (index === 0 ? word[0] + word.slice(1).toLowerCase() : word.toLowerCase())
    )
    .join(' ');
};

export const createLogger = (name: string) => {
  return new Logger({
    name: formatLoggerName(name),
    level: REACTOR_DEFAULT_LOG_LEVEL
  });
};
