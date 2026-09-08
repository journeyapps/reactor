import { ioc } from '../inversify.config';
import { observable } from 'mobx';
import { EntityDefinition } from '../entities/EntityDefinition';
import { EncodedEntity } from '../entities/components/encoder/EntityEncoderComponent';
import { AbstractStore } from '../stores/AbstractStore';
import { Newable } from '@journeyapps/common-ioc';
import { ActionStore } from '../stores/actions/ActionStore';
import { ComboBoxStore2 } from '../stores/combo2/ComboBoxStore2';
import { Action } from '../actions/Action';
import { BaseObserver } from '@journeyapps/common-utils';
import { Logger } from '@journeyapps/common-logger';
import { createLogger } from './logging';

export interface SystemOptions {
  actionStore?: ActionStore;
  comboBoxStore2?: ComboBoxStore2;
  logger?: Logger;
}

export interface SystemListener {
  definitionRegistered?: (definition: EntityDefinition) => any;
  storeRegistered?: (store: AbstractStore) => any;
}

export class System extends BaseObserver<SystemListener> {
  @observable
  accessor ideName: string;

  // providers
  definitions: Map<string, EntityDefinition>;
  stores: Set<AbstractStore>;
  readonly logger: Logger;

  constructor(protected options: SystemOptions = {}) {
    super();
    this.logger = options.logger ?? createLogger('SYSTEM');
    this.stores = new Set();
    this.definitions = new Map();
    this.ideName = 'Reactor';
  }

  //!--------------- STORES -----------------------

  addStore<T extends AbstractStore>(symbol: Newable<T>, store: T) {
    this.stores.add(store);
    ioc.bind(symbol).toConstantValue(store);
    this.iterateListeners((l) => {
      l.storeRegistered?.(store);
    });
  }

  unbindStore<T extends AbstractStore>(symbol: Newable<T>) {
    this.stores.delete(ioc.get(symbol));
    ioc.unbind(symbol);
  }

  getStores(): AbstractStore[] {
    return Array.from(this.stores.values());
  }

  async initStores() {
    await Promise.all(this.getStores().map((store) => store.init()));
  }

  //!--------------- ENTITIES ---------------------

  getEntityDefinitions() {
    return Array.from(this.definitions.values());
  }

  registerDefinition(definition: EntityDefinition) {
    definition.setSystem(this);
    this.definitions.set(definition.type, definition);
    this.iterateListeners((l) => {
      l.definitionRegistered?.(definition);
    });
  }

  getDefinition<T>(type: string): EntityDefinition<T> | null {
    return this.definitions.get(type);
  }

  getDefinitionForEntity<T>(entity: any): EntityDefinition<T> | null {
    if (entity == null) {
      return null;
    }
    return this.getEntityDefinitions().find((d) => d.matchEntity(entity)) || null;
  }

  decodeEntity<T>(entity: EncodedEntity): Promise<T> {
    const definition = this.getDefinition<T>(entity.type);
    if (!definition) {
      return null;
    }
    return definition.decode(entity);
  }

  encodeEntity(entity: any, throws = true) {
    const definition = this.getDefinitionForEntity(entity);
    if (!definition) {
      return null;
    }
    return definition.encode(entity, throws);
  }

  /**
   * @deprecated use actionStore directly
   * @param action
   */
  registerAction(action: Action) {
    this.options.actionStore.registerAction(action);
  }
}
