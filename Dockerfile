# create the builder image
FROM node:current-alpine AS builder

WORKDIR /build

# copy build sources into workdir
ADD package*.json .
ADD server server
ADD client client

# install build environment and build nodegit
RUN apk update && \
    apk upgrade && \
    apk add git libgit2-dev krb5-dev && \
    apk add python tzdata pkgconfig build-base

# initialize the node environment
RUN npm install

# install prod server dependencies and build the native nodegit library
RUN BUILD_ONLY=true npm -C server install --only=production

# remove obsolete resources to save space in the runtime image
RUN rm -rf server/node_modules/nodegit/vendor
RUN rm -rf server/node_modules/nodegit/build/Release/obj.target

# build the server and client components
RUN npm -C server run build
RUN npm -C client run build

# create the runtime image
FROM node:current-alpine AS runtime

RUN apk update && \
    apk upgrade && \
    apk add krb5

WORKDIR /server

# copy server resources from the builder image
COPY --from=builder /build/server/package.json .
COPY --from=builder /build/server/dist dist
COPY --from=builder /build/server/node_modules node_modules

# setup the volume hosting the repositories
VOLUME /repos

# start the server
ENV REPO_HOME=/repos
CMD node .
