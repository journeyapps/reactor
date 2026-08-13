import {
  AbstractReactorModule,
  ReactorModuleInitEvent,
  ReactorModuleRegisterEvent,
  System
} from '@journeyapps/reactor-mod';
import { StressTestEntityDefinition } from './entities/StressTestEntityDefinition';

export class ReactorStressTestModule extends AbstractReactorModule {
  constructor() {
    super({
      name: 'Reactor stress test'
    });
  }

  register({ ioc }: ReactorModuleRegisterEvent) {
    const system = ioc.get(System);

    system.registerDefinition(new StressTestEntityDefinition());
  }

  async init(_event: ReactorModuleInitEvent): Promise<any> {}
}
