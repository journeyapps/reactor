import * as React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { observable } from 'mobx';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ActionValidationState, Validator } from '../../src/actions/validators/ActionValidator';
import { useValidator } from '../../src/hooks/useValidator';

describe('useValidator', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
  });

  it('uses the validator result on the first render', async () => {
    const rendered: { type: ActionValidationState; disabled: boolean; hidden: boolean }[] = [];
    const validator: Validator = () => ({ type: ActionValidationState.DISABLED });

    const TestWidget = () => {
      const { validationResult, disabled, hidden } = useValidator({ validator });
      rendered.push({ type: validationResult.type, disabled, hidden });
      return null;
    };

    await act(async () => root.render(<TestWidget />));

    expect(rendered[0]).toEqual({ type: ActionValidationState.DISABLED, disabled: true, hidden: false });
    expect(rendered.map((result) => result.type)).not.toContain(ActionValidationState.ALLOWED);
  });

  it('switches validator dependencies without recreating its subscription', async () => {
    const first = observable.box<ActionValidationState.ALLOWED | ActionValidationState.HIDDEN>(
      ActionValidationState.ALLOWED
    );
    const second = observable.box<ActionValidationState.DISABLED | ActionValidationState.PENDING>(
      ActionValidationState.DISABLED
    );
    const rendered: ActionValidationState[] = [];
    const firstValidator: Validator = () => ({ type: first.get() });
    const secondValidator: Validator = () => ({ type: second.get() });

    const TestWidget = (props: { validator: Validator }) => {
      const { validationResult } = useValidator(props);
      rendered.push(validationResult.type);
      return null;
    };

    await act(async () => root.render(<TestWidget validator={firstValidator} />));
    await act(async () => root.render(<TestWidget validator={secondValidator} />));
    await act(async () => second.set(ActionValidationState.PENDING));

    expect(rendered.at(-1)).toBe(ActionValidationState.PENDING);

    const renderCount = rendered.length;
    await act(async () => first.set(ActionValidationState.HIDDEN));
    expect(rendered).toHaveLength(renderCount);
  });
});
