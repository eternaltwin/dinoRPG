# DinoRPG

# Prérequis
Les technologies principales utilisées sont:
- Node.js: v12.18.0
- npm: v6.14.4
- Postgresql: v12
- pgAdmin4
- Vue/CLI: v4.4.1

Il est préférable d'utiliser ces versions (ou des versions proches).

## Installation

### Windows

Sur Windows, seuls nodeJS, npm et PostgreSQL doivent être installés (voir ci-dessous).
Une fois ces installations effectuées, aller directement à la partie 'Mode d'emploi'

#### Node.js & npm

NodeJS et npm se téléchargent en même temps, vous pouvez les avoir à cette adresse : `https://nodejs.org/fr/download/` 
(Rappel : version 12.18.0 pour NodeJS et 6.14.4 pour npm).

#### Postsgresql

Voir `https://www.postgresql.org/download/windows/` (Rappel : version 12)
L'installation proposera de choisir un mot de passe. Il sera utilisé par le projet qui utilise par défaut `EternalDinoSQL`.
Voir la section `Mise en place de la bade de données` pour plus de détails.

### Ubuntu

Vérifier que votre environnement est à jour:
1) `sudo apt update`
2) `sudo apt upgrade`
Notez que `apt` est le successeur de `apt-get` et s'utilise de la même facon.

#### Node.js & npm

Source: `https://github.com/nodesource/distributions/blob/master/README.md`
Pour installer Node.js, utiliser les commandes:
1) `curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -`
2) `sudo apt install nodejs`
Vous pouvez vérifier les versions de Node.js et npm avec respectivement
`node --version` et `npm --version`.

#### nodemon

Nodemon s'installe avec npm via `npm install -g nodemon`.

#### Postgresql

Source: `https://www.postgresql.org/download/linux/ubuntu/`
1) Go to `https://www.postgresql.org/download/linux/ubuntu/` and select your ubuntu version
2) `deb http://apt.postgresql.org/pub/repos/apt/ <YOUR_UBUNTU_VERSION_HERE>-pgdg main`
Example pour Ubuntu 18:
`deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main`
3) `wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -`
4) `sudo apt update`
5) `sudo apt install postgresql-12`

#### pgAdmin4

La commande suivante permet d'isntaller pgadmin4:
`sudo apt install pgadmin4 pgadmin4-apache2`

#### VueJS

Utiliser la commande `npm run install` dans le dossier du front `ed-ui`.

# Mode d'emploi

##  Démarrage du front

La partie front-end utilise le framework VueJS et est située dans le dossier `ed-ui` (Eternal-Dino User Interface).

Comment faire fonctionner le front ?

La partie front-end fonctionne avec `Node Package Manager` (npm).

Si vous ne l'avez pas, vous pouvez l'obtenir en téléchargeant NodeJS (voir section `Installation`).
Une fois le logiciel téléchargé et installé
- Avec Windows, tapez `Node.js command prompt` dans la barre de recherche Cortana. Déplacez vous ensuite dans le dossier `ed-ui` et tapez la commande : `npm run dev`.
- Avec Ubuntu, ouvrez un terminal, déplacer vous dans le dossier et executer la commande `npm run dev`.

Si vous n'obtenez pas d'erreur et que vous obtenez le message `Your application is running here: http://localhost:8080`, rendez-vous sur http://localhost:8080 (comme indiqué) pour accéder à ce magnifique site qu'est EternalDino.

Plus de commandes et d'aides sont visibles dans le `README.md` du dossier `ed-ui`.

## Mise en place de la base de données (BDD)

La BDD utilisée est PostGreSQL. Le section `Installation` décrit comment installer l'outil.

### Avec Windows

Une fois le téléchargement effectué, installez le logiciel et mettez `EternalDinoSQL` en mot de passe (la sélection d'un mot de passe sera proposée pendant l'installation).
Tapez ensuite `pgAdmin 4` dans la barre de recherche Cortana et vous devriez avoir un exécutable. Lancez-le et il s'ouvrira dans votre navigateur.

Une fois le logiciel ouvert, il faut tout d'abord créer un nouvel utilisateur.
Pour cela, faire un clic droit sur 'Login/Group Roles' (Chemin : Servers -> PostgreSQL 12 -> Login/Group Roles) puis cliquez sur 'Create -> Login/Group Role).
Mettez 'eternaldino' dans le champ 'Name' puis allez sur l'onglet 'Privileges'. Cochez tout à cet endroit pour ne pas être restreint, puis cliquer sur 'Save' pour enregistrer.

Maintenant que l'utilisateur est créé, il faut créer une base de données dédiée au projet EternalDino. 
Pour cela, faites un clic droit sur 'Databases' (Chemin : Servers -> PostgreSQL -> Databases) puis cliquez sur 'Create -> Database'.
Mettez 'EternalDinoDB' dans le champ 'Database', et mettez 'eternaldino' dans le champ 'Owner' (l'utilisateur créé tout à l'heure).
Allez ensuite sur l'onglet 'Security' et cliquez sur le petit icône '+' en face du champ 'Privileges'.
Mettez ensuite 'eternaldino' dans la colonne 'Grantee' et cochez toutes les cases dans la colonne 'Privileges'.
Enfin, cliquez sur 'Save' pour sauvegarder.

### Avec Ubuntu

