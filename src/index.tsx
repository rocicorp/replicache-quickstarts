import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app";
import { mutators } from "./mutators";
import {
  consoleLogSink,
  DatadogClientLogSink,
  Reflect,
} from "@rocicorp/reflect";
import { nanoid } from "nanoid";

const userID = nanoid();
const roomID: string | undefined = import.meta.env.VITE_ROOM_ID;
if (roomID === undefined || roomID === "") {
  throw new Error("VITE_ROOM_ID required");
}
const socketOrigin =
  import.meta.env.VITE_WORKER_URL ??
  "wss://reflect-todo.replicache.workers.dev";

const logSinks = [consoleLogSink];
if (import.meta.env.VITE_DATADOG_CLIENT_TOKEN) {
  logSinks.push(
    new DatadogClientLogSink({
      clientToken: import.meta.env.VITE_DATADOG_CLIENT_TOKEN,
      service: "replidraw-do",
    })
  );
}

const r = new Reflect({
  socketOrigin,
  userID,
  roomID,
  auth: userID,
  mutators,
  logSinks,
});

// Workaround for https://github.com/rocicorp/reflect-server/issues/146.
// We don't receive initial data until first mutation after connection.
void r.mutate.init();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App reflect={r} />
  </React.StrictMode>
);
