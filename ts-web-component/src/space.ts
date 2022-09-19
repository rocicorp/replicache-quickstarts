export async function spaceExists(spaceID: string): Promise<any> {
  return await fetchJSON('spaceExists', spaceID);
}

export async function createSpace(spaceID?: string): Promise<any> {
  return await fetchJSON('createSpace', spaceID);
}

async function fetchJSON(apiName: string, spaceID: string | undefined) {
  const res = await fetch(`/api/replicache/${apiName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body:
      spaceID &&
      JSON.stringify({
        spaceID,
      }),
  });
  return await res.json();
}
