![Replicache logo](https://uploads-ssl.webflow.com/623a2f46e064937599256c2d/6269e72c61073c3d561a5015_Lockup%20v2.svg)

# replicache-quickstarts

This repository contains quickstarts and sample code for [Replicache](https://replicache.dev/). There are multiple option to run various frontend framework with a common express server backend. The backend utilizes the [replicache-express](https://github.com/rocicorp/replicache-express) library which implements the `push`, `pull`, `poke`, `createSpace`, and `spaceExists` handlers required for Replicache sync protocol. This library intends to help developers easily experiment with various frontend frameworks integrated with Replicache.

## 1. Setup

#### Get your Replicache License Key

```bash
$ npx replicache get-license
```

#### Set your `VITE_REPLICACHE_LICENSE_KEY` environment variable

```bash
$ export VITE_REPLICACHE_LICENSE_KEY="<your license key>"
```

#### Install and Build

```bash
$ npm install; npm run build;
```

## 2. Start the `replicache-express` server backend

```bash
$ npm run dev:server
```

## 3. Decide on a framework and start frontend

#### [react](/react)

```bash
$ npm run dev:react
```

Provides an example integrating replicache with react in a simple todo application.

#### [ts-web-component](/ts-web-component)

Provides an example integrating replicache with vanilla typescript in a simple todo application. This library utilizes W3C standard web-components. It does not have any requirements to run any external library frameworks.

```bash
$ npm run dev:ts-web-component
```

## Production mode

The server can serve the output of the various frameworks and be run as a static server to simulate a production environment.

```bash
$ npm run prod:<front end framework>
```

## Deploying to Render

A render blueprint example is provided to deploy the application.

```bash
$ cp render.yaml.example render.yaml
```

Open the YAML file and modify the following lines to the appropriate framework

```
name: replicache-examples-<framework>-todo # change e.g. (replicache-examples-react-todo)
startCommand: "npm run prod:<framework>" # change e.g. (npm run prod:react)
```

Commit the changes and follow the direction on [Deploying to Render](https://doc.replicache.dev/deploy-render)

## Upcoming Frameworks

- React Native
- Svelte
- SolidJS
- Vue
