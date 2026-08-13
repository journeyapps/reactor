import {
  DescendantLoadingEntityProviderComponent,
  EntityActionHandlerComponent,
  EntityCardsPresenterComponent,
  EntityDefinition,
  EntityDescriberComponent,
  EntityDocsComponent,
  EntityPanelComponent,
  inject,
  InlineEntityEncoderComponent,
  InlineTreePresenterComponent,
  MetadataDisplayMode,
  SimpleEntitySearchEngineComponent,
  TagDisplayMode
} from '@journeyapps/reactor-mod';
import { TodoEntities } from '../TodoEntities';
import { TodoStore } from '../stores/TodoStore';
import { TodoModel } from '../models/TodoModel';
import { CreateTodoAction } from '../actions/CreateTodoAction';
import { AddSubTodoAction } from '../actions/AddSubTodoAction';
import { RenameTodoAction } from '../actions/RenameTodoAction';
import { DuplicateTodoAction } from '../actions/DuplicateTodoAction';
import { TodoNoteModel } from '../models/TodoNoteModel';
import { AddTodoNoteAction } from '../actions/AddTodoNoteAction';
import { OpenTodoDialogAction } from '../actions/OpenTodoDialogAction';
import { SetCurrentTodoItemAction } from '../actions/SetCurrentTodoItemAction';

const TODO_TREE_GROUPING_SETTINGS = {
  complexName: true,
  tags: true,
  labels: ['Sub-todos', 'Notes']
};

const TODO_TREE_DESCRIPTION_SETTINGS = {
  tagDisplayMode: TagDisplayMode.PILL,
  metadataDisplayOptions: {
    _default: { mode: MetadataDisplayMode.PILL }
  }
};

const TODO_TREE_BADGE_DESCRIPTION_SETTINGS = {
  tagDisplayMode: TagDisplayMode.BADGE,
  metadataDisplayOptions: {
    _default: { mode: MetadataDisplayMode.BADGE }
  }
};

export class TodoDefinition extends EntityDefinition<TodoModel> {
  @inject(TodoStore)
  accessor todoStore: TodoStore;

