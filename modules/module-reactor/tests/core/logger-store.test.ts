import { LogLevel, Logger } from '@journeyapps/common-logger';
import { beforeEach, describe, expect, it } from 'vitest';
import { Action, ActionEvent } from '../../src/actions/Action';
import { LoggerStore } from '../../src/stores/logging/LoggerStore';
import { ActionStore } from '../../src/stores/actions/ActionStore';
import { resolveReactorLogLevel } from '../../src/core/logging';

class TestAction extends Action {
  constructor() {
    super({ id: 'TEST_ACTION', name: 'Test action', icon: 'bolt' });
  }

  protected async fireEvent(_event: ActionEvent) {}
}

describe('LoggerStore', () => {
  let values: Map<string, string>;

  beforeEach(() => {
    values = new Map();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        getItem: (key: string) => values.get(key) ?? null,
        setItem: (key: string, value: string) => values.set(key, value),
        removeItem: (key: string) => values.delete(key)
      }
    });
  });

  it('resolves the environment log level with an info fallback', () => {
    expect(resolveReactorLogLevel('debug')).toBe(LogLevel.DEBUG);
    expect(resolveReactorLogLevel('invalid')).toBe(LogLevel.INFO);
  });

  it('configures, persists and resets a logger hierarchy', () => {
    const store = new LoggerStore();
    const reactor = new Logger({ name: 'Reactor' });
    const actions = reactor.childLogger('Actions');
    const editor = new Logger({ name: 'Editor' });
    store.registerRootLogger(reactor);
    store.registerRootLogger(editor);

    store.setLevel(actions.name, LogLevel.DEBUG);
    expect(actions.level).toBe(LogLevel.DEBUG);
    store.inherit(actions.name);
    expect(actions.level).toBe(LogLevel.INFO);

    store.setGlobalLevel(LogLevel.INFO);
    expect(store.getEntries().map(({ level }) => level)).toEqual([LogLevel.INFO, LogLevel.INFO, LogLevel.INFO]);
    expect(JSON.parse(values.get('reactor.logger-levels'))).toEqual({});

    store.reset();
    expect(store.getEntries().every(({ level, configuredLevel }) => level === LogLevel.INFO && !configuredLevel)).toBe(
      true
    );

    store.setLevel(actions.name, LogLevel.DEBUG);
    store.isolate(actions.name);
    expect(reactor.level).toBe(LogLevel.OFF);
    expect(actions.level).toBe(LogLevel.DEBUG);
    expect(editor.level).toBe(LogLevel.OFF);

    store.isolate(editor.name);
    expect(reactor.level).toBe(LogLevel.OFF);
    expect(actions.level).toBe(LogLevel.OFF);
    expect(editor.level).toBe(LogLevel.INFO);

    store.reset();
    expect(store.getEntries().every(({ level, configuredLevel }) => level === LogLevel.INFO && !configuredLevel)).toBe(
      true
    );
  });

  it('discovers loggers created after a root is registered', () => {
    const store = new LoggerStore();
    const moduleLogger = new Logger({ name: 'Reactor' });
    const actionStore = new ActionStore({ comboBoxStore2: null! });
    actionStore.setLogger(moduleLogger.childLogger('Actions'));
    store.registerRootLogger(moduleLogger);

    actionStore.registerAction(new TestAction());

    expect(store.getEntries().map(({ name }) => name)).toContain('Reactor:Actions:Test action');
  });
});
