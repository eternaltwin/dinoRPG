# DinoRPG

# Avancement

Un [board](https://gitlab.com/eternal-twin/dinorpg/dinorpg/-/boards/2968003?label_name[]=not_implemented) reprenant les objectifs des milestones est disponible.

# Prérequis

Il est nécessaire d'avoir docker et docker-compose d'insntallé pour faire tourner l'environnement de dev.
* [Docker](https://docs.docker.com/get-docker/) 
  * _(Windows)_ pendant l'installation, suivre la procédure pour WSL2
* [Docker-compose](https://docs.docker.com/compose/install/) 

Docker doit être utilisable en temps qu'utilisateur non root sans sudo.
Le fichier config_dev.toml doit vous être fournis par les dev.


# Installation


Pour déployer l'environnement de dev, suivez les étapes suivantes :

Cloner le projet
```bash
$ git clone git@gitlab.com:eternal-twin/dinorpg/dinorpg.git
```
Checkout sur master:
```bash
$ git checkout master
```

Builder les containers:
```bash
$ make install
```

Lancer les container
```bash
$ make docker-start
```

En cas de problèmes, il est possible de les lancer avec la console :
```bash
$ make docker-watch
```

Une fois le lancement terminé vous devriez pouvoir accéder à :
  - DinoRPG_Front : http://localhost:8080
  - Eternal Twin local : http://localhost:50320

# Erreurs possible

## Base de données

Si vous avez l'erreur suivante concernant `drpg_database`:
```bash
Error response from daemon: driver failed programming external connectivity on
endpoint drpg_database [...] bind: address already in use
```
Alors arrêter le service postgresql avec la commande suivante:
```bash
service postgresql stop
```

## Droits
Si jamais des problèmes de droits apparaissent, vérifiez votre uid et gid :
```bash
$ id
```

Modifiez ensuite ./docker/docker-compose.dev.yml :
``` yaml
drpg:
 build:
  args:
  - UID=xxxx
  - GID=xxxx
```
Relancez une installation à zero.

## Front

Il se peut que le front ne soit pas à jour suite à l'ajout d'une dépendance par
un commit. Dans ce cas, utilisez les commands suivantes:
```bash
make docker-start
make update-front
```

Si la commande `make update-front` échoue ou donne une erreur, alors utilisez
les commands suivantes:
```bash
make docker-start
docker exec -it drpg bash
#yarn install
```

# Tips

## Faire tourner les tests unitaires
Pour faire tourner les tests unitaires, exécutez juste la commande : `make run-test`

## Changement de branche
Si vous switchez d'une branche à une autre, pensez à faire un `make bash-front`
puis `./reset.sh` afin de mettre à jour les dépendances yarn

## Clean-up
Il est possible de supprimer tout les container liés à dinorpg avec les commandes :
```bash
$ make remove-drpg (supprimera uniquement les container utilisés de dinorpg)
ou
$ docker container prune (supprimera tout les container existant sur le poste /!\)
```

## Comptes
Il n'est pas nécessaire de recréer un compte ET à chaque fois. Temps que le container drpg_database n'est pas wype, l'environnement est persistant.
