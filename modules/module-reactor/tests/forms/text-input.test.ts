import { describe, expect, it } from 'vitest';
import { TextInput } from '../../src/forms/controls/text/TextInput';

describe('TextInput', () => {
  it.each([undefined, null, '', '   '])('rejects an empty required text value: %s', (value) => {
    const input = new TextInput({ label: 'Name', required: true, value });
    expect(input.isValid()).toBe(false);
  });

  it('accepts optional empty text but still rejects a custom validation error', () => {
    const input = new TextInput({ label: 'Name', validator: (value) => value.length >= 3 || 'Too short' });
    expect(input.isValid()).toBe(true);
    input.setValue('ab');
    expect(input.valid).toBe(false);
    expect(input.error).toBe('Too short');
    expect(input.isValid()).toBe(false);
    input.setValue('abc');
    expect(input.isValid()).toBe(true);
  });

  it('validates initial text and revalidates when its validator changes', () => {
    const input = new TextInput({ label: 'Name', value: 'ab', validator: (value) => value.length >= 3 || 'Too short' });
    expect(input.error).toBe('Too short');
    expect(input.isValid()).toBe(false);
    input.update({ validator: () => true });
    expect(input.isValid()).toBe(true);
  });

  it('does not pass an absent required value to a custom text validator', () => {
    const input = new TextInput({
      label: 'Name',
      required: true,
      value: 'abc',
      validator: (value) => value.length >= 3
    });
    input.setValue('');
    expect(input.error).toBe('Required');
    expect(input.isValid()).toBe(false);
  });
});
