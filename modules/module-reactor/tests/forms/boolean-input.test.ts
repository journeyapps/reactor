import { describe, expect, it } from 'vitest';
import { BooleanInput } from '../../src/forms/controls/BooleanInput';

describe('BooleanInput', () => {
  it('accepts false as a required value', () => {
    expect(new BooleanInput({ label: 'Enabled', required: true, value: false }).isValid()).toBe(true);
  });
});
