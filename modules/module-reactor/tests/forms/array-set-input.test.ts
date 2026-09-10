import { describe, expect, it } from 'vitest';
import { TextInput } from '../../src/forms/controls/text/TextInput';
import { ArraySetInput } from '../../src/forms/controls/collection/ArraySetInput';
const requiredName = () => new TextInput({ name: 'name', label: 'Name', required: true });

describe('ArraySetInput', () => {
  it('checks keyed collection entries and handles removal', () => {
    const array = new ArraySetInput<string>({
      label: 'Names',
      required: true,
      entries: [{ key: 'first', title: 'First' }],
      generate: requiredName,
      value: {}
    });
    expect(array.isValid()).toBe(false);
    array.setValue({ first: '' });
    expect(array.isValid()).toBe(false);
    array.entries.get('first')!.setValue('First');
    expect(array.value).toEqual({ first: 'First' });
    expect(array.isValid()).toBe(true);
    array.setValue({});
    expect(array.isValid()).toBe(false);
  });

  it('synchronizes existing keyed entries and does not discard falsy initial values', () => {
    const input = new ArraySetInput<string>({
      label: 'Names',
      entries: [{ key: 'first', title: 'First' }],
      generate: () => new TextInput({ label: 'Name', required: true, value: 'Default' }),
      value: { first: '' }
    });
    expect(input.entries.get('first')!.value).toBeNull();
    expect(input.isValid()).toBe(false);
    input.setValue({ first: 'Updated' });
    expect(input.entries.get('first')!.value).toBe('Updated');
    expect(input.isValid()).toBe(true);
    input.setValue({ first: '' });
    expect(input.isValid()).toBe(false);
  });
});
