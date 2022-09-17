import { nanoid } from "nanoid";
import { Reflect } from "@rocicorp/reflect";
import { useSubscribe } from "replicache-react";

import { M } from "./mutators";
import { listTodos, TodoUpdate } from "./todo";

import Header from "./components/header";
import MainSection from "./components/main-section";

// This is the top-level component for our app.
const App = ({ reflect }: { reflect: Reflect<M> }) => {
  // Subscribe to all todos and sort them.
  const todos = useSubscribe(reflect, listTodos, [], [reflect]);
  todos.sort((a, b) => a.sort - b.sort);

  // Define event handlers and connect them to Replicache mutators. Each
  // of these mutators runs immediately (optimistically) locally, then runs
  // again on the server-side automatically.
  const handleNewItem = (text: string) =>
    reflect.mutate.createTodo({
      id: nanoid(),
      text,
      completed: false,
    });

  const handleUpdateTodo = (update: TodoUpdate) =>
    reflect.mutate.updateTodo(update);

  const handleDeleteTodos = async (ids: string[]) => {
    for (const id of ids) {
      await reflect.mutate.deleteTodo(id);
    }
  };

  const handleCompleteTodos = async (completed: boolean, ids: string[]) => {
    for (const id of ids) {
      await reflect.mutate.updateTodo({
        id,
        completed,
      });
    }
  };

  // Render app.

  return (
    <div className="todoapp">
      <Header onNewItem={handleNewItem} />
      <MainSection
        todos={todos}
        onUpdateTodo={handleUpdateTodo}
        onDeleteTodos={handleDeleteTodos}
        onCompleteTodos={handleCompleteTodos}
      />
    </div>
  );
};

export default App;
