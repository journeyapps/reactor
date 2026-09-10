import { describe, expect, it } from 'vitest';
import { TextInput } from '../../src/forms/controls/text/TextInput';
import { GroupInput } from '../../src/forms/controls/collection/GroupInput';
const requiredName = () => new TextInput({ name: 'name', label: 'Name', required: true });

describe('GroupInput', () => {
  it('checks grouped fields and propagates values in both directions', () => {
    const name = requiredName();
    const group = new GroupInput<{ name: string }>({ label: 'Details', inputs: [name] });
    expect(group.isValid()).toBe(false);
    name.setValue('First');
    expect(group.value).toEqual({ name: 'First' });
    expect(group.isValid()).toBe(true);
    group.setValue({ name: 'Second' });
    expect(name.value).toBe('Second');
    name.setValue('');
    group.update({ visible: false });
    expect(group.isValid()).toBe(true);
  });
});
