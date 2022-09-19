import {getPokeReceiver} from './poke';
import {createSpace, spaceExists} from './space';
import {mutators} from '../../shared/mutators';
import {Replicache} from 'replicache';
import type {M} from '../../shared/mutators';
import {assert} from './assert';

export async function setupReplicache(): Promise<Replicache<M>> {
  const {pathname} = window.location;
  const paths = pathname.split('/');
  let listId =
    paths.indexOf('listId') > -1 ? paths[paths.indexOf('listId') + 1] : '';

  if (listId) {
    const data = await spaceExists(listId);
    if (data.spaceExists === false) {
      const spaceRes = await createSpace(listId);
      listId = spaceRes.spaceID;
    }
  }

  if (!listId) {
    const spaceRes = await createSpace();
    listId = spaceRes.spaceID;
    window.location.href = '/listId/' + listId;
  }

  // See https://doc.replicache.dev/licensing for how to get a license key.
  const licenseKey = import.meta.env.VITE_REPLICACHE_LICENSE_KEY;
  assert(licenseKey, 'Missing VITE_REPLICACHE_LICENSE_KEY');

  const r = new Replicache<M>({
    licenseKey,
    pushURL: `/api/replicache/push?spaceID=${listId}`,
    pullURL: `/api/replicache/pull?spaceID=${listId}`,
    name: listId,
    mutators,
  });

  const pokeReceiver = getPokeReceiver();
  pokeReceiver(listId, async () => {
    r.pull();
  });

  return r;
}
