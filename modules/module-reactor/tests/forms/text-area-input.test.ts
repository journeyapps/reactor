import { describe, expect, it } from 'vitest';
import { TextAreaInput } from '../../src/forms/controls/text/TextAreaInput';

describe('TextAreaInput', () => {
  it('validates multiline content on construction and when the validator changes', () => {
    const input = new TextAreaInput({
      label: 'Description',
      value: 'First line\nSecond line',
      validator: (value) => value.split('\n').length <= 1 || 'Use one line'
    });
    expect(input.error).toBe('Use one line');
    input.update({ validator: (value) => value.split('\n').length <= 2 || 'Use at most two lines' });
    expect(input.isValid()).toBe(true);
    expect(input.value).toBe('First line\nSecond line');
    input.setValue('One\nTwo\nThree');
    expect(input.error).toBe('Use at most two lines');
  });

  it('normalizes whitespace-only lines and skips the optional validator when cleared', () => {
    const input = new TextAreaInput({ label: 'Description', validator: () => 'Invalid content' });
    input.setValue('Content');
    expect(input.error).toBe('Invalid content');
    input.setValue(' \n \t ');
    expect(input.value).toBeNull();
    expect(input.isValid()).toBe(true);
    input.update({ required: true });
    expect(input.error).toBe('Required');
  });
});
