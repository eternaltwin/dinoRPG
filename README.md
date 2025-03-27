# DinoRPG

# Prérequis

Il est nécessaire d'avoir node en version 22 minimum ainsi qu'une DB en postgres 17.
Deux DB sont nécessaires, une pour eternaltwin et une pour dinorpg.

# Installation


Pour déployer l'environnement de dev, suivez les étapes suivantes :

## Clonage
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

## Configuration des config
Le fichier `./ed-be/.env` doit être modifié afin que la dernière ligne corresponde à votre DB dinorpg.
```text
DATABASE_URL="postgresql://user:password@localhost:5432/db_name?schema=public"
```

Le fichier `./Eternaltwin/eternaltwin.local.toml` doit être modifié afin que la section postgres permette la connexion à votre DB eternaltwin.
```toml
# Postgres database configuration
# Used by the `Postgres` stores configured in the `backend` section.
[postgres]
# Database service host
host = "localhost"
# Database service port
port = 5432
# Database name
name = "eternaltwin"
# Database user (role) for regular runtime.
user = "username"
# Password for the database user.
password = "password"
```

## Installation des dépendances
Installer les dépendances du projet
```bash
$ yarn install
```


## Mise en place des DB

Synchroniser le schémas de la DB dinorpg
```bash
$ yarn db:sync:dev
```

*Optionnellement, il est possible d'importer une DB avec un extract de la beta afin d'avoir des données de jeu.*
```bash
$ pg_restore -U <username> -h <host> -p <port> -d <databasename> -c default.dump
```

Mettre à jour le schéma de la DB eternaltwin
```bash
$ cd Eternaltwin
$ yarn eternaltwin db check
$ yarn eternaltwin db sync
```

## Terminer
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

# Tips

## Comptes
Il n'est pas nécessaire de recréer un compte ET à chaque fois. Tant que les DB ne sont pas wipe, l'environnement est persistant.

Eternaltwin créé par défaut 10 compte (alice, bob, etc) avec pour mot de passe la première lettre du prénom 10 fois. Les information sont visualisable dans eternaltwin.local.toml
