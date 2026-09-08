import { configure } from 'mobx';
import { AbstractReactorModule, ReactorModuleRegisterEvent } from './AbstractReactorModule';
import { ioc } from '../inversify.config';
import { Log, Logger } from '@journeyapps/common-logger';
import { createLogger, formatLoggerName } from './logging';
import { System } from './System';
import { AbstractStore } from '../stores/AbstractStore';
import { Newable } from '@journeyapps/common-ioc';
import { LoggerStore } from '../stores/logging/LoggerStore';

configure({
  enforceActions: 'never',
  disableErrorBoundaries: false
});

export class ReactorKernel {
  logger: Logger;
  modules: AbstractReactorModule[];

  constructor() {
    this.modules = [];
    this.logger = createLogger('REACTOR_KERNEL');
  }

  registerModule(module: AbstractReactorModule) {
    this.modules.push(module);
  }

  async boot() {
    for (let module of this.modules) {
      this.logger.debug(Log.dim('Registering module'), Log.bold(Log.cyan(module.options.name)));
      try {
        module.register(this.createReactorModuleRegisterEvent(module));
        const loggerStore = ioc.get(LoggerStore);
        loggerStore.registerRootLogger(this.logger);
        loggerStore.registerRootLogger(module.logger);
      } catch (ex) {
        this.logger.error(Log.red('Failed to register module'), Log.bold(module.options.name), ex);
        throw ex;
      }
    }
    await this.init();
  }

  protected async init() {
    await ioc.get(System).initStores();
    for (let m of this.modules) {
      this.logger.debug(Log.dim('Initializing module'), Log.bold(Log.cyan(m.options.name)));
      try {
        await m.init({ ioc });
      } catch (ex) {
        this.logger.error(Log.red('Failed to initialize module'), Log.bold(m.options.name), ex);
      }
    }
  }

  protected createReactorModuleRegisterEvent(module: AbstractReactorModule): ReactorModuleRegisterEvent {
    return {
      ioc,
      registerStore: <T extends AbstractStore>(symbol: Newable<T>, store: T) => {
        const loggerName = formatLoggerName(store.name);
        module.logger.debug(Log.dim('Registering store'), Log.bold(Log.cyan(loggerName)));
        store.setLogger(module.logger.childLogger(loggerName));
        ioc.get(System).addStore(symbol, store);
        return store;
      }
    };
  }
}
