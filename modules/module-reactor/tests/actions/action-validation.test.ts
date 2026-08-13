import { describe, expect, it, vi } from 'vitest';
import {
  Action,
  ActionEvent,
  ActionMacroBehavior,
  ActionValidator,
  ActionValidationState,
  activateWithValidation,
  EntityAction,
  EntityDefinition,
  ValidationResult
} from '../../src';
import { createSearchEventMatcher } from '@journeyapps/reactor-lib-search';
import { matchesActionCommandPaletteSearch } from '../../src/entities-reactor/actions/ActionSearchEngineComponent';

interface TestActionEvent extends ActionEvent {
  targetEntity?: { allowed: boolean };
}

class TargetValidator extends ActionValidator<TestActionEvent> {
  validate(event?: Partial<TestActionEvent>): ValidationResult {
    if (!event?.targetEntity) {
      return { type: ActionValidationState.DEFERRED };
    }
    return event?.targetEntity?.allowed
      ? { type: ActionValidationState.ALLOWED }
      : {
          type: ActionValidationState.DISABLED,
          message: 'Not permitted'
        };
  }
}

class StaticValidator extends ActionValidator<TestActionEvent> {
  constructor(private readonly result: ValidationResult) {
    super();
  }

  validate(): ValidationResult {
    return this.result;
  }
}

class TestAction extends Action<{ EVENT: TestActionEvent }> {
  constructor(validators: ActionValidator<TestActionEvent>[] = []) {
    super({
      id: 'TEST_ACTION',
      name: 'Test action',
      icon: 'check',
      validators
    });
  }

  checkPreflight(event: TestActionEvent) {
    return this._preflightChecks(event);
  }

  protected async fireEvent(): Promise<true> {
    return true;
  }
}

class SearchableTestAction extends Action {
  constructor() {
    super({
      id: 'SEARCHABLE_ACTION',
      name: 'Delete todo item',
      icon: 'trash',
      aliases: ['Remove todo item', 'Discard todo item'],
      tags: ['todo', 'cleanup'],
      behavior: ActionMacroBehavior.DELETE
    });
  }

  protected async fireEvent(): Promise<true> {
    return true;
  }
}

class TestEntityAction extends EntityAction<{ id: string }> {
  constructor() {
    super({ id: 'ENTITY_ACTION', name: 'Entity action', icon: 'check', target: 'test-entity' });
  }

  protected async fireEvent(): Promise<true> {
    return true;
  }
}

class TestEntityDefinition extends EntityDefinition<{ id: string }> {
  constructor() {
    super({ type: 'test-entity', label: 'Test entity', category: 'Test', icon: 'cube', iconColor: 'blue' });
  }

  getEntityUID(entity: { id: string }) {
    return entity.id;
  }

  matchEntity(entity: unknown): boolean {
    return !!entity;
  }
}

const event = (allowed: boolean): TestActionEvent => ({
  id: 'TEST_ACTION',
  source: undefined,
  targetEntity: { allowed },
  getStatus: () => undefined
});

describe('action validation', () => {
  it('allows actions without validators', () => {
    expect(new TestAction().validate()).toEqual({ type: ActionValidationState.ALLOWED });
  });

  it('passes event data to validators', () => {
    const action = new TestAction([new TargetValidator()]);

    expect(action.validate(event(true)).type).toBe(ActionValidationState.ALLOWED);
    expect(action.validate(event(false))).toEqual({
      type: ActionValidationState.DISABLED,
      message: 'Not permitted'
    });
  });

  it('keeps actions with deferred validation available for parameter collection', () => {
    const action = new TestAction([new TargetValidator()]);
    const item = action.representAsComboBoxItem();

    expect(action.validate()).toEqual({ type: ActionValidationState.DEFERRED });
    expect(item.validator()).toEqual({ type: ActionValidationState.DEFERRED });
  });

  it('threads a contextual entity into entity action validation', () => {
    const entity = { id: 'entity-1' };

    expect(new TestEntityDefinition().getActionEventDataForEntity(entity, new TestEntityAction())).toEqual({
      targetEntity: entity
    });
  });

  it('uses hidden before disabled before allowed', () => {
    const action = new TestAction([
      new StaticValidator({ type: ActionValidationState.ALLOWED }),
      new StaticValidator({
        type: ActionValidationState.DISABLED,
        message: 'Unavailable'
      }),
      new StaticValidator({ type: ActionValidationState.HIDDEN })
    ]);

    expect(action.validate()).toEqual({ type: ActionValidationState.HIDDEN });
  });

  it('uses disabled before blocked before pending', () => {
    const action = new TestAction([
      new StaticValidator({ type: ActionValidationState.PENDING }),
      new StaticValidator({
        type: ActionValidationState.BLOCKED,
        onActivate: vi.fn()
      }),
      new StaticValidator({ type: ActionValidationState.DISABLED })
    ]);

    expect(action.validate()).toEqual({ type: ActionValidationState.DISABLED });
  });

  it('activates remediation without executing a blocked action', async () => {
    const onActivate = vi.fn();
    const execute = vi.fn();

    await activateWithValidation(
      {
        type: ActionValidationState.BLOCKED,
        message: 'Upgrade required',
        onActivate
      },
      execute
    );

    expect(onActivate).toHaveBeenCalledOnce();
    expect(execute).not.toHaveBeenCalled();
  });

  it('allows deferred validation to proceed to parameter collection', async () => {
    const execute = vi.fn();

    await activateWithValidation({ type: ActionValidationState.DEFERRED }, execute);

    expect(execute).toHaveBeenCalledOnce();
  });

  it('activates remediation when preflight becomes blocked', async () => {
    const onActivate = vi.fn();
    const action = new TestAction([
      new StaticValidator({
        type: ActionValidationState.BLOCKED,
        onActivate
      })
    ]);

    await expect(action.checkPreflight(event(true))).resolves.toBe(false);
    expect(onActivate).toHaveBeenCalledOnce();
  });

  it('binds button validation to its event data', () => {
    const action = new TestAction([new TargetValidator()]);

    expect(action.representAsButton(event(true)).validator().type).toBe(ActionValidationState.ALLOWED);
    expect(action.representAsButton(event(false)).validator().type).toBe(ActionValidationState.DISABLED);
  });

  it('uses the completed event during preflight', async () => {
    const action = new TestAction([new TargetValidator()]);

    await expect(action.checkPreflight(event(true))).resolves.toBe(true);
    await expect(action.checkPreflight(event(false))).resolves.toBe(false);
  });

  it('searches actions by full-name aliases, explicit tags and behavior tags', () => {
    const action = new SearchableTestAction();
    const matches = (search: string) =>
      matchesActionCommandPaletteSearch(action, {
        search,
        matches: createSearchEventMatcher(search)
      });

    expect(action.options.tags).toEqual(['todo', 'cleanup', 'delete', 'remove', 'destroy']);
    expect(['delete', 'discard', 'cleanup', 'destroy'].map(matches)).toEqual([true, true, true, true]);
    expect(matches('publish')).toBe(false);
  });
});
