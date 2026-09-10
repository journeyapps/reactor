import { describe, expect, it } from 'vitest';
import { EntityHandlerBank } from '../../src/entities/components/handler/EntityHandlerBank';
import { EntityHandlerComponent, OpenEntityEvent } from '../../src/entities/components/handler/EntityHandlerComponent';

class TestHandler extends EntityHandlerComponent<unknown> {
  async openEntity(_event: OpenEntityEvent<unknown>): Promise<void> {}

  getDescription() {
    return { title: 'Open' };
  }
}

describe('EntityHandlerBank', () => {
  it('prefers an explicitly preferred handler', () => {
    const bank = new EntityHandlerBank();
    const fallback = new TestHandler();
    const preferred = new TestHandler({ preferred: true });

    bank.register(fallback);
    bank.register(preferred);

    expect(bank.getPreferred()).toBe(preferred);
  });

  it('uses the only handler as the default', () => {
    const bank = new EntityHandlerBank();
    const handler = new TestHandler();

    bank.register(handler);

    expect(bank.getPreferred()).toBe(handler);
  });

  it('does not choose between multiple unpreferred handlers', () => {
    const bank = new EntityHandlerBank();
    bank.register(new TestHandler());
    bank.register(new TestHandler());

    expect(bank.getPreferred()).toBeNull();
  });
});
