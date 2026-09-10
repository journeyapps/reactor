import { describe, expect, it } from 'vitest';
import { SelectInput } from '../../src/forms/controls/SelectInput';

describe('SelectInput', () => {
  it('requires a selection and synchronizes changes from the underlying control', () => {
    const input = new SelectInput<string>({ label: 'Region', required: true, value: '', options: { us: 'US' } });
    expect(input.isValid()).toBe(false);
    input.control.value = 'us';
    expect(input.value).toBe('us');
    expect(input.isValid()).toBe(true);
    input.setValue('');
    expect(input.control.value).toBe('');
    expect(input.isValid()).toBe(false);
  });
});
