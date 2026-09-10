import { FormModel } from '../../src/forms/FormModel';
import { describe, expect, it } from 'vitest';
import { TextInput } from '../../src/forms/controls/text/TextInput';
import { GroupInput } from '../../src/forms/controls/collection/GroupInput';
import { ArrayInput } from '../../src/forms/controls/collection/ArrayInput';
import { ArraySetInput } from '../../src/forms/controls/collection/ArraySetInput';

const requiredName = () => new TextInput({ name: 'name', label: 'Name', required: true });

describe('nested forms', () => {
  it('notifies the parent form when nested validation changes', () => {
    const name = requiredName();
    const group = new GroupInput({ label: 'Details', inputs: [name] });
    const form = new FormModel();
    form.addInput(group);
    let valid = form.isValid();
    form.registerListener({
      errorsChanged: () => {
        valid = form.isValid();
      }
    });
    expect(valid).toBe(false);
    name.setValue('Project');
    expect(valid).toBe(true);
    name.setValue('');
    expect(valid).toBe(false);
    name.update({ visible: false });
    expect(valid).toBe(true);
  });

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
});

describe('collection validation regressions', () => {
  it.each(['array', 'set'])('refreshes dialog-style validation on %s membership changes', (kind) => {
    const input =
      kind === 'array'
        ? new ArrayInput<string>({ label: 'Names', generate: requiredName, value: [] })
        : new ArraySetInput<string>({
            label: 'Names',
            generate: requiredName,
            entries: [{ key: 'first', title: 'First' }]
          });
    const form = new FormModel();
    form.addInput(input);
    let valid = form.isValid();
    form.registerListener({
      errorsChanged: () => {
        valid = form.isValid();
      }
    });
    if (input instanceof ArrayInput) {
      input.setValue(['']);
    } else {
      input.setValue({ first: '' });
    }
    expect(valid).toBe(false);
    if (input instanceof ArrayInput) {
      input.setValue([]);
    } else {
      input.setValue({});
    }
    expect(valid).toBe(true);
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

  it('reports nested invalid values while excluding hidden invalid fields', () => {
    const form = new FormModel();
    const group = form.addInput(new GroupInput({ name: 'details', label: 'Details', inputs: [requiredName()] }));
    form.addInput(new TextInput({ name: 'hidden', label: 'Hidden', required: true, visible: false }));
    expect(form.errors()).toEqual({ details: { name: null } });
    group.getInput('name').setValue('Valid');
    expect(form.errors()).toEqual({});
  });
});
