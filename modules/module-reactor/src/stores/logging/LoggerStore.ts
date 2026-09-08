import { observable } from 'mobx';
import { LogLevel, Logger } from '@journeyapps/common-logger';
import { AbstractStore } from '../AbstractStore';
import { REACTOR_DEFAULT_LOG_LEVEL } from '../../core/logging';

const STORAGE_KEY = 'reactor.logger-levels';
const GLOBAL_LEVEL_STORAGE_KEY = 'reactor.logger-global-level';

export interface LoggerEntry {
  name: string;
  label: string;
  parent?: string;
  depth: number;
  level: LogLevel;
  configuredLevel?: LogLevel;
  children: number;
}

export interface LoggerTreeEntry extends LoggerEntry {
  loggers: LoggerTreeEntry[];
}

export class LoggerStore extends AbstractStore {
  private readonly rootLoggers = new Map<string, Logger>();
  private readonly subscriptions = new Map<Logger, () => void>();
  private readonly configuredLevels = new Map<string, LogLevel>();
  private globalLevel: LogLevel;

  @observable
  accessor revision = 0;

  constructor() {
    super({ name: 'LOGGER_STORE' });
    this.globalLevel = this.loadGlobalLevel();
    this.loadConfiguredLevels();
  }

  registerRootLogger(logger: Logger) {
    const existing = this.rootLoggers.get(logger.name);
    if (existing && existing !== logger) {
      throw new Error(`A logger named '${logger.name}' is already registered`);
    }
    if (existing) {
      return logger;
    }

    this.rootLoggers.set(logger.name, logger);
    if (!this.configuredLevels.has(logger.name)) {
      logger.setLevel(this.globalLevel);
    }
    this.synchronizeLoggers();
    this.configurationChanged();
    return logger;
  }

  getEntries(): LoggerEntry[] {
    void this.revision;
    return this.getAllLoggers().map(({ logger, parent, depth }) => this.createEntry(logger, parent, depth));
  }

  getTree(): LoggerTreeEntry[] {
    void this.revision;
    const generate = (logger: Logger, parent?: Logger, depth = 0): LoggerTreeEntry => ({
      ...this.createEntry(logger, parent, depth),
      loggers: logger.children.map((child) => generate(child, logger, depth + 1))
    });
    return Array.from(this.rootLoggers.values()).map((logger) => generate(logger));
  }

  setLevel(name: string, level: LogLevel | string) {
    const logger = this.resolveLogger(name);
    const resolvedLevel = this.resolveLevel(level);
    this.configuredLevels.set(logger.name, resolvedLevel);
    logger.setLevel(resolvedLevel);
    this.persistConfiguredLevels();
    this.configurationChanged();
    return this.getEntry(logger);
  }

  enable(name: string, level: LogLevel | string = LogLevel.DEBUG) {
    return this.setLevel(name, level);
  }

  disable(name: string) {
    return this.setLevel(name, LogLevel.OFF);
  }

  isolate(name: string) {
    const logger = this.resolveLogger(name);
    const level = logger.level === LogLevel.OFF ? this.globalLevel : logger.level;
    const subtree = new Set(this.flattenLogger(logger));

    this.getAllLoggers().forEach(({ logger: current }) => {
      if (subtree.has(current)) {
        this.configuredLevels.delete(current.name);
        if (current === logger) {
          current.setLevel(level);
        } else {
          current.clearLevel();
        }
        return;
      }
      this.configuredLevels.set(current.name, LogLevel.OFF);
      current.setLevel(LogLevel.OFF);
    });

    // Preserve an inherited level before its parent is turned off. If a prior
    // isolation turned this logger off, restore the global baseline instead.
    this.configuredLevels.set(logger.name, level);
    this.persistConfiguredLevels();
    this.configurationChanged();
    return this.getEntry(logger);
  }

  setGlobalLevel(level: LogLevel | string) {
    const resolvedLevel = this.resolveLevel(level);
    this.globalLevel = resolvedLevel;
    this.getAllLoggers().forEach(({ logger }) => {
      this.configuredLevels.delete(logger.name);
      logger.clearLevel();
    });
    this.rootLoggers.forEach((logger) => {
      logger.setLevel(resolvedLevel);
    });
    window.localStorage.setItem(GLOBAL_LEVEL_STORAGE_KEY, resolvedLevel);
    this.persistConfiguredLevels();
    this.configurationChanged();
    return this.getEntries();
  }

