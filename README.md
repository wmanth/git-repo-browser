# Use Docker

## Build image

```
$ docker build -t wmanth/node-git-server
```

## Run image

```
$ docker run --rm -v <PATH>:/repo -p 8080:8080 wmanth/node-git-server
```
