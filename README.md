Wizard builder for Losen
===

A [https://github.com/Direktoratetforbyggkvalitet/losen](losen) compliant wizard builder. It uses [Firebase Firestore](https://firebase.google.com/docs/firestore) as its backend, allowing users to interact with the database, and a custom backend to serve the schemas and wizard assets.

## 👷‍♀️ Developing
> If you're starting the project for the first time there are a few thing you'll need to set up:
>
> 1. A working node runtime. [`Volta ⚡️`](https://volta.sh/) is recommended for a hassle free dev life if you're juggling more than a single project

```sh
$ npm i
$ npm run dev
```

## Environment variables
Depending on what you're trying to do, you'll want to either provide env vars to connect to your local firebase emulator (this is the default that is set up in the `.env.development`) or connect to a real firebase instance hosted by Google.

### With an emulator
- `FIREBASE_EMULATOR_AUTH_HOST` - Hostname, protocol and port to auth emulator. For example: `http://localhost:9099`
- `FIREBASE_EMULATOR_FIRESTORE_HOST` - Host name for firestore emulator. Just host, not port or protocol. Example: `localhost`
- `FIREBASE_EMULATOR_FIRESTORE_PORT` - Port number for firestore emulator. Example: `8080`

### Firebase hosted by Google
- `FIREBASE_API_KEY` - Firebase API key
- `FIREBASE_APP_ID` – Firebase app ID
- `FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `FIREBASE_PROJECT_ID` - Firebase project id
- `FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID

## Building and running with docker
The applications can be built and bundled with docker by doing `npm run docker` or `docker build -f docker/Dockerfile .` if you prefer that. In short it will

1. build the frontend and api
2. build an image that contains a node runtime and a nginx server
3. configure the nginx server to serve the frontend and serve the api through a proxy on `/api`

After building the image you will, when starting the app, need to map port `80` to something on your host machine and provide the necessary [environment variables](#environment-variables).

You would typically start the container by doing something along the lines of:

```sh
docker run -p 8181:80 -e FIREBASE_API_KEY=... -e FIREBASE_APP_ID=abc123 imageName
```

## ⛴️ Deploying the wizard builder
