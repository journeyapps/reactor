import {
  EntityDefinition,
  EntityActionHandlerComponent,
  EntityDescriberComponent,
  InlineEntityEncoderComponent,
  ioc,
  ReactorEntityCategories,
  SimpleEntitySearchEngineComponent
} from '@journeyapps/reactor-mod';
import { ChangeEditorThemeAction } from '../actions/ChangeEditorThemeAction';
import { EditorTheme, MonacoThemeStore } from '../stores/MonacoThemeStore';
import { EditorEntities } from './EditorEntities';

interface EncodedEditorTheme {
  themeID: string;
}

export class EditorThemeEntityDefinition extends EntityDefinition<EditorTheme> {
  static TYPE = EditorEntities.THEME;

  constructor() {
    super({
      type: EditorThemeEntityDefinition.TYPE,
      category: ReactorEntityCategories.CORE,
      label: 'Editor theme',
      icon: 'paint-brush',
      iconColor: 'orange'
    });

    this.registerComponent(
      new EntityDescriberComponent<EditorTheme>({
        label: 'Simple',
        describe: (entity) => {
          return {
            simpleName: entity.label
          };
        }
      })
    );

    this.registerComponent(
      new InlineEntityEncoderComponent<EditorTheme, EncodedEditorTheme>({
        version: 1,
        encode: (entity) => {
          return {
            themeID: entity.key
          };
        },
        decode: async (entity) => {
          return ioc.get(MonacoThemeStore).getTheme(entity.themeID);
        }
      })
    );

    this.registerComponent(
      new SimpleEntitySearchEngineComponent<EditorTheme>({
        label: 'Editor themes',
        getEntities: async () => {
          return Object.values(ioc.get(MonacoThemeStore).getThemes());
        }
      })
    );

    this.registerComponent(new EntityActionHandlerComponent(ChangeEditorThemeAction.ID));
  }

  getEntityUID(t: EditorTheme) {
    return t.key;
  }

  matchEntity(t: any): boolean {
    return !!t && typeof t.key === 'string' && typeof t.label === 'string' && !!t.theme;
  }
}
