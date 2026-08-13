import { ActionMacroBehavior, EntityAction, EntityActionEvent } from '@journeyapps/reactor-mod';
import { TodoModel } from '../models/TodoModel';
import { TodoEntities } from '../TodoEntities';
import { setupDeleteConfirmation } from '@journeyapps/reactor-mod';

export class DeleteTodoAction extends EntityAction<TodoModel> {
  constructor() {
    super({
      id: 'DELETE_TODO',
      name: 'Delete todo item',
      aliases: ['Remove todo item', 'Discard todo item'],
      tags: ['todo', 'cleanup'],
      behavior: ActionMacroBehavior.DELETE,
      icon: 'trash',
      target: TodoEntities.TODO_ITEM,
      category: {
        grouping: 'danger'
      }
    });
    setupDeleteConfirmation({
      action: this
    });
  }

  async fireEvent(event: EntityActionEvent<TodoModel>): Promise<any> {
    event.targetEntity.delete();
  }
}
