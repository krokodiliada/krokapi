# krokAPI &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/krokodiliada/krokapi/blob/main/LICENSE) [![CircleCI](https://img.shields.io/circleci/build/github/krokodiliada/krokapi?label=circleci&token=c4f3b82c175aa905dabca2ab27bd5cc06a35cc8f)](https://circleci.com/gh/krokodiliada/krokapi) [![codecov](https://codecov.io/gh/krokodiliada/krokapi/branch/main/graph/badge.svg?token=KWZ8263SC8)](https://codecov.io/gh/krokodiliada/krokapi)

REST API for [krokodiliada.ru](https://krokodiliada.ru) contests system.

## Installation

### Environment

This software requires the following dependencies to be installed prior to running:

- [Node](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/get-npm)
- [MongoDB](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials)

When installed, make sure that all packages are running correctly.

```bash
$ node -v

'v14.13.0'
```

```bash
$ npm -v

'6.14.8'
```

```bash
$ mongod --version

'
db version v4.0.3
git version: 7ea530946fa7880364d88c8d8b6026bbc9ffa48c
allocator: system
modules: none
build environment:
    distarch: x86_64
    target_arch: x86_64
'
```

### Dependencies

Once environment is set up, simply run the following command to install software dependencies.

```bash
$ npm install --production
```

This will install TypeScript, ExpressJS and other software required for the server to operate correctly.

## Running the server

### MongoDB

Before running the server itself, make sure to run the database service first.

For example, on OSX/Linux - based systems that would be the following command:

```bash
$ mongod
```

### krokAPI

Before running krokAPI, we need to make sure that the environment variable `MONGO_URL` points to our local mongodb process. There are multiple ways of setting it up, one of which is creating a .env file in the project root with the following string:

```bash
# .env
MONGO_URL=mongodb://127.0.0.1:27017
```

Now we can run the application

```bash
$ npm run prod
```

This will spin the API server and will enable it at the address http://localhost:8080

### Running in Docker

To be able to run the service in docker, we still need to specify

```bash
$ docker build -t krok/api .

$ docker run -p 8080:8080 -e MONGO_URL='mongodb://host.docker.internal:27017' krok/api:latest
```

## [Optional] Development

To be able to contribute to this API, for example when a bug was found, a developer would need to go through a few simple steps:

### Install dev dependencies

```bash
$ npm isntall
```

This will install both, production and development dependencies.

### Run API in development mode

```bash
$ npm run dev
```

### Testing

For testing, [Jest](https://jestjs.io/) is used.

All tests are located in the `tests/` folder in the root of the repository.

This command will locate and run all `*.test.ts` files under that folder:

```bash
$ npm t
```
