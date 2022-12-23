import "./index.css";
import { mutators } from "./mutators";
import { Reflect } from "@rocicorp/reflect";
import { nanoid } from "nanoid";

const userID = nanoid();
const roomID: string | undefined = import.meta.env.VITE_ROOM_ID;
if (roomID === undefined || roomID === "") {
  throw new Error("VITE_ROOM_ID required");
}
const socketOrigin =
  import.meta.env.VITE_WORKER_URL ??
  "wss://reflect-todo.replicache.workers.dev";

const r = new Reflect({
  socketOrigin,
  userID,
  roomID,
  auth: userID,
  mutators,
});

async function foo() {
  await r.mutate.createTodo({
    text: "remember the milk",
    completed: false,
    id: nanoid(),
  });
  await r.mutate.init();
  r.subscribe(async (tx) => await tx.scan().toArray(), {
    onData: (data) => {
      console.log(data);
    },
  });
}

void foo();
