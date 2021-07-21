# create the builder image
FROM node:16.3.0-alpine3.13 AS server-builder

WORKDIR /builder

# copy build sources into workdir
ADD package*.json ./
ADD common ./common/
ADD server ./server/

# install build environment and build nodegit
RUN apk update && \
    apk upgrade && \
    apk add openssl-dev krb5-dev && \
    apk add python3 tzdata pkgconfig build-base

# initialize the node environment
RUN npm ci --workspace=common --workspace=server

# build the server component
RUN npm run build --workspace=common --workspace=server

# remove obsolete resources to save space in the runtime image
RUN npm prune --workspace=server --production
RUN rm -rf node_modules/nodegit/vendor
RUN rm -rf node_modules/nodegit/build/Release/obj.target

# pack the necessary artefacts for the server component
RUN npm pack --workspace=server
RUN tar czf node_modules.tgz --dereference node_modules

# --------------------------------------------------------------------------- #

FROM node:16.3.0-alpine3.13 AS client-builder

WORKDIR /builder

# copy build sources into workdir
ADD package*.json ./
ADD common ./common/
ADD client ./client/

# initialize the node environment
RUN npm ci --workspace=common --workspace=client

# build the client component
RUN npm run build --workspace=common --workspace=client

# --------------------------------------------------------------------------- #

# create the runtime image
FROM node:16.3.0-alpine3.13 AS server

RUN apk update && \
    apk upgrade && \
    apk add krb5

WORKDIR /server

# copy server resources from the server builder image
COPY --from=server-builder /builder/node_modules.tgz /tmp/
RUN tar xzf /tmp/node_modules.tgz && rm /tmp/node_modules.tgz

COPY --from=server-builder /builder/wmanth-git-repo-server-1.0.0.tgz /tmp/
RUN tar xzf /tmp/wmanth-git-repo-server-1.0.0.tgz && rm /tmp/wmanth-git-repo-server-1.0.0.tgz

# copy server resources from the client builder image
COPY --from=client-builder /builder/client/build ./public/

# setup the volume hosting the repositories
VOLUME /repos

# start the server
ENV REPO_HOME=/repos
CMD node package
