import {
  AbstractReactorModule,
  ActionStore,
  GuideStore,
  ReactorModuleInitEvent,
  ReactorModuleRegisterEvent,
  UXStore,
  WorkspaceStore
} from '@journeyapps/reactor-mod';
import { DemoBodyWidget } from './BodyWidget';
import { setupWorkspaces } from './setupWorkspaces';
import { PlaygroundPanelFactory } from './panels/PlaygroundPanelFactory';
import { PlaygroundDialogsComboboxesPanelWidget } from './panels/PlaygroundDialogsComboboxesPanelWidget';
import { PlaygroundFormsPanelWidget } from './panels/PlaygroundFormsPanelWidget';
import { PlaygroundCardsPanelWidget } from './panels/PlaygroundCardsPanelWidget';
import { PlaygroundSurfacesPanelWidget } from './panels/PlaygroundSurfacesPanelWidget';
import { PlaygroundTabsPanelWidget } from './panels/PlaygroundTabsPanelWidget';
import { PlaygroundButtonsPanelWidget } from './panels/PlaygroundButtonsPanelWidget';
import { PlaygroundEditorsPanelWidget } from './panels/PlaygroundEditorsPanelWidget';
import { PlaygroundTablesPanelWidget } from './panels/PlaygroundTablesPanelWidget';
import { PlaygroundTreeSearchPanelWidget } from './panels/tree/PlaygroundTreeSearchPanelWidget';
import { PlaygroundDragDropPanelWidget } from './panels/PlaygroundDragDropPanelWidget';
import { PlaygroundOverlaysPanelWidget } from './panels/PlaygroundOverlaysPanelWidget';
import { PlaygroundGuidePanelWidget } from './panels/PlaygroundGuidePanelWidget';
import { PlaygroundGuideWorkflow } from './guides/PlaygroundGuideWorkflow';
import { PlaygroundActionsPanelWidget } from './panels/PlaygroundActionsPanelWidget';
import { PlaygroundValidationAction } from './actions/PlaygroundValidationAction';
import { PlaygroundStore } from './stores/PlaygroundStore';

export class ReactorPlaygroundModule extends AbstractReactorModule {
  constructor() {
    super({
      name: 'Reactor playground module'
    });
  }

  register(event: ReactorModuleRegisterEvent) {
    const { ioc } = event;
    const workspaceStore = ioc.get(WorkspaceStore);
    const guideStore = ioc.get(GuideStore);
    const actionStore = ioc.get(ActionStore);
    const uxStore = ioc.get<UXStore>(UXStore);
    const playgroundStore = new PlaygroundStore();

    event.registerStore(PlaygroundStore, playgroundStore);

    uxStore.primaryHeader = {
      label: 'Reactor Demo'
    };
    uxStore.setRootComponent(DemoBodyWidget);

    actionStore.registerAction(new PlaygroundValidationAction());

    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.dialogs-comboboxes',
        name: 'Dialogs + Comboboxes',
        icon: 'sitemap',
        widget: PlaygroundDialogsComboboxesPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.overlays',
        name: 'Overlays',
        icon: 'layer-group',
        widget: PlaygroundOverlaysPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.guide',
        name: 'Guide',
        icon: 'map-signs',
        widget: PlaygroundGuidePanelWidget
      })
    );
    guideStore.registerGuideWorkflow(new PlaygroundGuideWorkflow());
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.tree-search',
        name: 'Tree + Search',
        icon: 'search',
        widget: PlaygroundTreeSearchPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.forms',
        name: 'Forms',
        icon: 'list',
        widget: PlaygroundFormsPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.cards',
        name: 'Layout',
        icon: 'id-card',
        widget: PlaygroundCardsPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.surfaces',
        name: 'Surfaces',
        icon: 'layer-group',
        widget: PlaygroundSurfacesPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.tabs',
        name: 'Tabs',
        icon: 'folder',
        widget: PlaygroundTabsPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.actions',
        name: 'Actions',
        icon: 'wand-magic-sparkles',
        widget: PlaygroundActionsPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.buttons',
        name: 'Buttons',
        icon: 'mouse-pointer',
        widget: PlaygroundButtonsPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.editors',
        name: 'Editors',
        icon: 'code',
        widget: PlaygroundEditorsPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.tables',
        name: 'Tables',
        icon: 'table',
        widget: PlaygroundTablesPanelWidget
      })
    );
    workspaceStore.registerFactory(
      new PlaygroundPanelFactory({
        type: 'playground.drag-drop',
        name: 'Drag + Drop',
        icon: 'arrows-alt',
        widget: PlaygroundDragDropPanelWidget
      })
    );

    setupWorkspaces();
  }

  async init(_event: ReactorModuleInitEvent): Promise<any> {}
}
