import { ActionStore, EntityAction, EntityActionEvent, ioc } from '@journeyapps/reactor-mod';
import { TodoModel } from '../models/TodoModel';
import { TodoEntities } from '../TodoEntities';

export class SetCurrentTodoItemAction extends EntityAction<TodoModel> {
  static ID = 'SET_CURRENT_TODO';

  constructor() {
    super({
      id: SetCurrentTodoItemAction.ID,
      name: 'Select item',
      tags: ['todo', 'selection', 'navigation'],
      icon: 'check-square',
      target: TodoEntities.TODO_ITEM,
      category: {
        grouping: 'open'
      }
    });
  }

  async fireEvent(event: EntityActionEvent<TodoModel>): Promise<any> {
    event.targetEntity.makeActive();
  }

  static get() {
    return ioc.get(ActionStore).getActionByID<SetCurrentTodoItemAction>(SetCurrentTodoItemAction.ID);
  }
}
