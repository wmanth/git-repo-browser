# Building the server

```
$ cd server
$ npm build
```

# Use Docker

## Build image

```
$ docker build -t wmanth/node-git-server .
```

## Run image

```
$ docker run --rm -v <PATH>:/repos -p 8080:8080 wmanth/node-git-server
```
