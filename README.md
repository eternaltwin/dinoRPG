# DinoRPG

# Prérequis

Il est nécessaire d'avoir node en version 18 minimum ainsi qu'une DB en postgres à disposition.
*Un container Docker est mis à disposition.*

# Installation


Pour déployer l'environnement de dev, suivez les étapes suivantes :

Cloner le projet
```bash
$ git clone git@gitlab.com:eternal-twin/dinorpg/dinorpg.git
```
Checkout sur staging:
```bash
$ git checkout staging
```
Copier les fichiers de configuration locale
```bash
$ cp ./ed-be/.env.sample ./ed-be/.env
$ cp ./Eternaltwin/eternaltwin.local.example ./Eternaltwin/eternaltwin.local.toml
```
Puis modifier les à votre guise afin qu'ils correspondent à votre configuration locale

Installer les dépendances du projet
```bash
$ yarn install
```

*Optionnellement, il est possible d'importer une DB avec un extract de la beta afin d'avoir des données de jeu.*
```bash
$ pg_restore -U <username> -h <host> -p <port> -d <databasename> -c default.dump
```


Synchroniser les schéma des DB
```bash
$ yarn etwin
$ yarn db:sync:dev
```

Lancer le projet
```bash
$ yarn dev:windows
```

Une fois le lancement terminé vous devriez pouvoir accéder à :
  - DinoRPG_Front : http://localhost:8080
  - Eternal Twin local : http://localhost:50320

# Erreurs possibles
En cas d'erreurs, il est recommendé de lancer chaque partie indépendemment des autres pour mieux diagnostiquer les problèmes.
- Pour lancer Eternal Twin seul: `yarn etwin:run`
- Pour lancer le backend seul: `yarn start:back`
- Pour lancer le frontend seul: `yarn start:front`

## Dépendances Yarn
Si des erreurs de composants sont remotées. Essayer de ré-installer avec `yarn clean` puis `yarn install`.

## Erreur d'authentification
Si vous voyez l'erreur suivante:
```
[back] Error: getaddrinfo EAI_AGAIN drpg_eternal_twin
```
Alors il faut changer `eternalTwinServerUri` dans `ed-be/config_development.toml` pour `http://localhost:50320/'`.

## Base de données

Si vous avez l'erreur suivante concernant `drpg_database` :
```bash
Error response from daemon: driver failed programming external connectivity on
endpoint drpg_database [...] bind: address already in use
```
Alors arrêter le service postgresql avec la commande suivante :
```bash
service postgresql stop
```

# Tips

## Comptes
Il n'est pas nécessaire de recréer un compte ET à chaque fois. Tant que les DB ne sont pas wipe, l'environnement est persistant.

Eternaltwin créé par défaut 10 compte (alice, bob, etc) avec pour mot de passe la première lettre du prénom 10 fois. Les information sont visualisable dans eternaltwin.local.toml
