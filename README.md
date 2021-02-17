# Git Repository Browser

## Overview

The Git Repository Browser is a viewer that lets you explore the structure and the entire history of your repositories.

## Details

It consists of two components:

1. Express based [server](server) component
2. React based [client](client) component

## Docker Setup

### Build image

```
$ make image [DOCKER_IMAGE_NAME=<image_name>]
```

### Run image

```
$ docker run --rm -v <repo_home>:/repos -p 8080:8080 <image_name>
```
