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

.PHONY: server client clean