Avec Ubuntu, c'est moins direct, voici comment faire en utilisant l'utilisateur par défaut de PostGreSQL appelé très originalement `postgres`:
- Ouvrez le terminal de PostGreSQL avec l'utilisateur postgres: `sudo -u postgres psql`
- Dans le terminal de PostGreSQL, définissez le mot de passe de à `EternalDinoSQL`: `ALTER USER postgres WITH PASSWORD 'EternalDinoSQL';`
- Ouvrez un nouvel onglet dans votre terminal et exécutez `pgadmin4`, une fenêtre s'ouvre dans votre navigateur.
- Dans cette fenêtre, sélectionner `Add new server` et un pop-up apparaît:
1) Dans l'onglet `General` choisissez un nom (il n'a pas d'importance)
2) Allez dans l'onglet `Connection`
3) Dans `Host name/address` écrivez `localhost`
4) Dans `Port` écrivez `5433` (le port par défaut semble être 5433 sur Ubuntu au lieu de 5432 sur Windows)
5) `Maintenance database` et `Username` doivent normanelent tous les 2 contenir `postgres`
6) Dans `Password`, entrez `EternalDinoSQL`
7) Sélectionnez `Save` et si tout est bon le serveur est ajouté correctement.
- Ouvrez le fichier `ed-be/node_modules/sequelize/lib/dialects/postgres/connection-manager.js` et changer le port à `5433` à la ligne 15.
- C'est bon la BDD est prête pour le back!

## Démarrage du back

La manière la plus simple pour démarrer la partie back-end est d'utiliser Visual Studio Code.

Pour fonctionner, le back nécessite que le serveur de la base de données soit accessible. Le fichier de configuration qui décrit la BDD utilisée est `app/config/db.config.js`.

Si vous l'utilisez, ouvrez le dossier `ed-be` (EternalDino - BackEnd) et allez dans la partie `NPM SCRIPTS` (visible en bas à gauche).
Il y aura normalement dans cette partie un fichier 'package.json' avec deux attributs : 'test' et 'start'. Cliquez sur la flèche en face du start pour démarrer le serveur.

Si vous n'utilisez pas Visual Studio Code, ouvrez un deuxième node.js command prompt et déplacez vous dans le dossier `ed-be`. A partir de là, tapez la commande `nodemon server.js` pour démarrer le serveur.

# Structure
## Comment est structuré la partie front ?

La partie front-end est composée de plusieurs parties :

1) Un dossier 'src/assets', qui centralise les images de l'application. Ces images seront appelées directement depuis les templates HTML des pages (fichiers '.vue').

2) Un dossier 'src/components' qui contient tous les composants utilisés dans EternalDino (fichiers '.vue'). Les composants sont des briques qui sont ensuite assemblées pour former une page web.

3) Un dossier 'src/router' qui contient les différentes routes de l'application. C'est le point d'entrée de l'application, dès que l'utilisateur rentre une URL, c'est ce fichier qui va lire l'URL et charger les bons composants en conséquence.

4) Un dossier 'src/services' qui contient les services (logique). Un service sert à centraliser les requêtes vers la partie back-end.

## Comment est structuré la partie back ?

La partie back-end est composée de plusieurs parties :

1) Le dossier 'app/config' qui contient les paramétrages avec la BDD (normalement, personne n'a à y toucher)

2) Le dossier 'app/controllers', qui contient tous les traitement controllers. Les controllers servent à réaliser tous les traitements métiers. 

3) Le dossier 'app/models', qui contient le modèle. C'est à dire les différentes tables de la BDD ainsi que leurs relations entre elles.

4) Le dossier 'app/routes' qui contient toutes les routes auxquels on peut faire des requêtes. Ces fichiers fonctionnent de pair avec les controllers. En effet, la route va recevoir la requête et la partie controller va se charger de faire tous les traitement métiers et de renvoyer le bon résultat.

## Cycle de vie d'un appel à la BDD 

Prenons un exemple pour simplifier : La récupération d'un dinoz

1) Lorsque l'utilisateur va aller sur l'URL de son dinoz, c'est le router (côté front, contenu dans le dossier src/router) qui va commencer les traitements.
   Le router va lire cette URL, et charger la bonne page en conséquence (contenu dans le dossier src/components). Cette page est sous la forme d'un fichier '.vue' et fait appel à des sous-composants (fichier .vue)

2) Lorque la page va charger, elle aura besoin de faire des appels vers la partie back-end pour récupérer le dinoz voulu. Le fichier .vue va alors fait un appel au service (DinozService dans notre cas).

3) Le fichier DinozService va centraliser toutes les requêtes qui sont effectuées à propos des Dinoz (trouver un dinoz, trouver tous les dinoz de l'utilisateur, obtenir les compétences d'un dinoz et etc). 
   Ces requêtes vont être envoyées vers la partie back-end. Dans notre cas, c'est la requête de récupération d'un dinoz qui va être appelée.
   
4) Nous arrivons dans la partie back-end, où le fichier DinozRoute (contenu dans le dossier app/routes) va réceptionner la requête. Ce fichier ne sert qu'à réceptionner les URL, aucun traitement n'est effectué là dedans.
   Pour déléguer ces traitements, il va faire appel à un controller (ici : DinozController).
   
5) Le controller va faire une requête à la BDD pour obtenir les informations qu'il veut, puis va les traiter si besoin. Une fois que ces traitements auront été effectués, il va renvoyer la réponse au fichier DinozRoutes.

6) Le fichier DinozRoutes n'effectue toujours aucun traitement métier, il renvoie la réponse (obtenue du controller) à la partie front-end.

7) Le fichier DinozService va renvoyer la réponse qu'il vient d'obtenir au fichier .vue

8) Le fichier .vue va alors afficher les données qu'il a obtenue.


