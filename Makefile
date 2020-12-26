server:
	npm -C server run build

client:
	npm -C client run build

image: server client
	docker build -t wmanth/git-repo-browser .

clean:
	rm -rf server/dist
	rm -rf client/build

.PHONY: server client clean
