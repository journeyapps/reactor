import { TodoModel } from '../models/TodoModel';
import { computed, observable } from 'mobx';
import { TodoNoteModel } from '../models/TodoNoteModel';
import { AbstractStore } from '@journeyapps/reactor-mod';

export class TodoStore extends AbstractStore {
  @observable
  protected accessor _rootTodos: Set<TodoModel>;

  @observable
  accessor activeTodo: TodoModel;

  @observable
  accessor simulateLoadNotesError: boolean;

  constructor() {
    super({ name: 'TODO_STORE' });
    this._rootTodos = new Set<TodoModel>();
    this.activeTodo = null;
    this.simulateLoadNotesError = false;
  }

  protected bindTodo(todo: TodoModel) {
    const l1 = todo.registerListener({
      deleted: () => {
        this._rootTodos.delete(todo);
        if (this.activeTodo === todo) {
          this.activeTodo = null;
        }
        l1();
      },
      becameActive: () => {
        this.activeTodo = todo;
      },
      childAdded: ({ child }) => {
        this.bindTodo(child);
      },
      childRemoved: ({ child }) => {
        if (this.activeTodo === child) {
          this.activeTodo = null;
        }
      }
    });
    todo.children.forEach((child) => {
      this.bindTodo(child);
    });
  }

  addTodo(todo: TodoModel) {
    this.bindTodo(todo);
    this._rootTodos.add(todo);
  }

  addSubTodo(parent: TodoModel, todo: TodoModel) {
    this.bindTodo(todo);
    parent.addChild(todo);
  }

  addNote(parent: TodoModel, note: TodoNoteModel) {
    parent.addNote(note);
  }

  removeNote(note: TodoNoteModel) {
    note.parent?.removeNote(note);
  }

  @computed get rootTodos() {
    return Array.from(this._rootTodos.values());
  }

  @computed
  get todos() {
    const walk = (todo: TodoModel): TodoModel[] => {
      return [todo, ...todo.children.flatMap((child) => walk(child))];
    };
    return this.rootTodos.flatMap((todo) => walk(todo));
  }

  @computed
  get notes() {
    return this.todos.flatMap((todo) => todo.notes);
  }
}
