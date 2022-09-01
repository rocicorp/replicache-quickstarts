import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./app";
import { mutators } from "../../shared/mutators";
import { Replicache } from "replicache";
import { getPokeReceiver } from "./poke";
import { createSpace, spaceExists } from "./space";

const { pathname } = window.location;
const paths = pathname.split("/");
let spaceIDUrlParam =
  paths.indexOf("listID") > -1 ? paths[paths.indexOf("listID") + 1] : "";
let spaceID = "";
if (spaceIDUrlParam) {
  spaceID = (await spaceExists(spaceIDUrlParam))
    ? spaceIDUrlParam
    : await createSpace(spaceIDUrlParam);
} else {
  spaceID = await createSpace();
}

if (spaceIDUrlParam !== spaceID) {
  window.location.href = "/listID/" + spaceID;
}

const r = new Replicache({
  // See https://doc.replicache.dev/licensing for how to get a license key.
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  licenseKey: import.meta.env.VITE_REPLICACHE_LICENSE_KEY!,
  pushURL: `/api/replicache/push?spaceID=${spaceID}`,
  pullURL: `/api/replicache/pull?spaceID=${spaceID}`,
  name: spaceID,
  mutators,
});

const pokeReceiver = getPokeReceiver();
pokeReceiver(spaceID, async () => {
  await r.pull();
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App rep={r} />
  </React.StrictMode>
);
