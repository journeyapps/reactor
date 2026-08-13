import { EntityAction, EntityActionEvent } from '@journeyapps/reactor-mod';
import { TodoModel } from '../models/TodoModel';
import { TodoEntities } from '../TodoEntities';
import { inject } from '@journeyapps/reactor-mod';
import { TodoStore } from '../stores/TodoStore';

export class AddSubTodoAction extends EntityAction<TodoModel> {
  static ID = 'ADD_SUB_TODO';

  @inject(TodoStore)
  accessor todoStore: TodoStore;

  constructor() {
    super({
      id: AddSubTodoAction.ID,
      name: 'Add sub todo',
      tags: ['todo', 'structure', 'create'],
      icon: 'plus-square',
      target: TodoEntities.TODO_ITEM,
      category: {
        grouping: 'structure'
      }
    });
  }

  async fireEvent(event: EntityActionEvent<TodoModel>): Promise<any> {
    const result = await this.dialogStore.showInputDialog({
      title: `Add sub todo to ${event.targetEntity.name}`,
      initialValue: `${event.targetEntity.name} / child`
    });

    if (!result) {
      return false;
    }

    this.todoStore.addSubTodo(event.targetEntity, new TodoModel({ name: result }));
  }
}
