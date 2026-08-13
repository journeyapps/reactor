import {
  AbstractReactorModule,
  RawBodyWidget,
  ReactorModuleInitEvent,
  ReactorModuleRegisterEvent,
  UXStore,
  WorkspaceModel,
  WorkspaceStore
} from '@journeyapps/reactor-mod';

export class ReactorCustomLayout extends AbstractReactorModule {
  constructor() {
    super({
      name: 'Reactor custom layout'
    });
  }

  register({ ioc }: ReactorModuleRegisterEvent) {
    const workspaceStore = ioc.get(WorkspaceStore);
    const uxStore = ioc.get<UXStore>(UXStore);
    uxStore.setRootComponent(RawBodyWidget);

    workspaceStore.registerWorkspaceGenerator({
      generateAdvancedWorkspace: async () => {
        return new WorkspaceModel({
          name: 'Advanced workspace',
          priority: 1,
          model: workspaceStore.generateRootModel()
        });
      },
      generateSimpleWorkspace: async () => {
        return new WorkspaceModel({
          name: 'Simple workspace',
          priority: 1,
          model: workspaceStore.generateRootModel()
        });
      }
    });
  }

  async init(_event: ReactorModuleInitEvent): Promise<any> {}
}
