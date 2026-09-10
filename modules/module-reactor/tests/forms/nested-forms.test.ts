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

  it('reports nested invalid values while excluding hidden invalid fields', () => {
    const form = new FormModel();
    const group = form.addInput(new GroupInput({ name: 'details', label: 'Details', inputs: [requiredName()] }));
    form.addInput(new TextInput({ name: 'hidden', label: 'Hidden', required: true, visible: false }));
    expect(form.errors()).toEqual({ details: { name: null } });
    group.getInput('name').setValue('Valid');
    expect(form.errors()).toEqual({});
  });
});