  inherit(name: string) {
    const logger = this.resolveLogger(name);
    this.configuredLevels.delete(logger.name);
    const isRoot = this.rootLoggers.get(logger.name) === logger;
    if (isRoot) {
      logger.setLevel(this.globalLevel);
    } else {
      logger.clearLevel();
    }
    this.persistConfiguredLevels();
    this.configurationChanged();
    return this.getEntry(logger);
  }

  reset(name?: string) {
    const roots = name ? [this.resolveLogger(name)] : Array.from(this.rootLoggers.values());
    const loggers = roots.flatMap((root) => this.flattenLogger(root));
    loggers.forEach((logger) => {
      this.configuredLevels.delete(logger.name);
      if (this.rootLoggers.get(logger.name) === logger) {
        logger.setLevel(this.globalLevel);
      } else {
        logger.clearLevel();
      }
    });
    this.persistConfiguredLevels();
    this.configurationChanged();
    return loggers.map((logger) => this.getEntry(logger));
  }

  private getAllLoggers() {
    const entries: { logger: Logger; parent?: Logger; depth: number }[] = [];
    const visit = (logger: Logger, parent?: Logger, depth = 0) => {
      entries.push({ logger, parent, depth });
      logger.children.forEach((child) => visit(child, logger, depth + 1));
    };
    this.rootLoggers.forEach((logger) => visit(logger));
    return entries;
  }

  private flattenLogger(logger: Logger): Logger[] {
    return [logger, ...logger.children.flatMap((child) => this.flattenLogger(child))];
  }

  private createEntry(logger: Logger, parent?: Logger, depth = 0): LoggerEntry {
    return {
      name: logger.name,
      label: logger.name.substring(logger.name.lastIndexOf(':') + 1),
      parent: parent?.name,
      depth,
      level: logger.level,
      configuredLevel: this.configuredLevels.get(logger.name),
      children: logger.children.length
    };
  }

  private getEntry(logger: Logger) {
    const record = this.getAllLoggers().find((entry) => entry.logger === logger);
    return this.createEntry(logger, record?.parent, record?.depth);
  }

  private resolveLogger(name: string) {
    const loggers = this.getAllLoggers().map((entry) => entry.logger);
    const exact = loggers.find((logger) => logger.name === name);
    if (exact) {
      return exact;
    }

    const normalized = name.toLowerCase();
    const matches = loggers.filter(
      (logger) => logger.name.toLowerCase() === normalized || logger.name.toLowerCase().endsWith(`:${normalized}`)
    );
    if (matches.length === 1) {
      return matches[0];
    }
    if (matches.length > 1) {
      throw new Error(`Logger '${name}' is ambiguous: ${matches.map((logger) => logger.name).join(', ')}`);
    }
    throw new Error(`Logger '${name}' was not found`);
  }

  private resolveLevel(level: LogLevel | string) {
    const resolved = String(level).toUpperCase() as LogLevel;
    if (!Object.values(LogLevel).includes(resolved)) {
      throw new Error(`Unknown log level '${level}'. Expected one of: ${Object.values(LogLevel).join(', ')}`);
    }
    return resolved;
  }

  private synchronizeLoggers() {
    const loggers = new Set(this.getAllLoggers().map((entry) => entry.logger));
    this.subscriptions.forEach((dispose, logger) => {
      if (!loggers.has(logger)) {
        dispose();
        this.subscriptions.delete(logger);
      }
    });
    loggers.forEach((logger) => {
      if (this.subscriptions.has(logger)) {
        return;
      }
      const configuredLevel = this.configuredLevels.get(logger.name);
      if (configuredLevel) {
        logger.setLevel(configuredLevel);
      }
      this.subscriptions.set(
        logger,
        logger.registerConfigurationListener(() => {
          this.synchronizeLoggers();
          this.configurationChanged();
        })
      );
    });
  }

  private configurationChanged() {
    this.revision += 1;
  }

  private loadConfiguredLevels() {
    try {
      const configured = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
      Object.entries(configured).forEach(([name, level]) => {
        this.configuredLevels.set(name, this.resolveLevel(level as string));
      });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }

  private loadGlobalLevel() {
    try {
      const level = window.localStorage.getItem(GLOBAL_LEVEL_STORAGE_KEY);
      return level ? this.resolveLevel(level) : REACTOR_DEFAULT_LOG_LEVEL;
    } catch {
      window.localStorage.removeItem(GLOBAL_LEVEL_STORAGE_KEY);
      return REACTOR_DEFAULT_LOG_LEVEL;
    }
  }

  private persistConfiguredLevels() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(this.configuredLevels)));
  }
}
