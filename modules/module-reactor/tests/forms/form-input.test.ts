import { afterEach, describe, expect, it, vi } from 'vitest';
import { FormInput } from '../../src/forms/FormInput';
import { inputFactories } from './fixtures/input-factories';

describe.each(inputFactories)('$name common input contract', (factory) => {
  let input: FormInput;
  const create = (options: Parameters<typeof factory.create>[0] = {}) => {
    const fixture = factory.create(options);
    input = fixture.input;
    return fixture;
  };

  afterEach(() => input?.dispose());

  it('allows empty optional values', () => {
    create();
    expect(input.isValid()).toBe(true);
    expect(input.error).toBeNull();
  });

  it('requires a value and revalidates when supplied or cleared', () => {
    const fixture = create({ required: true });
    expect(input.isValid()).toBe(false);
    expect(input.error).toBe('Required');
    fixture.provideValue();
    expect(input.isValid()).toBe(true);
    expect(input.error).toBeNull();
    fixture.clearValue();
    expect(input.isValid()).toBe(false);
    expect(input.error).toBe('Required');
  });

  it('ignores hidden errors without erasing them', () => {
    create({ required: true, visible: false });
    expect(input.valid).toBe(false);
    expect(input.isValid()).toBe(true);
    input.update({ visible: true });
    expect(input.isValid()).toBe(false);
    input.update({ visible: false });
    expect(input.isValid()).toBe(true);
    expect(input.error).toBe('Required');
  });

  it('revalidates required option changes without changing the value', () => {
    create();
    input.update({ required: true });
    expect(input.isValid()).toBe(false);
    input.update({ required: false });
    expect(input.isValid()).toBe(true);
  });

  it('keeps disabled fields in validation', () => {
    const fixture = create({ required: true, disabled: true });
    expect(input.isValid()).toBe(false);
    fixture.provideValue();
    expect(input.isValid()).toBe(true);
  });

  it('reports value updates with the previous and current values', () => {
    const fixture = create();
    const previous = fixture.provideValue();
    const valueChanged = vi.fn();
    const dispose = input.registerListener({ valueChanged });
    const current = fixture.provideOtherValue();
    expect(input.value).toEqual(current);
    expect(valueChanged).toHaveBeenCalledWith({ prev_value: previous, current_value: current });
    dispose();
    valueChanged.mockClear();
    fixture.clearValue();
    expect(valueChanged).not.toHaveBeenCalled();
  });

  it('does not repeat value notifications for the current value', () => {
    const fixture = create();
    fixture.provideValue();
    const valueChanged = vi.fn();
    input.registerListener({ valueChanged });
    input.setValue(input.value);
    expect(valueChanged).not.toHaveBeenCalled();
  });

  it('notifies consumers of validation and option changes', () => {
    const fixture = create({ required: true });
    const errorChanged = vi.fn();
    const optionsUpdated = vi.fn();
    input.registerListener({ errorChanged, optionsUpdated });
    fixture.provideValue();
    expect(errorChanged).toHaveBeenCalledWith({ error: null });
    errorChanged.mockClear();
    fixture.clearValue();
    expect(errorChanged).toHaveBeenCalledWith({ error: 'Required' });
    input.update({ visible: false });
    expect(optionsUpdated).toHaveBeenCalledOnce();
  });

  it('notifies consumers when removed', () => {
    create();
    const removed = vi.fn();
    input.registerListener({ removed });
    input.remove();
    expect(removed).toHaveBeenCalledOnce();
  });
});
