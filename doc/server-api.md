# Reflect Server API

This doc captures the set of service management APIs that Reflect Server provides. These APIs are called by your server or you yourself (e.g., via scripting). This doc does not describe the reflect client API called by the your app.

## Reflect Server is beta software

These APIs might change at any time.

## Authentication

Reflect Server expects a service management auth token to be provided via the `REFLECT_AUTH_API_KEY` env var. This token authorizes privileged administrative operations. It is a shared secret between your server and Reflect Server, and must not be shared with end users (via app source code, reflect client, or any other means). If the env var is not set (is undefined), these APIs are disabled.

Configure the env var via `wrangler`:

```
npx wrangler secret put REFLECT_AUTH_API_KEY
```

and then pass it in the HTTP request to the API.

**Each of the following calls requires the auth api key to be passed via the custom `x-reflect-auth-api-key` HTTP header.** Failure to pass the correct key results in a `401` (Unauthorized).

## Room Management API

### Create room

Starting in `0.19.0`, a room must be _created_ before users can connect to it. (Previously, room creation was implicit in `connect`.)

- Method & path: `POST /createRoom`
- Request body:
  - `roomID`: string representing the unique id of room to create; must match `[a-zA-Z0-9_-]+`
  - `jurisdiction`: optional string equal to `'eu'` if room data must be kept in the EU. Do not set this field unless you are sure you need it, as it restricts underlying storage options.
- Noteworthy responses:
  - `200` indicating the room has been created
  - `409` (Conflict) indicates the room already exists
- Example

  ```
  ==> POST /createRoom HTTP/1.0
      x-reflect-auth-api-key: ...

      { "roomID": "unj3Ap" }

  <== HTTP/1.0 200 OK
  ```

- Curl:

  ```
  curl -X POST '<URL>/createRoom' \
    -H 'x-reflect-auth-api-key: <API KEY>' \
    -H 'Content-type: application/json' \
    -d '{ "roomID": "<ROOM ID>" }'
  ```

### Get room status

- Method & path: `GET /api/room/v0/room/:roomID/status`
- URL path parameters:
  - `roomID`: id of the room to return the status of, eg `unj3Ap`
- Noteworthy responses:
  - `200` with JSON body containing a `status` field that is one of:
    - `"open"`: the room is accepting connections from users.
    - `"closed"`: the room is not accepting connections from users.
    - `"deleted"`: the room is not accepting connections from users _and_ all its content has been deleted.
    - `"unknown"`: no room exists with the given `roomID`
- Example

  ```
  ==> GET /api/room/v0/room/unj3Ap/status HTTP/1.0
      x-reflect-auth-api-key: ...

  <== HTTP/1.0 200 OK

      { "status": "open" }
  ```

- Curl:

  ```
  curl -X GET '<URL>/api/room/v0/room/<ROOM ID>/status' \
    -H 'x-reflect-auth-api-key: <API KEY>'
  ```

### Close room

A room is _closed_ if it should no longer accept connections from users. A closed room is never re-opened and its `roomID` can never be re-used. Closing a room does not delete its data. Closing a room only prevents users from `connect`ing to the room, it does not log out users who may currently be connected. A call to close the room should likely be followed by a call to the the `auth` API's `invalidateForRoom`, which logs users out.

- Method & path: `POST /api/room/v0/room/:roomID/close`
- URL path parameters:
  - `roomID`: id of the room to close, eg `unj3Ap`
- Noteworthy responses:
  - `200` if room has been successfully closed
  - `409` (Conflict) if the room does not have status `"open"`
- Example

  ```
  ==> POST /api/room/v0/room/unj3Ap/close HTTP/1.0
      x-reflect-auth-api-key: ...

  <== HTTP/1.0 200 OK
  ```

- Curl:
  ```
  curl -X POST '<URL>/api/room/v0/room/<ROOM ID>/close' \
    -H 'x-reflect-auth-api-key: <API KEY>'
  ```

### Delete room

A room is _deleted_ if it no longer accepts connections from users and all its data has been deleted. This condition is permanent. The `roomID` will not be re-usable. In order to be deleted, a room it must first be _closed_. It should also have had its users logged out via `auth`'s `invalidateForRoom`.

- Method & path: `POST /api/room/v0/room/:roomID/delete`
- URL path parameters:
  - `roomID`: id of the room to delete, eg `unj3Ap`
- Noteworthy responses:
  - `200` if room has been successfully deleted
  - `409` (Conflict) if the room does not have status `"closed"`
- Example

  ```
  ==> POST /api/room/v0/room/unj3Ap/delete HTTP/1.0
      x-reflect-auth-api-key: ...

  <== HTTP/1.0 200 OK
  ```

- Curl:
  ```
  curl -X POST '<URL>/api/room/v0/room/<ROOM ID>/delete' \
    -H 'x-reflect-auth-api-key: <API KEY>'
  ```

### Migrate room

