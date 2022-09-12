type Receiver = (spaceID: string, onPoke: OnPoke) => Cancel;
type OnPoke = () => Promise<void>;
type Cancel = () => void;

// Returns a function that can be used to listen for pokes from the backend.
// This sample supports two different ways to do it.
export function getPokeReceiver(): Receiver {
  return sseReceiver;
}

// Implements a Replicache poke using Server-Sent Events.
// See: backend/poke/sse.ts.
function sseReceiver(spaceID: string, onPoke: OnPoke): Cancel {
  const ev = new EventSource(`/api/replicache/poke-sse?spaceID=${spaceID}`, {
    withCredentials: true,
  });
  ev.onmessage = async (event) => {
    if (event.data === "poke") {
      await onPoke();
    }
  };
  const close = () => {
    ev.close();
  };
  // See https://bugzilla.mozilla.org/show_bug.cgi?id=833462
  window.addEventListener("beforeunload", close);
  return () => {
    close();
    window.removeEventListener("beforeunload", close);
  };
}
