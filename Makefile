publish:
	npm run prepublishOnly
	npm publish --dry-run
prepublishOnly:
	npm run prepublishOnly
build:
	rm -rf dist
	npm run build
test:
	npm test
test-watch:
	npx jest --watch
test-covegare:
	npx jest --coverage
lint:
	npx eslint .
