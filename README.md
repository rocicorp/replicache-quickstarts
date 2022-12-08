# Todo

TodoMVC on Reflect.

## Hacking Locally

The `dev-worker` command runs the worker using [wrangler](https://developers.cloudflare.com/workers/wrangler/).

```bash
npm install

# generate a shared secret enabling Reflect Server to authenticate
# administrative calls, e.g. to create a new room. Configure
# Reflect Server with the key via wranlger:
npx wrangler secret put REFLECT_AUTH_API_KEY

# start the backend
npm run dev-worker

# pick a new, random roomID, eg:
VITE_ROOM_ID=$(head -c 10 /dev/random | md5 | head -c 6)
echo VITE_ROOM_ID=$VITE_ROOM_ID

# create the new room
curl -X POST 'http://127.0.0.1:8787/createRoom' \
  -H 'x-reflect-auth-api-key: <Auth API key chosen above>' \
  -H 'Content-type: application/json' \
  -d "{ \"roomID\": \"$VITE_ROOM_ID\" }"

# (in a separate shell) start the frontend
VITE_ROOM_ID=<value from above> \
  VITE_WORKER_URL=ws://127.0.0.1:8787 \
  npm run dev
```

If you would prefer not to re-create a room each time you run `dev-worker` you can pass it `--local --persist` and it will run the worker on your computer and save the data locally.

## Publishing Worker to Cloudflare

First, get an account at Cloudflare: https://workers.cloudflare.com/.

Then:

```bash
# generate a shared secret enabling Reflect Server to authenticate
# administrative calls, e.g. to create a new room. Configure
# Reflect Server with the key via wranlger:
npx wrangler secret put REFLECT_AUTH_API_KEY

# publish to Cloudflare
npx wrangler publish

# pick a new, random roomID, eg:
VITE_ROOM_ID=$(head -c 10 /dev/random | md5 | head -c 6)
echo VITE_ROOM_ID=$VITE_ROOM_ID

# create the new room
curl -X POST 'http://<host from publish command>/createRoom' \
  -H 'x-reflect-auth-api-key: <Auth API key chosen above>' \
  -H 'Content-type: application/json' \
  -d "{ \"roomID\": \"$VITE_ROOM_ID\" }"

# run frontend
VITE_ROOM_ID=<value from above> \
  VITE_WORKER_URL=wss://<host from publish command> \
  npm run dev
```

## Authentication and Authorization

Reflect can optionally authenticate users who connect to rooms with your server and authorize their access to the room.

1. Pass some `authToken` to the `Reflect` constructor's `auth` parameter.
2. Provide `createReflectServer` with an `authHandler` function that authenticates the user and returns whether the user should be allowed in the room.

The signature for the auth handler is as follows:

```ts
/**
 * An `AuthHandler` should validate that the user authenticated by `auth` is
 * authorized to access the room with `roomID`.
 * @return A promise which resolves to `UserData` for the user if authentication
 * and authorization is successful, or rejects if authentication or
 * authorization fail.
 */
export type AuthHandler = (auth: string, roomID: string) => Promise<UserData>;

/**
 * `UserData` must include a `userID` which is unique stable identifier
 * for the user.
 * `UserData` has a size limit of 6 KB.
 * Currently only `userID` is used, but in the future `UserData` may
 * be passed through to mutators which could use it to supplement
 * mutator args and to validate the mutation.
 */
export type UserData = ReadonlyJSONObject & { userID: string };
```

### Auth Revalidation

You can invalidate specific users or rooms using the Server Auth API, below.

## Server Auth API

The server has an HTTP API for authentication tasks.

### Auth API Key

All calls to the Auth API must provide an API Key. Configure the API Key using Wrangler:

```bash
npx wrangler secret put REFLECT_AUTH_API_KEY
```

Then pass the API Key in each request to the Auth API using the `x-reflect-auth-api-key` HTTP header:

```ts
fetch("https://myapp.workers.dev/api/auth/v0/invalidateForUser", {
  headers: {
    "x-reflect-auth-api-key": "redacted",
  },
  body: JSON.stringify({ userID: "redacted" }),
});
```

### `invalidateForUser`

Invalidates all of a user's sessions. Affected active clients will immediately try to re-connect and auth.

<table>
     <tr>
          <th align="left">Method</th>
          <td><code>POST</code></td>
     </tr>
     <tr>
          <th align="left">URL</th>
          <td><code>https://myapp.workers.dev/api/auth/v0/invalidateForUser</code></td>
     </tr>
     <tr>
          <th align="left">Headers</th>
          <td><code>x-reflect-auth-api-key: string</code></td>
     </tr>
     <tr>
          <th align="left">Body</th>
          <td><code>{ userID: string }</code></td>
     </tr>
</table>

### `invalidateForRoom`

Invalidates all user sessions in a room. Affected active clients will immediately try to re-connect and auth.

<table>
     <tr>
          <th align="left">Method</th>
          <td><code>POST<code></td>
     </tr>
     <tr>
          <th align="left">URL</th>
          <td><code>https://myapp.workers.dev/api/auth/v0/invalidateForRoom</code></td>
     </tr>
     <tr>
          <th align="left">Headers</th>
          <td><code>x-reflect-auth-api-key: string</code></td>
     </tr>
     <tr>
          <th align="left">Body</th>
          <td><code>{ roomID: string }</code></td>
     </tr>
</table>

### `invalidateAll`

Invalidates all user sessions in all rooms. Affected active clients will immediately try to re-connect and auth.

<table>
     <tr>
          <th align="left">Method</th>
          <td><code>POST<code></td>
     </tr>
     <tr>
          <th align="left">URL</th>
          <td><code>https://myapp.workers.dev/api/auth/v0/invalidateAll</code></td>
     </tr>
     <tr>
          <th align="left">Headers</th>
          <td><code>x-reflect-auth-api-key: string</code></td>
     </tr>
     <tr>
          <th align="left">Body</th>
          <td>N/A</td>
     </tr>
</table>

## Recipes

### How to persist logs from the worker

The `BaseServer` class accepts a `logger` argument. You can implement this yourself to send the logs wherever you want. `reflect-server` exports `ConsoleLogSink` and `DatadogLogSink` implementations of this interface in the package as a convenience. The default implementation is just `ConsoleLogSink` alone.

### How to list the rooms for your Reps server

Cloudflare doesn't have a UI for this, but there's an API.

First, go to https://dash.cloudflare.com/profile/api-tokens and click "Create Token" then choose the "Read All Resources" template. Click through and then copy the resulting token.

```bash
# Get the account id
curl -X GET "https://api.cloudflare.com/client/v4/accounts" \
     -H "Authorization: Bearer :token" \
     -H "Content-Type:application/json"

# Get namespace for account
curl -X GET "https://api.cloudflare.com/client/v4/accounts/:accountid/workers/durable_objects/namespaces" \
     -H "Authorization: Bearer :token" \
     -H "Content-Type:application/json"

# Get object instances
curl -X GET "https://api.cloudflare.com/client/v4/accounts/:accountid/workers/durable_objects/namespaces/:namespaceid/objects" \
     -H "Authorization: Bearer :token" \
     -H "Content-Type:application/json"
```

### How to run different code for mutation on server

You can create in `mutators.ts` a global that indicates which environment the file is running in, and then set that variable from worker/index.ts. Commit [bf7cb374b9e82b311659fcab704b65a66e0739a1](https://github.com/rocicorp/reflect-todo/commit/bf7cb374b9e82b311659fcab704b65a66e0739a1) shows an example.

### How to know when a mutator has run on the server

Using above, you can store state in the client view that tracks whether a given mutator has run on client-side or server. Commit [e488892dd69b828b1b9ab253f06a42628d25831d](https://github.com/rocicorp/reflect-todo/commit/e488892dd69b828b1b9ab253f06a42628d25831d) shows an example of this.
