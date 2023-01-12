docker-start: docker-stop
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --no-recreate

docker-watch:
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up --no-recreate

docker-stop:
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml stop

bash:
	docker exec -it drpg bash

bash-DB:
	docker exec -it drpg_database bash

build:
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml build
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up --no-start

re-build:
	docker exec -it drpg yarn build

re-build-debug:
	docker exec -it drpg yarn build-debug

install: build
	cp ./Eternaltwin/etwin.toml.example ./Eternaltwin/etwin.toml
	cp ./ed-be/config_development.toml.example ./ed-be/config_development.toml
	docker start drpg_database
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml run -u node drpg yarn install
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml run -u node drpg_eternal_twin yarn install
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml run -u node drpg_eternal_twin yarn etwin db upgrade
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml run -u node drpg yarn build:native
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml run -u node drpg yarn migration
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --no-recreate

reset-eternal-twin-database:
	docker start drpg_database &&\
	cat docker/EternalTwin/drop.sql | docker exec -i drpg_database psql --username postgres eternal_twin &&\
	cat docker/EternalTwin/dump_12-01-2021_20_33_41.sql | docker exec -i drpg_database psql --username postgres eternal_twin

remove-drpg: docker-stop
	docker rm drpg
	docker rm drpg_database
	docker rm drpg_eternal_twin

run-test: 
	docker exec -i -unode drpg yarn run test:ci

run-coverage:
	docker exec -i -unode drpg yarn run coverage

update:
	docker exec -i -unode drpg yarn install

test-lint-front:
	docker exec -i -unode drpg yarn lint:test

fix-lint-front:
	docker exec -it drpg yarn lint:fix

update-schema:
	docker start drpg_database &&\
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml run -u node drpg yarn migration
