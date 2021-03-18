DOCKER_IMAGE ?= wmanth/repo-browser

all:
	npm -C server run build
	npm -C client run build

image:
	docker build -t "$(DOCKER_IMAGE)" .

clean:
	rm -rf server/dist
	rm -rf client/build

cleanAll: clean
	rm -rf node_modules
	rm -rf server/node_modules
	rm -rf client/node_modules

.PHONY: server client image clean cleanAll
