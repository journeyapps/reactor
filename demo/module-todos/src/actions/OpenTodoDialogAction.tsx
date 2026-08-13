import * as React from 'react';
import {
  DialogStore2,
  EntityAction,
  EntityActionEvent,
  InlineDialogDirective,
  inject,
  TableWidget,
  styled
} from '@journeyapps/reactor-mod';
import { TodoModel } from '../models/TodoModel';
import { TodoEntities } from '../TodoEntities';

export class OpenTodoDialogAction extends EntityAction<TodoModel> {
  static ID = 'OPEN_TODO_DIALOG';

  @inject(DialogStore2)
  accessor dialogStore2: DialogStore2;

  constructor() {
    super({
      id: OpenTodoDialogAction.ID,
      name: 'View item',
      tags: ['todo', 'details', 'navigation'],
      icon: 'table',
      target: TodoEntities.TODO_ITEM,
      category: {
        grouping: 'open'
      }
    });
  }

  async fireEvent(event: EntityActionEvent<TodoModel>): Promise<any> {
    const todo = event.targetEntity;
    await this.dialogStore2.showDialog(
      new InlineDialogDirective({
        title: todo.name,
        markdown: 'Todo details',
        generateContent: () => {
          return (
            <S.TableContainer>
              <TableWidget
                columns={[
                  {
                    key: 'label',
                    display: 'Property',
                    shrink: true
                  },
                  {
                    key: 'value',
                    display: 'Value'
                  }
                ]}
                rows={[
                  {
                    key: 'children',
                    cells: {
                      label: 'Children',
                      value: todo.children.length
                    }
                  },
                  {
                    key: 'notes',
                    cells: {
                      label: 'Notes',
                      value: todo.notes.length
                    }
                  },
                  {
                    key: 'tags',
                    cells: {
                      label: 'Tags',
                      value: todo.tags.length ? todo.tags.join(', ') : 'None'
                    }
                  }
                ]}
              />
            </S.TableContainer>
          );
        }
      })
    );
  }
}

namespace S {
  export const TableContainer = styled.div`
    min-width: 280px;
  `;
}
