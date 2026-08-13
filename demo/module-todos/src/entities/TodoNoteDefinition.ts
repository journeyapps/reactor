import {
  EntityActionHandlerComponent,
  EntityDefinition,
  EntityDescriberComponent,
  InlineEntityEncoderComponent,
  InlineTreePresenterComponent,
  inject,
  SimpleEntitySearchEngineComponent
} from '@journeyapps/reactor-mod';
import { TodoEntities } from '../TodoEntities';
import { TodoStore } from '../stores/TodoStore';
import { TodoNoteModel } from '../models/TodoNoteModel';
import { EditTodoNoteAction } from '../actions/EditTodoNoteAction';
import { DeleteTodoNoteAction } from '../actions/DeleteTodoNoteAction';

export class TodoNoteDefinition extends EntityDefinition<TodoNoteModel> {
  @inject(TodoStore)
  accessor todoStore: TodoStore;

  constructor() {
    super({
      type: TodoEntities.TODO_NOTE,
      category: 'Demo Items',
      label: 'Todo Note',
      icon: 'sticky-note',
      iconColor: 'orange'
    });

    this.registerComponent(
      new EntityDescriberComponent<TodoNoteModel>({
        label: 'Simple',
        describe: (entity: TodoNoteModel) => {
          return {
            simpleName: entity.text,
            complexName: entity.parent ? `for ${entity.parent.name}` : null
          };
        }
      })
    );

    this.registerComponent(
      new InlineEntityEncoderComponent<TodoNoteModel, { id: string }>({
        version: 1,
        encode: (entity) => {
          return { id: entity.id };
        },
        decode: async (encoded) => {
          return this.todoStore.notes.find((note) => note.id === encoded.id) || null;
        }
      })
    );

    this.registerComponent(
      new SimpleEntitySearchEngineComponent<TodoNoteModel>({
        label: 'Notes',
        getEntities: async () => {
          return this.todoStore.notes;
        }
      })
    );

    this.registerComponent(new InlineTreePresenterComponent<TodoNoteModel>());

    this.registerComponent(new EntityActionHandlerComponent(EditTodoNoteAction.ID));
    this.registerAdditionalAction(EditTodoNoteAction.ID);
    this.registerAdditionalAction(DeleteTodoNoteAction.ID);
  }

  matchEntity(entity: any): boolean {
    return entity instanceof TodoNoteModel;
  }

  getEntityUID(entity: TodoNoteModel): string {
    return entity.id;
  }
}
