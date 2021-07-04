
docker-start: docker-stop
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up -d --no-recreate

docker-watch:
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up --no-recreate

docker-stop:
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml stop

bash-front:
	docker exec -it drpg_front bash

bash-DB:
	docker exec -it drpg_database bash

reset-dependencies: install-front install-eternal-twin

build:
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml build
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml up --no-start

install: build install-database
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml run -u node drpg_front yarn install
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml run -u node drpg_back yarn install
	docker-compose -f docker/docker-compose.yml -f docker/docker-compose.dev.yml run -u node drpg_eternal_twin yarn install

remove-all: #Warning, it will remove EVERY container, images, volumes and network not only edrpg ones
	docker system prune --volumes -a

install-eternal-twin: reset-eternal-twin-database
	docker start drpg_eternal_twin
	docker exec -i -unode drpg_eternal_twin yarn install

install-front:
	docker start drpg_front &&\
	docker exec -i -unode drpg_front yarn install &&\
	docker exec -i -unode drpg_front ./reset.sh

reset-eternal-twin-database:
	docker start drpg_database &&\
	cat docker/EternalTwin/drop.sql | docker exec -i drpg_database psql --username postgres eternal_twin &&\
	cat docker/EternalTwin/dump_12-01-2021_20_33_41.sql | docker exec -i drpg_database psql --username postgres eternal_twin

install-database:
	docker start drpg_database 
	sleep 3s
	cat docker/EternalTwin/drop.sql | docker exec -i drpg_database psql --username postgres eternal_twin 
	sleep 1s
	cat docker/EternalTwin/dump_12-01-2021_20_33_41.sql | docker exec -i drpg_database psql --username postgres eternal_twin
	sleep 1s
	cat docker/Database/20210630.sql | docker exec -i drpg_database psql --username postgres eternaldinodb

remove-drpg: docker-stop
	docker rm drpg_back
	docker rm drpg_database
	docker rm drpg_eternal_twin
	docker rm drpg_front