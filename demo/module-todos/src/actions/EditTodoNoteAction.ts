import { EntityAction, EntityActionEvent } from '@journeyapps/reactor-mod';
import { TodoEntities } from '../TodoEntities';
import { TodoNoteModel } from '../models/TodoNoteModel';

export class EditTodoNoteAction extends EntityAction<TodoNoteModel> {
  static ID = 'EDIT_TODO_NOTE';

  constructor() {
    super({
      id: EditTodoNoteAction.ID,
      name: 'Edit note',
      tags: ['todo', 'note', 'edit'],
      icon: 'pencil',
      target: TodoEntities.TODO_NOTE,
      category: {
        grouping: 'notes'
      }
    });
  }

  async fireEvent(event: EntityActionEvent<TodoNoteModel>): Promise<any> {
    const result = await this.dialogStore.showInputDialog({
      title: 'Edit note',
      initialValue: event.targetEntity.text
    });
    const next = result?.trim();
    if (!next) {
      return false;
    }
    event.targetEntity.text = next;
  }
}