You only need to use this call in order to migrate rooms created in versions prior to `0.19.0`. Rooms created via `createRoom` in `0.19.0` do not need to be migrated.

Reflect Server version `0.19.0` keeps a record for each room, eg holding its status (open, closed, etc). Versions prior to `0.19.0` do not keep these records, and roomIDs used prior to `0.19.0` are not enumerable by Reflect Server, so you must call this API once for each `roomID` in order to migrate your rooms to be compatible with `0.19.0`.

You can verify that a room was successfully migrated by getting the room status after migration; it should be `"open"`.

This operation is idempotent.

- Method & path: `POST /api/room/v0/room/:roomID/migrate/1`
- URL path parameters:
  - `roomID`: id of the room to migrate, eg `unj3Ap`
- Noteworthy responses:
  - `200` if room has been successfully migrated
  - `400` (Bad request) with message `Invalid roomID...` if the `roomID` doesn't match `[a-zA-Z0-9_-]+`
- Example

  ```
  ==> POST /api/room/v0/room/unj3Ap/migrate/1 HTTP/1.0
      x-reflect-auth-api-key: ...

  <== HTTP/1.0 200 OK
  ```

- Curl:

  ```
  curl -X POST '<URL>/api/room/v0/room/<ROOM ID>/migrate/1' \
    -H 'x-reflect-auth-api-key: <API KEY>'
  ```

### Forget room

Note: You likely do not need this call unless you are developing Reflect Server or manually experimenting with migration.

Removes the room record for the given room. Without a room record, users will not be able to connect to the room in `0.19.0`. A room record can be created by calling the Migrate room API endpoint.

- Method & path: `POST /api/room/v0/room/:roomID/DANGER/forget"`
- URL path parameters:
  - `roomID`: id of the room to "forget" (delete the room record of)
- Noteworthy responses:
  - `200` indicating the room has been forgotten
  - `404` there is no record of the room with given id
- Example

  ```
  ==> POST /api/room/v0/room/unj3Ap/DANGER/forget HTTP/1.0
      x-reflect-auth-api-key: ...

  <== HTTP/1.0 200 OK
  ```

- Curl:

  ```
  curl -X POST '<URL>/api/room/v0/room/<ROOM ID>/DANGER/forget' \
    -H 'x-reflect-auth-api-key: <API KEY>'
  ```

### Get room records

Returns the set of all room records Reflect Server knows about.

- Method & path: `GET /api/room/v0/rooms`
- Response body
  - `[{...}, ...]` an array of internal-to-Reflect-Server room records, one per room, that Reflect Server knows about
- Example

  ```
  ==> GET /api/room/v0/rooms HTTP/1.0
      x-reflect-auth-api-key: ...

  <== HTTP/1.0 200 OK

    [{ "status": "open",
       "roomID": "ubj3Ap",
       "objectIDString": "...",
       "jurisdiction": "",
       ... },
     ...]
  ```

- Curl:

  ```
  curl -X GET '<URL>/api/room/v0/rooms' \
    -H 'x-reflect-auth-api-key: <API KEY>'
  ```

## Auth API

These APIs have not changed in `0.19.0`.

### <a name="invalidateForUser"></a>Invalidate for user

Invalidates all of a user's sessions. Affected active clients will immediately try to re-connect and auth.

- Method and path: `POST /api/auth/v0/invalidateForUser`
- Request body:
  - `userID`: string indicating the user to log out eg `user42`
- Example

  ```
  ==> POST /api/auth/v0/invalidateForUser HTTP/1.0
      x-reflect-auth-api-key: ...

      { "userID": "user42" }

  <== HTTP/1.0 200 OK
  ```

### <a name="invalidateForRoom"></a>Invalidate for room

Invalidates all user sessions in a room. Affected active clients will immediately try to re-connect and auth.

- Method & path: `POST /api/auth/v0/invalidateForRoom`
- Request body:
  - `roomID`: string indicating the room to log all users out of eg `unj3Ap`
- Example

  ```
  ==> POST /api/auth/v0/invalidateForRoom HTTP/1.0
      x-reflect-auth-api-key: ...

      { "roomID": "unj3Ap" }

  <== HTTP/1.0 200 OK
  ```

### <a name="invalidateAll"></a>Invalidate all

Invalidates all user sessions in all rooms. Affected active clients will immediately try to re-connect and auth.

- Method & path: `POST /api/auth/v0/invalidateAll`
- Example

  ```
  ==> POST /api/auth/v0/invalidateAll HTTP/1.0
      x-reflect-auth-api-key: ...

      <== HTTP/1.0 200 OK
  ```

### <a name="revalidateConnections"></a>Revalidate all users in all rooms

Revalidates auth for all users. This endpoint is called periodically

- Method & path: `POST /api/auth/v0/revalidateConnections`
- Example

  ```
  ==> POST /api/auth/v0/revalidateConnections HTTP/1.0
      x-reflect-auth-api-key: ...

  <== HTTP/1.0 200 OK
  ```
