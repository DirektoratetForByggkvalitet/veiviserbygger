Wizard builder for Losen
===

A [https://github.com/Direktoratetforbyggkvalitet/losen](losen) compliant wizard builder. It uses [Firebase Firestore](https://firebase.google.com/docs/firestore) as its backend, allowing users to interact with the database, and a custom backend to serve the schemas and wizard assets.

## 👷‍♀️ Developing
> If you're starting the project for the first time there are a few thing you'll need to set up:
>
> 1. A working node runtime. [`Volta ⚡️`](https://volta.sh/) is recommended for a hassle free dev life if you're juggling more than a single project
> 2. [Java JDK](https://jdk.java.net/) version 11 or higher installed. This is needed for the [Firebase Local Emulator Suite](https://firebase.google.com/docs/emulator-suite).

```sh
$ npm i
$ npm run dev
```

## Environment variables
Depending on what you're trying to do, you'll want to either provide env vars to connect to your local firebase emulator (this is the default that is set up in the `.env.development`) or connect to a real firebase instance hosted by Google.

### With an emulator (in dev)
- `PUBLIC_FIREBASE_EMULATOR_AUTH_HOST` - Hostname, protocol and port to auth emulator. For example: `http://localhost:9099`
- `PUBLIC_FIREBASE_EMULATOR_FIRESTORE_HOST` - Host name for firestore emulator. Just host, not port or protocol. Example: `localhost`
- `PUBLIC_FIREBASE_EMULATOR_FIRESTORE_PORT` - Port number for firestore emulator. Example: `8080`

### Firebase hosted by Google
- `GOOGLE_APPLICATION_CREDENTIALS` Base64 encoded service account JSON for accessing firebase from the backend
- `PUBLIC_FIREBASE_API_KEY` - Firebase API key
- `PUBLIC_FIREBASE_APP_ID` – Firebase app ID
- `PUBLIC_FIREBASE_AUTH_DOMAIN` - Firebase auth domain
- `PUBLIC_FIREBASE_PROJECT_ID` - Firebase project id
- `PUBLIC_FIREBASE_STORAGE_BUCKET` - Firebase storage bucket
- `PUBLIC_FIREBASE_MESSAGING_SENDER_ID` - Firebase messaging sender ID

## Building and running with docker
The applications can be built and bundled with docker by doing `npm run build:docker` or `docker build .` if you prefer that. In short it will

1. build the frontend and api
2. build an image that contains a node runtime and a nginx server
3. configure the nginx server to serve the frontend and serve the api through a proxy on `/api`

After building the image you will, when starting the app, need to map port `80` to something on your host machine and provide the necessary [environment variables](#environment-variables).

You would typically start the container by doing something along the lines of:

```sh
docker run -p 8181:80 -e PUBLIC_FIREBASE_API_KEY=... -e PUBLIC_FIREBASE_APP_ID=abc123 imageName
```

## Building for production
Docker images for the wizard builder is [automatically built](https://github.com/behalf-no/veiviserbygger/actions/workflows/ci.yml) on every push to the main branch and pushed to [Dockerhub](https://hub.docker.com/r/kbrabrand/losen-veiviserbygger).

> Later, when we push them to someplace public you can pull the image from dockerhub like every other image.

## Running in production
Pull the docker image `dibk/losen-builder`, bind the desired host port to container port `80` and pass env vars as specified under [environment variables](#firebase-hosted-by-google). An example

```sh
docker run -p3333:80 -e PUBLIC_FIREBASE_API_KEY=... -e PUBLIC_FIREBASE_APP_ID=abc123 kbrabrand/losen-veiviserbygger
```

## Setting up OIDC login
While managing users through the authentication page in the Firebase console is possible, it is often not the most practical solution for larger orgs. If you have an identity provider in you organization that supports OIDC you can manage users with access to the wizard builder from your own identity provider.

Steps:
1. Create an OIDC client in your IDP
2. Go to the Firebase console > Autentication > Sign-in method and click «Add new provider»
3. Click OpenID Connect and click to enable OpenID Connect at the top
4. Enter a name; the client id, issuer url and client secret for your OIDC client
5. Make a note of the Provider ID (below the name field) – you'll need this later
6. After clicking next you will get a callback url that you need to add to the list of allowed redirect URLs for your OIDC client (in your IDP)

> Now that the provider has been set up you need to set an environment variable in order for the auth parts of the application to know about the OIDC provider, and what name to show to the user (Log in through My Org Name).
>
> Add:
> - `PUBLIC_FIREBASE_AUTH_OIDC_PROVIDER_ID=oidc....`
> - `PUBLIC_FIREBASE_AUTH_OIDC_PROVIDER_NAME="My Org Name"`

After restarting your container/application the option of logging in using the OIDC provider should appear and the users you allow should be able to log in.
