# krokapi

REST API for krokodiliada.ru contests system.

## Installation

### Environment

This software requires the following dependencies to be installed prior to running:

- [Node](https://nodejs.org/en/)
- [npm](https://www.npmjs.com/get-npm)
- [MongoDB](https://docs.mongodb.com/manual/installation/#mongodb-community-edition-installation-tutorials)

When installed, make sure that all packages are running correctly.

```
$ node -v

v14.13.0
```

```
$ npm -v

6.14.8
```

```
$ mongod --version

db version v4.0.3
git version: 7ea530946fa7880364d88c8d8b6026bbc9ffa48c
allocator: system
modules: none
build environment:
    distarch: x86_64
    target_arch: x86_64
```

### Dependencies

Once environment is set up, simply run the following command to install software dependencies.

```
$ npm install --production
```

This will install TypeScript, ExpressJS and other software required for the server to operate correctly.

## Running the server

### MongoDB

Before running the server itself, make sure to run the database service first. For example, on OSX/Linux - based systems that would be the following command:

```
$ mongod
```

### KrokAPI

```
npm run prod
```

This will run the API server and will enable it at the address http://localhost:8080

## [Optional] Development

To be able to contribute to this API, for example when a bug was found, a developer would need to go through a few simple steps:

### Install dev dependencies

```
$ npm isntall
```

This will install both, production and development dependencies.

### Run API in development mode

```
$ npm run dev
```

### Testing

For testing, [Jest](https://jestjs.io/) is used.

All tests are located in the `tests/` folder in the root of the repository.

This command will locate and run all `*.test.ts` files under that folder:

```
$ npm t
```
