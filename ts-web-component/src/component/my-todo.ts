import type { TodoItemElement } from "../types";
import { listTodos, TodoUpdate, Todo } from "../../../shared/todo";
import { nanoid } from "nanoid";

import type { Replicache } from "replicache";
import type { M } from "../../../shared/mutators";
import { setupReplicache } from "../setup-replicache";

const templateTodo = document.createElement("template");
templateTodo.innerHTML = `
<header class="header">
   <h1>Todos WC</h1>
   <input id="new-todo" class="new-todo" type="text" placeholder="What needs to be done?">
</header>
<section class="main">
   <span><input class="toggle-all" type="checkbox"><label></label></span>
   <ul class="todo-list" id="list-container"></ul>
</section>
<footer class="footer">
   <span class="todo-count">
   <strong><span id="itemCount"></span></strong> items left</span>
   <ul class="filters">
      <li>
         <a id="all" class="" style="cursor: pointer;">All</a>
      </li>
      <li>
         <a id="active" class="" style="cursor: pointer;">Active</a>
      </li>
      <li>
         <a id="completed" class="" style="cursor: pointer;">Completed</a>
      </li>
   </ul>
</footer>
`;

export default class MyTodo extends HTMLElement {
  listContainer: Element | null | undefined;
  newTodoInput: HTMLInputElement | null | undefined;
  itemCount: Element | null | undefined;
  filter: NodeListOf<Element> | null | undefined;
  private _list: Todo[];
  private _filteredList: Todo[];
  private _filter: string;
  private r!: Replicache<M>;

  handleNewItem = (text: string) =>
    this.r.mutate.createTodo({
      id: nanoid(),
      text,
      completed: false,
    });

  handleUpdateTodo = (e: CustomEvent<TodoUpdate>) => {
    const update = e.detail;
    this.r.mutate.updateTodo(update);
  };

  handleDeleteTodos = (e: CustomEvent<string>) => {
    for (const id of [e.detail]) {
      this.r.mutate.deleteTodo(id);
    }
  };

  filteredTodos = (filter: string) =>
    this._list.filter((todo) => {
      if (filter === "all") {
        return true;
      }
      if (filter === "active") {
        return !todo.completed;
      }
      if (filter === "completed") {
        return todo.completed;
      }
      throw new Error("Unknown filter: " + this._filter);
    });

  handleFilterClick = (e: Event) => {
    const $target = e.target as Element;
    this._filter = $target.id;
    this._filteredList = this.filteredTodos(this._filter);
    this._render();
  };

  constructor() {
    super();
    this._filter = "all";
    this._list = [];
    this._filteredList = [];
  }

  async connectedCallback() {
    this.r = await setupReplicache();
    this.r.subscribe(listTodos, {
      onData: (data) => {
        this._list = data;
        this._list.sort((a: Todo, b: Todo) => a.sort - b.sort);
        this._filteredList = this.filteredTodos(this._filter);
        this._render();
      },
    });
    this.appendChild(templateTodo.content.cloneNode(true));
    this.newTodoInput = this.querySelector(
      "#new-todo"
    ) as HTMLInputElement | null;
    this.listContainer = this.querySelector("#list-container");
    this.itemCount = this.querySelector("#itemCount");
    this.filter = this.querySelectorAll(".filters a");
    this.newTodoInput!.addEventListener("keyup", (e: KeyboardEvent) => {
      if (e.key === "Enter" && this.newTodoInput!.value) {
        this.handleNewItem(this.newTodoInput!.value);
        this.newTodoInput!.value = "";
      }
    });

    if (this.filter.length) {
      this.filter.forEach((filter) => {
        filter.addEventListener("click", this.handleFilterClick.bind(this));
      });
    }
  }

  disconnectedCallback() {}

  _render() {
    if (!this.listContainer) return;
    this.itemCount!.innerHTML = `${this._list.length}`;
    this.listContainer.innerHTML = "";
    this._filteredList.forEach((item: Todo) => {
      let $item: TodoItemElement = document.createElement(
        "todo-item"
      ) as TodoItemElement;
      $item.setAttribute("text", item.text);
      $item.setAttribute("checked", item.completed.toString());
      $item.todoID = item.id;
      $item.addEventListener("onRemove", this.handleDeleteTodos.bind(this));
      $item.addEventListener("onToggle", this.handleUpdateTodo.bind(this));
      this.listContainer?.appendChild($item);
    });

    this.filter?.forEach((filter) => {
      if (filter.id === this._filter) {
        filter.classList.add("selected");
      } else {
        filter.classList.remove("selected");
      }
    });
  }
}
