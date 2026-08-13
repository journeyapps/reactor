import { WorkspaceGroup, WorkspaceModel, WorkspaceStore } from '@journeyapps/reactor-mod';
import { ioc } from '@journeyapps/reactor-mod';
import { PlaygroundPanelModel } from './panels/PlaygroundPanelFactory';

export const setupWorkspaces = () => {
  const workspaceStore = ioc.get(WorkspaceStore);

  const generatePlaygroundWorkspace = (type: string) => {
    const model = workspaceStore.generateRootModel();

    model.addModel(new PlaygroundPanelModel(type));

    return model;
  };

  const generatePlaygroundWorkspaceGroup = () => {
    const playgroundWorkspaces = [
      ['playground.dialogs-comboboxes', 'Dialogs'],
      ['playground.tree-search', 'Tree search'],
      ['playground.forms', 'Forms'],
      ['playground.cards', 'Cards'],
      ['playground.surfaces', 'Surfaces'],
      ['playground.tabs', 'Tabs'],
      ['playground.actions', 'Actions'],
      ['playground.buttons', 'Buttons'],
      ['playground.editors', 'Editors'],
      ['playground.tables', 'Tables'],
      ['playground.drag-drop', 'Drag drop'],
      ['playground.overlays', 'Overlays'],
      ['playground.guide', 'Guide']
    ];

    return new WorkspaceGroup({
      id: 'playground',
      name: 'playground',
      priority: 1,
      children: playgroundWorkspaces.map(([type, name]) => {
        return new WorkspaceModel({
          id: type,
          name,
          model: generatePlaygroundWorkspace(type)
        });
      })
    });
  };

  workspaceStore.registerWorkspaceGenerator({
    generateWorkspace: async () => {
      return generatePlaygroundWorkspaceGroup();
    }
  });
};
