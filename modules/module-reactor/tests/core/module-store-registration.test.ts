import { afterEach, describe, expect, it } from 'vitest';
import {
  AbstractReactorModule,
  ReactorModuleInitEvent,
  ReactorModuleRegisterEvent
} from '../../src/core/AbstractReactorModule';
import { ReactorKernel } from '../../src/core/ReactorKernel';
import { System } from '../../src/core/System';
import { ioc } from '../../src/inversify.config';
import { AbstractStore } from '../../src/stores/AbstractStore';

class TestStore extends AbstractStore {
  initCount = 0;

  constructor() {
    super({ name: 'TEST_STORE' });
  }

  protected async _init() {
    this.initCount += 1;
  }
}

class TestModule extends AbstractReactorModule {
  readonly store = new TestStore();

  constructor() {
    super({ name: 'Test module' });
  }

  register(event: ReactorModuleRegisterEvent) {
    event.registerStore(TestStore, this.store);
  }

  async init(_event: ReactorModuleInitEvent) {}
}

class TestKernel extends ReactorKernel {
  createRegisterEvent(module: AbstractReactorModule) {
    return this.createReactorModuleRegisterEvent(module);
  }
}

describe('module store registration', () => {
  afterEach(() => {
    [TestStore, System].forEach((type) => {
      try {
        ioc.unbind<TestStore | System>(type);
      } catch {}
    });
  });

  it('registers, names and initializes a module store exactly once', async () => {
    const module = new TestModule();
    const system = new System({ actionStore: null!, comboBoxStore2: null! });
    ioc.bind(System).toConstantValue(system);
    module.register(new TestKernel().createRegisterEvent(module));

    expect(system.getStores()).toEqual([module.store]);
    expect(ioc.get(TestStore)).toBe(module.store);
    expect(module.store.logger.name).toBe('Test module:Test');

    await Promise.all([module.store.init(), system.initStores(), system.initStores()]);
    expect(module.store.initCount).toBe(1);
  });
});
