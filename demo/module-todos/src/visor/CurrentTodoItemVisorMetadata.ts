import { ActionSource, inject, VisorMetadata } from '@journeyapps/reactor-mod';
import { TodoStore } from '../stores/TodoStore';
import { SetCurrentTodoItemAction } from '../actions/SetCurrentTodoItemAction';
import { autorun } from 'mobx';

export class CurrentTodoItemVisorMetadata extends VisorMetadata {
  @inject(TodoStore)
  accessor todoStore: TodoStore;

  constructor() {
    super({
      key: 'CURRENT_ITEM',
      displayName: 'Current todo',
      displayDefault: true
    });
  }

  init() {
    autorun(() => {
      this.reportValue({
        value: this.todoStore.activeTodo?.name,
        onClick: (event) => {
          SetCurrentTodoItemAction.get().fireAction({
            source: ActionSource.VISOR,
            position: event,
            targetEntity: null
          });
        }
      });
    });
  }
}
