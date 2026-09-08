import * as _ from 'lodash';
import { observable } from 'mobx';
import { Action, ActionEvent, ActionListener } from '../../actions/Action';
import { EntityAction } from '../../actions/parameterized/EntityAction';
import { ParameterizedAction } from '../../actions/parameterized/ParameterizedAction';
import { ProviderActionParameter } from '../../actions/parameterized/params/ProviderActionParameter';
import { ComboBoxStore2 } from '../combo2/ComboBoxStore2';
import { MousePosition } from '../../layers/combo/SmartPositionWidget';
import { ActionSource } from '../../actions/ActionSource';
import { AbstractStore, AbstractStoreListener } from '../AbstractStore';
import { Log } from '@journeyapps/common-logger';

export interface BaseActionSelectionParameters {
  event?: MousePosition;
  source: ActionSource;
  exclude?: string[];
  additional?: ParameterizedAction[];
}

export interface ActionStoreOptions {
  comboBoxStore2: ComboBoxStore2;
}

export interface ActionStoreListener extends AbstractStoreListener {
  actionFired?: (event: { action: Action; event: Partial<ActionEvent> }) => void;
  actionWillFire?: (event: { action: Action; event: Partial<ActionEvent> }) => Promise<any>;
}

export class ActionStore extends AbstractStore<ActionStoreListener> {
  @observable
  accessor actions: { [name: string]: Action };

  private actionListeners: Map<string, () => any>;

  constructor(_options: ActionStoreOptions) {
    super({ name: 'ACTION_STORE' });
    this.actions = {};
    this.actionListeners = new Map();
  }

  getActions() {
    return _.values(this.actions);
  }

  unregisterAction(action: Action) {
    this.logger.debug(Log.dim('Unregistering action'), Log.bold(Log.cyan(action.options.id)));
    this.actionListeners.get(action.options.id)?.();
    this.actionListeners.delete(action.options.id);
    delete this.actions[action.options.name];
  }

  registerAction(action: Action) {
    this.logger.debug(Log.dim('Registering action'), Log.bold(Log.cyan(action.options.id)));
    action.setActionStore(this);
    if (this.actions[action.options.name]) {
      throw new Error(`An action with name ${action.options.name} already exists`);
    }
    this.actions[action.options.name] = action;

    let common: Partial<ActionListener> = {
      didFire: (event) => {
        this.iterateListeners((cb) => {
          cb.actionFired?.({
            action,
            event: event.payload
          });
        });
      },
      willFire: async (event) => {
        return this.iterateAsyncListeners((cb) => {
          return cb.actionWillFire?.({
            action,
            event: event.payload
          });
        });
      }
    };
    let listener;
    if (action instanceof ParameterizedAction) {
      listener = action.registerListener({
        didFire: common.didFire,
        willCollectParams: common.willFire
      });
    } else {
      listener = action.registerListener(common);
    }
    this.actionListeners.set(action.options.id, listener);
  }

  getActionByID<T extends Action>(id: string): T {
    return (_.find(this.actions, (a) => a.options.id === id) || this.actions[id]) as T;
  }

  getAction<T extends Action>(name: string): T {
    return this.actions[name] as T;
  }

  getActionsForEntityDecoded<T>(options: { entity: T; type: string }): EntityAction<T>[] {
    return _.filter(this.actions, (action) => {
      if (action instanceof EntityAction) {
        return action.options.target === options.type;
      }
      if (action instanceof ParameterizedAction) {
        for (let param of action.options.params) {
          if (param instanceof ProviderActionParameter && param.options.type === options.type) {
            if (param.options.filter) {
              return !!param.options.filter(options.entity);
            }
            return true;
          }
        }
      }
    }) as EntityAction<T>[];
  }
}
