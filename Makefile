publish:
	npm run prepublishOnly
	npm publish --dry-run
prepublishOnly:
	make build
	npm run prepublishOnly
build:
	rm -rf dist
	rm -rf /home/danylo/page/*
	npm run build
test:
	npx eslint .
	npm test
test-watch:
	npx jest --watch
test-covegare:
	npx jest --coverage
lint:
	npx eslint .
