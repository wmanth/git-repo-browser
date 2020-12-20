FROM node:current-alpine

WORKDIR /srv

COPY package.json package-lock.json /srv/
COPY dist /srv/dist

RUN apk update && \
    apk upgrade && \
    apk add git libgit2-dev krb5-dev && \
    apk add python tzdata pkgconfig build-base && \
    BUILD_ONLY=true npm install --only=production

RUN apk del python tzdata pkgconfig build-base && \
    rm -rf /tmp/* /var/cache/apk/*

VOLUME /repos

# create default empty repo inventory
RUN echo "{}" > /repos/repos.json

ENV REPO_HOME=/repos
CMD node .
