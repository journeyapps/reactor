import { describe, expect, it } from 'vitest';
import { TextInput } from '../../src/forms/controls/text/TextInput';
import { ArrayInput } from '../../src/forms/controls/collection/ArrayInput';
const requiredName = () => new TextInput({ name: 'name', label: 'Name', required: true });

describe('ArrayInput', () => {
  it('checks each array entry, including optional arrays with invalid entries', () => {
    const array = new ArrayInput<string>({ label: 'Names', generate: requiredName, value: [] });
    expect(array.isValid()).toBe(true);
    array.update({ required: true });
    expect(array.isValid()).toBe(false);
    array.setValue(['First', '']);
    expect(array.isValid()).toBe(false);
    array.update({ required: false });
    expect(array.isValid()).toBe(false);
    const last = Array.from(array.entries.values())[1];
    last.setValue('Second');
    expect(array.value).toEqual(['First', 'Second']);
    expect(array.isValid()).toBe(true);
    last.setValue('');
    last.update({ visible: false });
    expect(array.isValid()).toBe(true);
  });

  it('detaches array entries when the collection is replaced', () => {
    const array = new ArrayInput<string>({ label: 'Names', generate: requiredName, value: ['First'] });
    const previous = Array.from(array.entries.values())[0];
    array.setValue([]);
    previous.setValue('Detached');
    expect(array.value).toEqual([]);
    expect(array.entries.size).toBe(0);
  });
});
