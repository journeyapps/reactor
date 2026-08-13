import { EntityAction, EntityActionEvent, inject } from '@journeyapps/reactor-mod';
import { TodoModel } from '../models/TodoModel';
import { TodoEntities } from '../TodoEntities';
import { TodoStore } from '../stores/TodoStore';
import { TodoNoteModel } from '../models/TodoNoteModel';

export class AddTodoNoteAction extends EntityAction<TodoModel> {
  static ID = 'ADD_TODO_NOTE';

  @inject(TodoStore)
  accessor todoStore: TodoStore;

  constructor() {
    super({
      id: AddTodoNoteAction.ID,
      name: 'Add note',
      tags: ['todo', 'note', 'create'],
      icon: 'sticky-note',
      target: TodoEntities.TODO_ITEM,
      category: {
        grouping: 'notes'
      }
    });
  }

  async fireEvent(event: EntityActionEvent<TodoModel>): Promise<any> {
    const result = await this.dialogStore.showInputDialog({
      title: `Add note to ${event.targetEntity.name}`,
      initialValue: 'New note'
    });
    const noteText = result?.trim();
    if (!noteText) {
      return false;
    }
    this.todoStore.addNote(event.targetEntity, new TodoNoteModel(noteText));
  }
}