  constructor() {
    super({
      type: TodoEntities.TODO_ITEM,
      category: 'Demo Items',
      label: 'Todo Item',
      icon: 'cube',
      iconColor: 'cyan'
    });

    // describe todos using the simple name (this is what is used in the tree presenter)
    this.registerComponent(
      new EntityDescriberComponent<TodoModel>({
        label: 'Simple',
        describe: (entity: TodoModel) => {
          let activeTask = this.todoStore.activeTodo === entity;

          return {
            simpleName: entity.name,
            iconColor: activeTask ? 'rgb(192,255,0)' : null,
            complexName: activeTask ? 'Active task' : null,
            tags: entity.tags,
            labels: [
              {
                label: 'Sub-todos',
                value: `${entity.children.length}`,
                icon: {
                  name: 'sitemap',
                  color: '#67c7ff'
                }
              },
              {
                label: 'Notes',
                value: `${entity.notes.length}`,
                icon: {
                  name: 'sticky-note',
                  color: '#ffb454'
                }
              }
            ]
          };
        }
      })
    );
    this.registerComponent(
      new EntityDescriberComponent<TodoModel>({
        label: 'Detailed',
        describe: (entity: TodoModel) => {
          return {
            simpleName: entity.name,
            complexName:
              `${entity.children.length} child todo${entity.children.length === 1 ? '' : 's'} · ` +
              `${entity.notes.length} note${entity.notes.length === 1 ? '' : 's'}`,
            tags: entity.tags,
            labels: [
              {
                label: 'Depth',
                value: `${this.getTodoDepth(entity)}`,
                icon: {
                  name: 'sitemap',
                  color: '#67c7ff'
                }
              }
            ]
          };
        }
      })
    );
    this.registerComponent(
      new EntityDocsComponent<TodoModel>({
        label: 'Todo API',
        getDocLink: () => 'https://react.dev/reference/react/useState'
      })
    );
    this.registerComponent(
      new EntityDocsComponent<TodoModel>({
        label: 'Reactor entity docs',
        getDocLink: () => 'https://github.com/journeyapps'
      })
    );

    // provide todos to action parameter resolvers
    this.registerComponent(
      new SimpleEntitySearchEngineComponent<TodoModel>({
        label: 'Simple',
        getEntities: async () => {
          return this.todoStore.todos;
        }
      })
    );

    // allow the todos to be represented as tree items
    this.registerComponent(
      new InlineTreePresenterComponent<TodoModel>({
        label: 'Tree: uncached',
        allowedGroupingSettings: TODO_TREE_GROUPING_SETTINGS,
        ...TODO_TREE_DESCRIPTION_SETTINGS,
        augmentTreeNodeProps: () => {
          return {
            openOnSingleClick: false
          };
        }
      })
    );
    this.registerComponent(
      new InlineTreePresenterComponent<TodoModel>({
        label: 'Tree: cached',
        cacheTreeEntities: true,
        allowedGroupingSettings: TODO_TREE_GROUPING_SETTINGS,
        ...TODO_TREE_DESCRIPTION_SETTINGS,
        augmentTreeNodeProps: () => {
          return {
            openOnSingleClick: false
          };
        }
      })
    );
    this.registerComponent(
      new InlineTreePresenterComponent<TodoModel>({
        label: 'Tree: badges',
        allowedGroupingSettings: TODO_TREE_GROUPING_SETTINGS,
        ...TODO_TREE_BADGE_DESCRIPTION_SETTINGS,
        augmentTreeNodeProps: () => {
          return {
            openOnSingleClick: false
          };
        }
      })
    );
    this.registerComponent(
      new InlineTreePresenterComponent<TodoModel>({
        label: 'Tree: lazy uncached',
        loadChildrenAsNodesAreOpened: true,
        allowedGroupingSettings: TODO_TREE_GROUPING_SETTINGS,
        ...TODO_TREE_DESCRIPTION_SETTINGS,
        augmentTreeNodeProps: () => {
          return {
            openOnSingleClick: false
          };
        }
      })
    );
    this.registerComponent(
      new InlineTreePresenterComponent<TodoModel>({
        label: 'Tree: lazy cached',
        loadChildrenAsNodesAreOpened: true,
        cacheTreeEntities: true,
        allowedGroupingSettings: TODO_TREE_GROUPING_SETTINGS,
        ...TODO_TREE_DESCRIPTION_SETTINGS,
        augmentTreeNodeProps: () => {
          return {
            openOnSingleClick: false
          };
        }
      })
    );
    this.registerComponent(new EntityCardsPresenterComponent<TodoModel>());

    this.registerComponent(
      new InlineEntityEncoderComponent<TodoModel, { id: string }>({
        version: 1,
        encode: (entity) => {
          return { id: entity.id };
        },
        decode: async (encoded) => {
          return this.todoStore.todos.find((todo) => todo.id === encoded.id) || null;
        }
      })
    );

    // allow todos to expose nested sub todos to tree/card renderers
    this.registerComponent(
      new DescendantLoadingEntityProviderComponent<TodoModel, TodoModel>({
        descendantType: TodoEntities.TODO_ITEM,
        generateOptions: (todo) => {
          return {
            descendants: todo.children,
            refreshDescendants: () => {
              return null;
            }
          };
        }
      })
    );
    this.registerComponent(
      new DescendantLoadingEntityProviderComponent<TodoModel, TodoNoteModel>({
        descendantType: TodoEntities.TODO_NOTE,
        generateOptions: (todo) => {
          return {
            descendants: todo.notes,
            category: {
              label: 'Notes'
            },
            refreshDescendants: () => {
              return todo.loadNotes(this.todoStore.simulateLoadNotesError);
            }
          };
        }
      })
    );

    // by default let reactor set up a todos panel and use the tree presenter above
    this.registerComponent(
      new EntityPanelComponent<TodoModel>({
        label: 'Todos!',
        getEntities: () => {
          return this.todoStore.rootTodos;
        },
        additionalActions: [
          // add the create action as an additional right click item on the panel
          CreateTodoAction.ID,
          AddSubTodoAction.ID
        ]
      })
    );

    this.registerComponent(new EntityActionHandlerComponent(SetCurrentTodoItemAction.ID));
    this.registerComponent(new EntityActionHandlerComponent(OpenTodoDialogAction.ID));
    this.registerAdditionalAction(AddTodoNoteAction.ID);
    this.registerAdditionalAction(RenameTodoAction.ID);
    this.registerAdditionalAction(DuplicateTodoAction.ID);
  }

  protected getTodoDepth(todo: TodoModel): number {
    let depth = 0;
    let current = todo.parent;
    while (current) {
      depth++;
      current = current.parent;
    }
    return depth;
  }

  matchEntity(t: any): boolean {
    if (t instanceof TodoModel) {
      return true;
    }
  }

  getEntityUID(t: TodoModel) {
    return t.id;
  }
}
