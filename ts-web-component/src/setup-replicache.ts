import {mutators} from '../../shared/mutators';
import {Replicache} from 'replicache';
import type {M} from '../../shared/mutators';
import {assert} from './assert';

export async function setupReplicache(): Promise<Replicache<M>> {
  const {pathname} = window.location;
  const paths = pathname.split('/');

  const spaceID =
    paths.indexOf('listID') > -1 ? paths[paths.indexOf('listID') + 1] : '';
  if (!spaceID || !(await spaceExists(spaceID))) {
    window.location.href = '/listID/' + (await createSpace());
  }

  // See https://doc.replicache.dev/licensing for how to get a license key.
  const licenseKey = import.meta.env.VITE_REPLICACHE_LICENSE_KEY;
  assert(licenseKey, 'Missing VITE_REPLICACHE_LICENSE_KEY');

  const r = new Replicache<M>({
    licenseKey,
    pushURL: `/api/replicache/push?spaceID=${spaceID}`,
    pullURL: `/api/replicache/pull?spaceID=${spaceID}`,
    name: spaceID,
    mutators,
  });

  // Implements a Replicache poke using Server-Sent Events.
  // If a "poke" message is received, it will pull from the server.
  const ev = new EventSource(`/api/replicache/poke-sse?spaceID=${spaceID}`, {
    withCredentials: true,
  });
  ev.onmessage = async event => {
    if (event.data === 'poke') {
      await r.pull();
    }
  };

  async function spaceExists(spaceID: string): Promise<boolean> {
    const spaceExistRes = await fetchJSON('spaceExists', spaceID);
    if (
      spaceExistRes &&
      typeof spaceExistRes === 'object' &&
      typeof spaceExistRes.spaceExists === 'boolean'
    ) {
      return spaceExistRes.spaceExists;
    }
    throw new Error('Bad response from spaceExists');
  }

  async function createSpace(spaceID?: string): Promise<string> {
    const createSpaceRes = await fetchJSON('createSpace', spaceID);
    if (
      createSpaceRes &&
      typeof createSpaceRes === 'object' &&
      typeof createSpaceRes.spaceID === 'string'
    ) {
      return createSpaceRes.spaceID;
    }
    throw new Error('Bad response from createSpace');
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

  return r;
}
