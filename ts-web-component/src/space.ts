export async function spaceExists(spaceID: string): Promise<any> {
  const res = await fetch("/api/replicache/spaceExists", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      spaceID,
    }),
  });
  return await res.json();
}

export async function createSpace(spaceID?: string): Promise<any> {
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
  return await res.json();
}
