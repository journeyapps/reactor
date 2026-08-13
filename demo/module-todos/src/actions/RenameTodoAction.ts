import { EntityAction, EntityActionEvent } from '@journeyapps/reactor-mod';
import { TodoModel } from '../models/TodoModel';
import { TodoEntities } from '../TodoEntities';

export class RenameTodoAction extends EntityAction<TodoModel> {
  static ID = 'RENAME_TODO';

  constructor() {
    super({
      id: RenameTodoAction.ID,
      name: 'Rename todo',
      tags: ['todo', 'edit'],
      icon: 'pencil',
      target: TodoEntities.TODO_ITEM,
      category: {
        grouping: 'edit'
      }
    });
  }

  async fireEvent(event: EntityActionEvent<TodoModel>): Promise<any> {
    const result = await this.dialogStore.showInputDialog({
      title: 'Rename todo',
      initialValue: event.targetEntity.name
    });

    const nextName = result?.trim();
    if (!nextName) {
      return false;
    }

    event.targetEntity.name = nextName;
  }
}
