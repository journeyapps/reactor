import { describe, expect, it } from 'vitest';
import { NumberInput } from '../../src/forms/controls/NumberInput';

describe('NumberInput', () => {
  it('validates optional numbers when supplied and permits clearing them', () => {
    const input = new NumberInput({ label: 'Count', min: 0, max: 10 });
    expect(input.isValid()).toBe(true);
    input.setIntermediate('not a number');
    expect(input.isValid()).toBe(false);
    input.setValue(-1);
    expect(input.isValid()).toBe(false);
    input.setValue(11);
    expect(input.isValid()).toBe(false);
    input.setValue(10);
    expect(input.isValid()).toBe(true);
    input.setIntermediate('');
    expect(input.value).toBeNull();
    expect(input.isValid()).toBe(true);
  });

  it('accepts zero as a required value', () => {
    expect(new NumberInput({ label: 'Count', required: true, value: 0 }).isValid()).toBe(true);
  });
});
