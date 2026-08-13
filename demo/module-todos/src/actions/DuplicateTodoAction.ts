import { ActionMacroBehavior, EntityAction, EntityActionEvent, inject } from '@journeyapps/reactor-mod';
import { TodoModel } from '../models/TodoModel';
import { TodoEntities } from '../TodoEntities';
import { TodoStore } from '../stores/TodoStore';

export class DuplicateTodoAction extends EntityAction<TodoModel> {
  static ID = 'DUPLICATE_TODO';

  @inject(TodoStore)
  accessor todoStore: TodoStore;

  constructor() {
    super({
      id: DuplicateTodoAction.ID,
      name: 'Duplicate todo',
      tags: ['todo', 'structure'],
      behavior: ActionMacroBehavior.COPY,
      icon: 'copy',
      target: TodoEntities.TODO_ITEM,
      category: {
        grouping: 'structure'
      }
    });
  }

  protected cloneTree(todo: TodoModel): TodoModel {
    const clone = new TodoModel({
      name: `${todo.name} (copy)`,
      tags: todo.tags
    });
    todo.children.forEach((child) => {
      clone.addChild(this.cloneTree(child));
    });
    return clone;
  }

  async fireEvent(event: EntityActionEvent<TodoModel>): Promise<any> {
    const clone = this.cloneTree(event.targetEntity);
    const parent = event.targetEntity.parent;
    if (parent) {
      this.todoStore.addSubTodo(parent, clone);
      return;
    }
    this.todoStore.addTodo(clone);
  }
}
