import type { TodoUpdate } from "../../../shared/todo";

const templateTodoItem = document.createElement("template");
templateTodoItem.innerHTML = `
<li class="item">
   <div class="view">
      <input class="toggle" type="checkbox">
      <label></label>
      <button class="destroy"></button>
   </div>
</li>
`;

export default class TodoItem extends HTMLElement {
  private _completed: boolean;
  private _text: string;
  private _todoID!: string;
  item: Element | null | undefined;
  removeButton: Element | null | undefined;
  text!: HTMLLabelElement | null;
  checkbox: HTMLInputElement | null | undefined;
  constructor() {
    super();
    this._completed = false;
    this._text = "";
  }

  connectedCallback() {
    this.appendChild(templateTodoItem.content.cloneNode(true));
    this.item = this.querySelector(".item");
    this.removeButton = this.querySelector(".destroy");
    this.text = this.querySelector("label");
    this.checkbox = this.querySelector("input");
    this.removeButton?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      this.dispatchEvent(new CustomEvent("onRemove", { detail: this._todoID }));
    });
    this.checkbox?.addEventListener("click", (e: Event) => {
      e.preventDefault();
      this.dispatchEvent(
        new CustomEvent<TodoUpdate>("onToggle", {
          detail: { id: this._todoID, completed: !this._completed },
        })
      );
    });
    this._render();
  }

  set todoID(id: string) {
    this._todoID = id;
  }

  get todoID() {
    return this._todoID;
  }

  disconnectedCallback() {}

  static get observedAttributes() {
    return ["text", "checked"];
  }

  attributeChangedCallback(_name: any, _oldValue: any, newValue: string) {
    if (_name === "text") {
      this._text = newValue;
    } else if (_name === "checked") {
      this._completed = newValue === "true";
    }
  }

  _render() {
    if (!this.item) return;
    if (this.text) {
      this.text.textContent = this._text;
    }
    if (this._completed) {
      this.item.classList.add("completed");
      this.checkbox?.setAttribute("checked", "");
    } else {
      this.item.classList.remove("completed");
      this.checkbox?.removeAttribute("checked");
    }
  }
}
