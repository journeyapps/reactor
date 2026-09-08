import { MousePosition } from '../layers/combo/SmartPositionWidget';
import { ReactorIcon } from '../widgets/icons/IconWidget';
import { VisorStore } from '../stores/visor/VisorStore';
import { inject } from '../inversify.config';
import { LoadingDirectiveState, VisorLoadingDirective } from '../stores/visor/VisorLoadingDirective';
import { DialogStore } from '../stores/DialogStore';
import { ActionValidator, ActionValidationState, ValidationResult, Validator } from './validators/ActionValidator';
import { Btn } from '../definitions/common';
import * as React from 'react';
import { ShortcutChord } from '../stores/shortcuts/Shortcut';
import { ComboBoxItem } from '../stores/combo/ComboBoxDirectives';
import * as _ from 'lodash';
import { ActionButtonControl, EventType } from '../controls/ActionButtonControl';
import { ActionMetaWidget } from './ActionMetaWidget';
import { BaseObserver } from '@journeyapps/common-utils';
import { Logger } from '@journeyapps/common-logger';
import { createLogger, formatLoggerName } from '../core/logging';
import { ActionStore } from '../stores/actions/ActionStore';
import { ActionSource } from './ActionSource';

// @deprecated
export { ActionSource } from './ActionSource';

export interface SerializedAction {
  _action: string;
}

export enum ActionMacroBehavior {
  /**
   * Will remove
   */
  DELETE = 'delete',
  /**
   * Will change
   */
  DESTRUCTIVE = 'destructive',

  /*
    Will clone
   */
  COPY = 'copy'
}

const ACTION_BEHAVIOR_TAGS: Record<ActionMacroBehavior, string[]> = {
  [ActionMacroBehavior.DELETE]: ['delete', 'remove', 'destroy'],
  [ActionMacroBehavior.DESTRUCTIVE]: ['destructive', 'destroy'],
  [ActionMacroBehavior.COPY]: ['copy', 'clone', 'duplicate']
};

export enum ActionRollbackMechanic {
  /**
   * There is no way to rollback
   */
  NONE = 'none',
  /*
    Rollback happens via SCM
   */
  SCM = 'scm'
}

export interface ActionOptions {
  id: string;
  name: string;
  /** Complete alternative names used to discover this action. */
  aliases?: string[];
  /** Searchable terms describing this action. The action behavior is included automatically. */
  tags?: string[];
  category?: {
    entityType?: string;
    grouping?: string;
  };
  icon: ReactorIcon;
  hotkeys?: ShortcutChord[];
  validators?: ActionValidator[];
  hideFromCmdPallet?: boolean;
  exemptFromExclusiveExecutionLock?: boolean;
  behavior?: ActionMacroBehavior;
  rollbackMechanic?: ActionRollbackMechanic;
}

export interface ActionComboBoxItem<T extends Action = Action> extends ComboBoxItem {
  actionObject: T;
}

export interface ActionEvent {
  id: string;
  source: ActionSource;
  position?: MousePosition;
  getStatus?: () => VisorLoadingDirective;
  canceled?: boolean;
  fireBehaviorChecks?: boolean;
}

export interface ActionListener<E extends ActionEvent = ActionEvent> {
  willFire: (event: { payload: Partial<E> }) => Promise<void>;
  didFire: (event: { payload: Partial<E>; status: LoadingDirectiveState; success: boolean }) => void;
  cancelled: (event: { payload: Partial<E> }) => void;
}

export interface ActionGenerics {
  OPTIONS: ActionOptions;
  EVENT: ActionEvent;
}

export abstract class Action<
  P extends Partial<ActionGenerics> = Partial<ActionGenerics>,
  T extends ActionGenerics & P = ActionGenerics & P,
  L extends ActionListener<T['EVENT']> = ActionListener<T['EVENT']>
