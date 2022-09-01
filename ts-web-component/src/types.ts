export type TodoItemElement = HTMLInputElement & {
  todoID: string;
  addEventListener: (event: string, callback: (e: CustomEvent) => void) => void;
};
