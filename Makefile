SOURCE_FILES:=$(shell find src/ -type f -name '*.ts')
TEST_FILES:=$(shell find test/ -type f -name '*.ts')
DOCKER_IMAGE_NAME:=a12n-server

.PHONY:start run build test lint fix lint-fix start-dev watch inspect deploy
start: build
	node dist/app.js

run: start

build: dist/build

docker-build: build
	docker build -t $(DOCKER_IMAGE_NAME) .

docker-run:
	docker run -it --rm --name $(DOCKER_IMAGE_NAME)-01 $(DOCKER_IMAGE_NAME)

test:
	DB_DRIVER=sqlite DB_FILENAME=":memory:" npx tsx --test ${TEST_FILES}

lint:
	npx tsc --noemit
	npx eslint --quiet 'src/**/*.ts' 'test/**/*.ts'

fix:
	npx eslint --quiet 'src/**/*.ts' 'test/**/*.ts' --fix

lint-fix: fix

knex-migrate: dist/build
	cd dist; npx knex migrate:latest

knex-make-migration:
	cd src; npx knex migrate:make migration_name -x ts

start-dev:
	npx tsc-watch --onSuccess 'node --inspect=9339 dist/app.js'

watch:
	./node_modules/.bin/tsc --watch

.PHONY:clean
clean:
	rm -r node_modules dist

dist/build: $(SOURCE_FILES)
	./node_modules/.bin/tsc
	@# Touching this file so Makefile knows when it was last built.
	touch dist/build

inspect: build
	node --inspect dist/app.js

inspect-brk: build
	node --inspect-brk dist/app.js

src/db-types.js:
	./bin/generate-db-types.mjs

src/api-types.js:
	./bin/generate-api-types.mjs
 
assets/simplewebauthn-browser.min.js: node_modules/@simplewebauthn/browser/dist/bundle/index.umd.min.js
	cp node_modules/@simplewebauthn/browser/dist/bundle/index.umd.min.js assets/simplewebauthn-browser.min.js

