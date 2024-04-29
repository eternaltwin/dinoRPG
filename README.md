# DinoRPG

# Prérequis

Il est nécessaire d'avoir node en version 18 minimum ainsi qu'une DB en postgres à disposition.
*Un container Docker est mis à disposition.*

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
Copier les fichiers de configuration locale
```bash
$ cp ./ed-be/.env.sample ./ed-be/.env
$ cp ./ed-be/config_development.toml.sample ./ed-be/config_development.toml
$ cp ./Eternaltwin/etwin.toml.example ./Eternaltwin/etwin.toml
```
Puis modifier les à votre guise afin qu'ils correspondent à votre configuration locale

Installer les dépendances du projet
```bash
$ yarn install
```

Synchroniser les schéma des DB
```bash
$ yarn run etwin
$ yarn run db:sync:dev
```

Lancer le projet
```bash
$ yarn run dev:windows
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
NB: Si la commande ne fonctionne pas à cause d'une erreur de certificat, supprimez le yarn.lock du dossier
- Revenir à la racine du projet et lancer la commande `yarn dev:windows`

Une fois le lancement terminé vous devriez pouvoir accéder à :
  - DinoRPG_Front : http://localhost:8080
  - Eternal Twin local : http://localhost:50320

# Utilisation du container de DB

Il est possible d'utiliser un container pré-configurer avec postgres et les deux bases de données nécessaires configurées.

Pour se faire, il faut lancer le container une première fois en étant dans le répertoire `./docker`
```bash
$ docker-compose up drpg_database
```

Les fois suivantes il devrait suffire de faire
```bash
$ docker start drpg_database
```

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

# Native

*Note: The native section will eventually be removed*

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

## Comptes
Il n'est pas nécessaire de recréer un compte ET à chaque fois. Tant que les DB ne sont pas wipe, l'environnement est persistant.
