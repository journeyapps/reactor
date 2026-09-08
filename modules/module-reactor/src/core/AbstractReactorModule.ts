import { Container, Newable } from '@journeyapps/common-ioc';
import { Logger } from '@journeyapps/common-logger';
import { AbstractStore } from '../stores/AbstractStore';
import { createLogger } from './logging';

export interface AbstractReactorModuleOptions {
  name: string;
}

export interface ReactorModuleRegisterEvent {
  ioc: Container;
  registerStore: <T extends AbstractStore>(symbol: Newable<T>, store: T) => T;
}

export interface ReactorModuleInitEvent {
  ioc: Container;
}

export abstract class AbstractReactorModule {
  options: AbstractReactorModuleOptions;
  readonly logger: Logger;

  constructor(options: AbstractReactorModuleOptions) {
    this.options = options;
    this.logger = createLogger(options.name);
  }

  abstract register(event: ReactorModuleRegisterEvent);

  abstract init(event: ReactorModuleInitEvent): Promise<any>;
}
