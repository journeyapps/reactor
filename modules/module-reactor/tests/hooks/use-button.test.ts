import { describe, expect, it, vi } from 'vitest';
import { ActionValidationState } from '../../src/actions/validators/ActionValidator';
import { Btn } from '../../src/definitions/common';
import { resolveButtonTooltip } from '../../src/hooks/useButton';

const button = (overrides: Partial<Btn> = {}): Btn => ({
  action: vi.fn(),
  ...overrides
});

describe('resolveButtonTooltip', () => {
  it('omits a tooltip that matches the visible button label', () => {
    expect(
      resolveButtonTooltip(button({ label: 'Delete schema model', tooltip: 'Delete schema model' }), {
        type: ActionValidationState.ALLOWED
      })
    ).toBeUndefined();
  });

  it('keeps a tooltip that adds information beyond the label', () => {
    expect(
      resolveButtonTooltip(button({ label: 'Delete', tooltip: 'Delete schema model' }), {
        type: ActionValidationState.ALLOWED
      })
    ).toBe('Delete schema model');
  });

  it('keeps the inferred tooltip for an icon-only button', () => {
    expect(
      resolveButtonTooltip(button({ tooltip: 'Delete schema model' }), {
        type: ActionValidationState.ALLOWED
      })
    ).toBe('Delete schema model');
  });

  it('uses a distinct validation message as the final tooltip', () => {
    expect(
      resolveButtonTooltip(button({ label: 'Delete schema model', tooltip: 'Delete schema model' }), {
        type: ActionValidationState.DISABLED,
        message: 'You do not have permission to delete this model'
      })
    ).toBe('You do not have permission to delete this model');
  });
});
