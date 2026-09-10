import { describe, expect, it, vi } from 'vitest';
import { FormModel } from '../../src/forms/FormModel';
import { TextInput } from '../../src/forms/controls/text/TextInput';

describe('FormModel', () => {
  it('treats an empty form as valid', () => {
    const form = new FormModel();
    expect(form.isValid()).toBe(true);
    expect(form.value()).toEqual({});
  });

  it('requires all visible fields to be valid', () => {
    const form = new FormModel();
    const name = form.addInput(new TextInput({ name: 'name', label: 'Name', required: true }));
    const secret = form.addInput(new TextInput({ name: 'secret', label: 'Secret', required: true, visible: false }));
    expect(form.isValid()).toBe(false);
    name.setValue('Project');
    expect(form.isValid()).toBe(true);
    secret.update({ visible: true });
    expect(form.isValid()).toBe(false);
  });

  it('sets named values and omits hidden fields from submitted values', () => {
    const form = new FormModel<{ name: string; hidden: string }>();
    form.addInput(new TextInput({ name: 'name', label: 'Name' }));
    form.addInput(new TextInput({ name: 'hidden', label: 'Hidden', visible: false }));
    form.setValues({ name: 'Project', hidden: 'Stored' });
    expect(form.value()).toEqual({ name: 'Project' });
    expect(form.getInput('hidden').value).toBe('Stored');
  });

  it('forwards value and validation events without repeating unchanged values', () => {
    const form = new FormModel();
    const input = form.addInput(new TextInput({ label: 'Name', required: true }));
    const valueChanged = vi.fn();
    const errorsChanged = vi.fn();
    form.registerListener({ valueChanged, errorsChanged });
    input.setValue('Project');
    input.setValue('Project');
    expect(valueChanged).toHaveBeenCalledExactlyOnceWith({ input });
    expect(errorsChanged).toHaveBeenCalledExactlyOnceWith({ input });
  });

  it('notifies consumers when visibility changes form validity', () => {
    const form = new FormModel();
    const input = form.addInput(new TextInput({ label: 'Name', required: true }));
    let valid = form.isValid();
    form.registerListener({
      errorsChanged: () => {
        valid = form.isValid();
      }
    });
    expect(valid).toBe(false);
    input.update({ visible: false });
    expect(valid).toBe(true);
    input.update({ visible: true });
    expect(valid).toBe(false);
  });

  it('removes fields and stops forwarding their events', () => {
    const form = new FormModel();
    const input = form.addInput(new TextInput({ label: 'Name', required: true }));
    const changed = vi.fn();
    form.registerListener({ valueChanged: changed });
    input.remove();
    input.setValue('Detached');
    expect(form.inputs).toEqual([]);
    expect(form.isValid()).toBe(true);
    expect(changed).not.toHaveBeenCalled();
  });
});
