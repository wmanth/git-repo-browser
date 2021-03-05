DOCKER_IMAGE ?= wmanth/git-repo-browser

server:
	@echo "Building server..."
	npm -C server run build

client:
	@echo "Building client..."
	npm -C client run build

image: server client
	@echo "Building docker image..."
	docker build -t "$(DOCKER_IMAGE)" .

clean:
	rm -rf server/dist
	rm -rf client/build

cleanAll: clean
	rm -rf node_modules
	rm -rf server/node_modules
	rm -rf client/node_modules

.PHONY: server client clean
