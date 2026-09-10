import { describe, expect, it } from 'vitest';
import { TextInput } from '../../src/forms/controls/text/TextInput';
import { SelectInput } from '../../src/forms/controls/SelectInput';
import { MultiSelectInput } from '../../src/forms/controls/MultiSelectInput';
import { BooleanInput } from '../../src/forms/controls/BooleanInput';
import { NumberInput } from '../../src/forms/controls/NumberInput';

describe('field validation', () => {
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

  it('ignores a hidden invalid field and checks it again when shown', () => {
    const input = new TextInput({ label: 'Name', required: true, visible: false });
    expect(input.valid).toBe(false);
    expect(input.isValid()).toBe(true);
    input.update({ visible: true });
    expect(input.isValid()).toBe(false);
    input.setValue('Project');
    expect(input.isValid()).toBe(true);
  });

  it('responds to required changes without needing a value change', () => {
    const input = new TextInput({ label: 'Name', value: '' });
    expect(input.isValid()).toBe(true);
    input.update({ required: true });
    expect(input.isValid()).toBe(false);
    input.update({ required: false });
    expect(input.isValid()).toBe(true);
  });

  it('requires a selection and synchronizes changes from the underlying control', () => {
    const input = new SelectInput({ label: 'Region', required: true, value: '', options: { us: 'US' } });
    expect(input.isValid()).toBe(false);
    input.control.value = 'us';
    expect(input.value).toBe('us');
    expect(input.isValid()).toBe(true);
    input.setValue('');
    expect(input.control.value).toBe('');
    expect(input.isValid()).toBe(false);
  });

  it('requires at least one multiselect value', () => {
    const input = new MultiSelectInput({ label: 'Regions', required: true, value: [], options: { us: 'US' } });
    expect(input.isValid()).toBe(false);
    input.setValue(['us']);
    expect(input.isValid()).toBe(true);
    input.setValue([]);
    input.update({ visible: false });
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

  it('accepts false and zero as supplied values', () => {
    expect(new BooleanInput({ label: 'Enabled', required: true, value: false }).isValid()).toBe(true);
    expect(new NumberInput({ label: 'Count', required: true, value: 0 }).isValid()).toBe(true);
  });
});
