import {
  AbstractReactorModule,
  ReactorModuleInitEvent,
  ReactorModuleRegisterEvent,
  WorkspaceStore
} from '@journeyapps/reactor-mod';
import { LoggingDebugPanelFactory } from './panels/LoggingDebugPanelFactory';

export class ReactorDebugModule extends AbstractReactorModule {
  constructor() {
    super({
      name: 'Reactor debug'
    });
  }

  register({ ioc }: ReactorModuleRegisterEvent) {
    ioc.get(WorkspaceStore).registerFactory(new LoggingDebugPanelFactory());
  }

  async init(_event: ReactorModuleInitEvent): Promise<void> {}
}
