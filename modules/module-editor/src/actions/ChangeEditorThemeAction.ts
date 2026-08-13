import { ActionStore, EntityAction, EntityActionEvent, ioc } from '@journeyapps/reactor-mod';
import { EditorTheme, MonacoThemeStore } from '../stores/MonacoThemeStore';
import { EditorEntities } from '../entities/EditorEntities';

export class ChangeEditorThemeAction extends EntityAction<EditorTheme> {
  static ID = 'CHANGE_EDITOR_THEME';
  static NAME = 'Change code theme';

  constructor() {
    super({
      name: ChangeEditorThemeAction.NAME,
      tags: ['internal', 'editor', 'theme', 'appearance'],
      icon: 'paint-brush',
      id: ChangeEditorThemeAction.ID,
      target: EditorEntities.THEME
    });
  }

  protected async fireEvent(event: EntityActionEvent<EditorTheme>): Promise<any> {
    ioc.get(MonacoThemeStore).selectedTheme.setItem(event.targetEntity);
  }

  static get() {
    return ioc.get(ActionStore).getAction<ChangeEditorThemeAction>(ChangeEditorThemeAction.NAME);
  }
}
