export async function spaceExists(spaceID: string): Promise<boolean> {
  const res = await fetch("/api/replicache/spaceExists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      spaceID,
    }),
  });
  if (res.status !== 200) {
    throw new Error(`Unexpected response from server: ${res.status}`);
  }
  const jsonResponse = await res.json();
  return jsonResponse.spaceExists;
}

export async function createSpace(spaceID?: string): Promise<string> {
  const res = await fetch("/api/replicache/createSpace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: spaceID
      ? JSON.stringify({
          spaceID,
        })
      : null,
  });
  if (res.status !== 200) {
    throw new Error(`Unexpected response from server: ${res.status}`);
  }
  const jsonResponse = await res.json();
  return jsonResponse.spaceID;
}
