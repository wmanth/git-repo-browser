FROM node:current-alpine

WORKDIR /srv

# copy runtime resources into workdir
COPY server/package.json server/package-lock.json ./
COPY server/dist ./dist
COPY client/build ./dist/public

# install build environemnt and build nodegit
RUN apk update && \
    apk upgrade && \
    apk add git libgit2-dev krb5-dev && \
    apk add python tzdata pkgconfig build-base && \
    BUILD_ONLY=true npm install --only=production

# remove build environment
RUN apk del python tzdata pkgconfig build-base && \
    rm -rf /tmp/* /var/cache/apk/*

# setup the volume hosting the repositories
VOLUME /repos

# start the server
ENV REPO_HOME=/repos
CMD node .