> extends BaseObserver<L> {
  options: T['OPTIONS'];

  protected logger: Logger;

  @inject(VisorStore)
  accessor visorStore: VisorStore;

  @inject(DialogStore)
  accessor dialogStore: DialogStore;

  actionStore: ActionStore;

  constructor(options: T['OPTIONS']) {
    super();
    this.options = {
      ...options,
      hotkeys: options.hotkeys || [],
      aliases: options.aliases || [],
      tags: Array.from(
        new Set([...(options.tags || []), ...(options.behavior ? ACTION_BEHAVIOR_TAGS[options.behavior] : [])])
      )
    };
    this.logger = createLogger(options.name);
  }

  setActionStore(store: ActionStore) {
    this.actionStore = store;
    this.logger = store.logger.childLogger(formatLoggerName(this.options.id));
  }

  get id() {
    return this.options.id;
  }

  validate(event: Partial<T['EVENT']> = {}): ValidationResult {
    const results = (this.options.validators || []).map((validator) => validator.validate(event));
    const priority = [
      ActionValidationState.HIDDEN,
      ActionValidationState.DISABLED,
      ActionValidationState.BLOCKED,
      ActionValidationState.PENDING,
      ActionValidationState.DEFERRED,
      ActionValidationState.ALLOWED
    ];

    for (const state of priority) {
      const result = results.find((candidate) => candidate?.type === state);
      if (result) {
        return result;
      }
    }

    return { type: ActionValidationState.ALLOWED };
  }

  getExclusiveExecutionLock(event?: { allowed?: (e: Partial<T['EVENT']>) => boolean }): () => any {
    this.logger.debug('Acquiring exclusive execution lock');
    const listener = this.actionStore.registerListener({
      actionWillFire: async (globalEvent) => {
        // we allow some actions to fire
        if (globalEvent.action.options.exemptFromExclusiveExecutionLock) {
          return true;
        }

        // now we check this specific action
        if (this.options.id !== globalEvent.action.options.id) {
          globalEvent.action.logger.debug('Execution canceled by exclusive lock', {
            lockOwner: this.options.id
          });
          globalEvent.event.canceled = true;
          return;
        }

        // now we allow the dev check if this should fire, probably based on the parameters
        if (event?.allowed && !event.allowed(globalEvent.event as Partial<T['EVENT']>)) {
          globalEvent.action.logger.debug('Execution canceled because the event did not match the lock predicate', {
            lockOwner: this.options.id
          });
          globalEvent.event.canceled = true;
          return;
        }
      }
    });
    return () => {
      this.logger.debug('Releasing exclusive execution lock');
      listener();
    };
  }

  get group() {
    if (this.options.category?.grouping) {
      return _.chain(this.options.category?.grouping).trim().capitalize().value();
    }
    return null;
  }

  representAsComboBoxItem(
    options: { installAction: boolean; eventData?: Partial<T['EVENT']> } = { installAction: false }
  ): ActionComboBoxItem<this> {
    const eventData = options.eventData || {};
    const validation = this.validate(eventData);
    const validator = () => this.validate(eventData);
    const action = {
      icon: this.options.icon,
      color: 'orange',
      title: this.options.name,
      key: this.options.name,
      actionObject: this,
      group: this.group,
      validator,
      right: <ActionMetaWidget action={this} eventData={eventData} />
    } as ActionComboBoxItem<this>;
    if (validation.type === ActionValidationState.HIDDEN) {
      return null;
    }
    if (options.installAction) {
      action.action = (e) => {
        return this.fireAction({
          source: ActionSource.RIGHT_CLICK,
          position: e,
          ...(options?.eventData || {})
        } as T['EVENT']);
      };
    }
    return action;
  }

  representAsIcon(extraData: Partial<T['EVENT']> = {}): Btn {
    return {
      ...this.representAsButton(extraData),
      label: null
    };
  }

  representAsControl(options: { eventData?: Partial<T['EVENT']> } = {}) {
    return new ActionButtonControl({ action: this, getEventData: () => options.eventData as EventType<this> });
  }

  /**
   * Create a button representation of this action.
   *
   * The button carries a live validation function, so consumers that render a
   * Btn directly get the same dynamic enabled/disabled behavior as action
   * controls.
   */
  representAsButton(extraData: Partial<T['EVENT']> = {}): Btn {
    const validator = () => this.validate(extraData);
    return this.createButton(extraData, validator);
  }

  private createButton(extraData: Partial<T['EVENT']>, validator: Validator): Btn {
    return {
      label: this.options.name,
      tooltip: this.options.name,
      icon: this.options.icon,
      validator,
      action: async (event, loading?: (loading: boolean) => any) => {
        loading?.(true);
        try {
          await this.fireAction({
            source: ActionSource.BUTTON,
            position: event,
            ...extraData
          } as unknown as T['EVENT']);
        } finally {
          loading?.(false);
        }
      }
    };
  }

  renderAsButton(render: (btn: Btn) => React.JSX.Element, extraData: Partial<T['EVENT']> = {}): React.JSX.Element {
    return render(this.representAsButton(extraData));
  }

  getTypeDisplayName() {
    return 'Standard Action';
  }

  serialize(): SerializedAction {
    return {
      _action: this.options.name
    };
  }

  //!---------------- ACTION LIFECYCLE -----------------

  protected _generateActionEvent(event: Omit<T['EVENT'], 'id'>) {
    const status = new VisorLoadingDirective(`Running action: ${this.options.name}`);
    let status_pushed = false;
    return {
      ...event,
      id: this.options.id,
      canceled: event.canceled ?? false,
      getStatus: () => {
        if (!status_pushed) {
          this.visorStore.pushLoadingDirective(status);
          status_pushed = true;
        }
        return status;
      }
    } as T['EVENT'];
  }

  /**
   * Action will-fire events and returns true if the action can fire
   */
  protected async _preflightChecks(event: T['EVENT']) {
    const validation = this.validate(event);
    if (validation.type === ActionValidationState.BLOCKED) {
      await validation.onActivate();
      return false;
    }
    if (validation.type !== ActionValidationState.ALLOWED) {
      return false;
    }

    await this.iterateAsyncListeners((cb) => {
      return cb.willFire?.({
        payload: event
      });
    });

    // was the event canceled
    if (event.canceled) {
      this.logger.debug('Execution canceled by a willFire listener', { source: event.source });
      this.iterateListeners((cb) =>
        cb.cancelled?.({
          payload: event
        })
      );
      return false;
    }
    return true;
  }

  /**
   * Run the action with error handling
   */
  protected async _runAction(event: T['EVENT']) {
    try {
      // everything is good to go, fire the event
      const result = await this.fireEvent(event);
      event.getStatus().complete();
      return result;
    } catch (ex) {
      this.logger.error(
        'Action execution failed',
        {
          action: this.options.id,
          source: event.source
        },
        ex
      );
      this.dialogStore.showErrorDialog({
        title: `Action: ${this.options.name} failed`,
        message: 'Check the action logs for more information.'
      });
      event.getStatus().failed();
      throw ex;
    }
  }

  /**
   * Runs at the end of the action
   */
  protected _postFlightChecks(event: T['EVENT'], result) {
    this.iterateListeners((cb) => {
      cb.didFire?.({
        payload: event,
        status: event.getStatus().state,
        success: !!result
      });
    });
  }

  async fireAction(event: Omit<T['EVENT'], 'id'>) {
    // 1. create event
    const modified_event = this._generateActionEvent(event);
    // 2. check if we can run
    const preflight_check = await this._preflightChecks(modified_event);
    if (!preflight_check) {
      return;
    }
    // 3. run!
    const result = await this._runAction(modified_event);

    // 4. cleanup
    this._postFlightChecks(modified_event, result);
    return result;
  }

  protected abstract fireEvent(event: T['EVENT']): Promise<true | false | void>;
}
