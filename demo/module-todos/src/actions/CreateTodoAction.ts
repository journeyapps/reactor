import { Action, ActionEvent, ActionStore, inject, ioc } from '@journeyapps/reactor-mod';
import { TodoModel } from '../models/TodoModel';
import { TodoStore } from '../stores/TodoStore';

export class CreateTodoAction extends Action {
  @inject(TodoStore)
  accessor todoStore: TodoStore;

  static ID = 'CREATE_TODO';

  constructor() {
    super({
      id: CreateTodoAction.ID,
      name: 'Create todo item',
      tags: ['todo', 'create'],
      icon: 'plus'
    });
  }

  async fireEvent(event: ActionEvent): Promise<any> {
    // show a loader
    event.getStatus().pushMessage('Creating a todo');
    let result = await this.dialogStore.showInputDialog({
      title: 'Create todo'
    });
    if (!result) {
      return false;
    }

    this.todoStore.addTodo(new TodoModel({ name: result }));
  }

  static get() {
    return ioc.get(ActionStore).getActionByID<CreateTodoAction>(CreateTodoAction.ID);
  }
}
