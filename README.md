# DinoRPG

# Prérequis

Il est nécessaire d'avoir docker et docker compose d'installés pour faire tourner l'environnement de dev.
* [Docker](https://docs.docker.com/get-docker/) v24.0.7
  * _(Windows)_ pendant l'installation, suivre la procédure pour WSL2

Docker doit être utilisable en temps qu'utilisateur non root sans sudo.
Le fichier config_development.toml doit vous être fournis par les dev.

# Installation (Linux)


Pour déployer l'environnement de dev, suivez les étapes suivantes :

Cloner le projet
```bash
$ git clone git@gitlab.com:eternal-twin/dinorpg/dinorpg.git
```
Checkout sur develop:
```bash
$ git checkout develop
```

Installer `make` si ce n'est pas déjà fait:
```bash
$ sudo apt install make
```

Builder les containers:
```bash
$ make install
```

Lancer les containers
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


# Installation (Windows)


Pour déployer l'environnement de dev, suivez les étapes suivantes :

- Cloner le projet
```bash
$ git clone git@gitlab.com:eternal-twin/dinorpg/dinorpg.git
```
- Checkout sur develop:
```bash
$ git checkout develop
```
- Installer les dépendances :
```bash
$ yarn install
```
- Créer deux bases de données sur votre serveur postgresql, une pour drpg et une pour etwin
- Configurer dans `./Eternaltwin` le fichier `etwin.toml`
- Configurer dans `./ed-be` le fichier `config_development.toml`
- Configurer dans `./ed-be` le fichier `.env` en suivant le schema suivant:
```
DATABASE_URL="postgresql://<user>:<user-password>@localhost:5432/<database-name>?schema=public"
```
- Aller dans le dossier `./Eternaltwin` et lancer la commande `yarn install`
- Revenir à la racine du projet et lancer la commande `yarn dev:windows`

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
un commit. Dans ce cas, utilisez les commandes suivantes :
```bash
make docker-start
make update-front
```

Si la commande `make update-front` échoue ou donne une erreur, alors utilisez
les commandes suivantes :
```bash
make docker-start
docker exec -it drpg bash
#yarn install
```

# Native

Note: The native section will eventually be removed

La partie "Native" contient le code Rust. Cette partie doit être compilée
lorsque les dockers ont été lancés. Une fois lancés (avec `make docker-bash`
par exemple), utiliser `make re-build` pour compiler et faire prendre en
compte les changements du côté Node.
`make re-build-debug` est aussi disponible pour compiler la partie native
sans optimisation.

Autrement, il est possible de compiler la partie native directement:
- Lancer les dockers -si c'est utilisé (i.e hors prod)- avec `make docker-start`
- Lancer le bash dans le docker `drpg` avec `make bash`
- Aller dans `native` avec `cd native`
- 2 options de compilation:
  - Un binaire directement utilisable (notamment pour debugger sans passer
  par Node):
  ```
  cargo build --bin main
  ```
  - La librairie utilisée par Node avec Neon:
  ```
  cargo build --message-format=json-render-diagnostics
  ```
  - L'option `--release` peut être ajoutée pour activer les optimisations.

Pour utiliser le binaire ensuite, c'est comme un binaire classique:
```
./target/<release|debug>/main
```

Le niveau des logs peut être changé en définissant la variable d'environnement
`RUST_LOG`. Par exemple pour activer les logs INFO et en dessous (TRACE et
DEBUG):
```
RUST_LOG=INFO ./target/<release|debug>/main
```

## Clippy

Cargo donne déjà de bon conseils pour garder du code propre.
[Clippy](https://github.com/rust-lang/rust-clippy) en met encore une couche et
donnera encore d'autres bons conseils. Il s'utilise simplement avec :
```
cargo clippy
```

# Tips

## Faire tourner les tests unitaires
Pour faire tourner les tests unitaires, exécutez juste la commande : `make run-test`

## Changement de branche
Si vous switchez d'une branche à une autre, pensez à faire un `make bash-front`
puis `./reset.sh` afin de mettre à jour les dépendances yarn

## Clean-up
Il est possible de supprimer tout les containers liés à dinorpg avec les commandes :
```bash
$ make remove-drpg (supprimera uniquement les container utilisés de dinorpg)
ou
$ docker container prune (supprimera tout les container existant sur le poste /!\)
```

## Comptes
Il n'est pas nécessaire de recréer un compte ET à chaque fois. Tant que le container drpg_database n'est pas wipe, l'environnement est persistant.
