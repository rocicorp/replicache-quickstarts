# Migrating to Reflect Server 0.19.x

In order to update to Reflect Server version `0.19.x` from a prior version, you need to make changes.

## What is happening

Reflect Server `0.19.x` adds support for GDPR controls: the capability to pin storage of a room's data within the EU, and the capability to delete all data for a given room. In order to support these controls, Reflect Server must keep a new kind of record for each room. These new room records are required for _all rooms_, including new rooms not pinned to the EU as well as pre-existing rooms created prior to `0.19.x`.

In order to use `0.19.x` you need to make two changes:

1. Creation of a new room must happen explicitly by calling [createRoom](server-api.md#create-room) from your server before having clients connect to it. Previously, rooms were created implicitly when a client `connect`ed to a non-existent room. You can call the new [Get room status endpoint](server-api.md#get-room-status) to check if a room exists before calling `createRoom`. A client attempting to connect to a room not created with `createRoom` either explicitly or via migration (see below) will result in an error.
2. Perform a one-time migration of rooms created prior to `0.19.x` so that they have the required room records. Reflect Server previously did not keep a list of extant rooms, so we cannot migrate the rooms automatically. For each `roomID` that you have, you will need to invoke the [Migrate room endpoint](server-api.md#migrate-room).
   - Note: you can skip this step if you are OK with effectively abandoning all your pre-existing rooms.

## Why this is happening

Every room has a unique Cloudflare `objectID` that identifies it. Previously, Reflect Server derived this id from the `roomID` passed in `connect`. However, that mechanism of id derivation does not support pinning the underlying room data into the EU. In order to pin data in the EU, we need to derive Cloudflare `objectID`s using a different mechanism that is not based on `roomID`. This decoupling of the underlying `objectID` from the `roomID` means that Reflect Server needs to keep a mapping from `roomID` to `objectID`. Reflect Server cannot automatically create this mapping for old rooms because Reflect Server has not until now kept a record of what `roomID`s are in use. (This is admittedly an oversight on our end, apologies.)

The new room record introduced in `0.19.x` keeps the `roomID => objectID` mapping, as well as additional bits that are required for GDPR, such as the room status (e.g., if its data have been deleted.)

## Suggested migration strategy

1. Ensure that you're providing an [Auth API Token](server-api.md#authentication) to Reflect Server and that this shared secret is available in your application server to pass in the `createRoom` HTTP request.
1. Prepare a new version of your app server such that it calls [createRoom](server-api.md#create-room) to explicitly create a room before it is used. You can use [Get room status](server-api.md#get-room-status) as a non-transactional check on room existence prior to the call if you wish.
2. Prepare a mechanism (e.g., a script, or an endpoint in your server) that enumerates your `roomID`s and invokes [Migrate room](server-api.md#migrate-room) for each `roomID`. You can optionally check that a record was properly migrated using the [Get room status](server-api.md#get-room-status) call and verifying that it has status `"open"`.
3. Update Reflect Server to `0.19.x`, build, and push the new version (`wrangler publish`).
4. Deploy the new version of your server.
5. Invoke the migration mechanism prepared three steps above.

Steps 4-6 should be done in succession. The behavior of clients in the time between deploying the new Reflect Server version and the migration completing is that a client won't be able to connect to an unmigrated room. Once a room is migrated, the client will automatically reconnect.

## To support GDPR

- Pass `jurisdiction = "eu"` in the [createRoom](server-api.md#create-room) request body. This pins the room's data to the EU.
- In order to delete a room:
  1. Call [Close room](server-api.md#close-room) to prevent users from connecting to the room.
  2. Call [invalidateForRoom](server-api.md#invalidate-for-room) to log all users out of the room.
  3. Call [Delete room](server-api.md#delete-room) to delete the room's data.

## Contact

If you have questions, please reach out to me as `phritz` on discord or by email at [phritz@roci.dev](mailto:phritz@roci.dev). I can be available to ride along with the migration run in realtime if that would be helpful (I'm in GMT-10 but flexible schedule-wise).
