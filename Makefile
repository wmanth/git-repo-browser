DOCKER_IMAGE ?= wmanth/repo-browser

all: server client vscode

node_modules:
	npm ci

common: node_modules
	npm --workspace common run build

client: common
	npm --workspace client run build

server: common
	npm --workspace server run build

vscode: common
	cd vscode && npx vsce package --yarn

image:
	docker build -t "$(DOCKER_IMAGE)" .

clean:
	rm -rf common/dist
	rm -rf server/dist
	rm -rf client/build
	rm -rf vscode/dist

cleanAll: clean
	rm -rf node_modules

.PHONY: common server client vscode image clean cleanAll
