# DinoRPG

# Avancement

| Titre                 | Logique Front | Back      | DB     | CSS      | Issue     | Commentaire                 |
|-----------------------|---------------|-----------|--------|----------|-----------|:----------------------------|
| Back                  | N/A           | 50%       | N/A    | N/A      | TBD       | Reste à finaliser           |
| BDD                   | N/A           | N/A       | 75%    | N/A      | TBD       | Reste à finaliser           |
| CSS                   | N/A           | N/A       | N/A    | 5%       | TBD       | Help!                       |
| Front                 | 75%           | N/A       | N/A    | N/A      | TBD       | Reste à finaliser           |
| Sécurisation de l'API | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Aide                  | TODO          | TODO      | TODO   | TODO     | TBD       | Rediriger vers le wiki ?    |
| Boutique d'objets     | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Boutique dinoz        | 75%           | 75%       | 75%    | minimal  | TBD       | Manque Quetzu, fonctionnel  |
| Boutique démoniaque   | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Clan                  | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Classement            | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Combat                | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Compte                | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Dojo                  | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Fiche Dinoz           | 20%           | 20%       | 20%    | minimal  | TBD       | Fonctionnel, voir avec Jolu |
| │- Dinoz              | TBD           | TBD       | TBD    | minimal  | TBD       | Fonctionnel, voir avec Jolu |
| │- Carte              | TODO          | TODO      | TODO   | TODO     | [Issue 3] |                             |
| │ │- Dinoland, etc.   | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| │- PNJs               | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| │- Quêtes             | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Ingrédients           | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| │- Récolte            | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| │- Page Ingrédients   | TODO          | TODO      | TODO   | TODO     | TBD       |                             |

[Issue 3]: https://gitlab.com/eternal-twin/dinorpg/-/issues/3

# Prérequis

Les technologies principales utilisées sont:
- Node.js: v14.15.1
- Yarn: v1.22.10
- Postgresql: v12
- pgAdmin4
- Vue/CLI: v4.4.1

Il est préférable d'utiliser ces versions (ou des versions proches).

## Installation

### Windows

Sur Windows, seuls nodeJS, yarn et PostgreSQL doivent être installés (voir ci-dessous).
Une fois ces installations effectuées, aller directement à la partie 'Mode d'emploi'

#### Node.js & npm

NodeJS et npm se téléchargent en même temps, suivez le tutoriel d'installation ici : https://eternal-twin.net/docs/tools/node

#### Yarn

Installez `npm` puis lancez la commande:

```
npm install -g yarn
```

#### Postgresql

Installation sous Windows :

Voir `https://www.postgresql.org/download/windows/` (Rappel : version 12)

Une fois le téléchargement de PostGreSQL effectué, installez le logiciel et mettez `EternalDinoSQL` en mot de passe (la sélection d'un mot de passe sera proposée pendant l'installation).
Tapez ensuite `pgAdmin 4` dans la barre de recherche Cortana et vous devriez avoir un exécutable. Lancez-le et il s'ouvrira dans votre navigateur.

Il faut maintenant créer une base de données dédiée au projet EternalDino. 
Pour cela, faites un clic droit sur 'Databases' (Chemin : Servers -> PostgreSQL -> Databases) puis cliquez sur 'Create -> Database'.
Mettez 'EternalDinoDB' dans le champ 'Database', et mettez 'eternaldino' dans le champ 'Owner' (l'utilisateur créé tout à l'heure).
Allez ensuite sur l'onglet 'Security' et cliquez sur le petit icône '+' en face du champ 'Privileges'.
Mettez ensuite 'eternaldino' dans la colonne 'Grantee' et cochez toutes les cases dans la colonne 'Privileges'.
Enfin, cliquez sur 'Save' pour sauvegarder.

Installation sous Linux :

Avant tout, vérifier que votre environnement est à jour:
1) `sudo apt update`
2) `sudo apt upgrade`
Notez que `apt` est le successeur de `apt-get` et s'utilise de la même facon.

Ensuite :

Source: `https://www.postgresql.org/download/linux/ubuntu/`
1) Go to `https://www.postgresql.org/download/linux/ubuntu/` and select your ubuntu version
2) `deb http://apt.postgresql.org/pub/repos/apt/ <YOUR_UBUNTU_VERSION_HERE>-pgdg main`
Example pour Ubuntu 18:
`deb http://apt.postgresql.org/pub/repos/apt/ bionic-pgdg main`
3) `wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -`
4) `sudo apt update`
5) `sudo apt install postgresql-12`

PostGreSQL est installé, il faut maintenant créer une base de données pour le projet :

Avec Ubuntu, c'est moins direct qu'avec Windows, voici comment faire en utilisant l'utilisateur par défaut de PostGreSQL appelé très originalement `postgres`:
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

Enfin, installez pgAdmin4 pour pouvoir visualiser votre BDD :

La commande suivante permet d'isntaller pgadmin4:
`sudo apt install pgadmin4 pgadmin4-apache2`

#### Dépendances front

Utiliser la commande `yarn install` dans le dossier du front `ed-ui`.

#### Dépendances back

Utiliser la commande `npm install` dans le dossier du back `ed-be`.

# Mode d'emploi

## Démarrage du back

La manière la plus simple pour démarrer la partie back-end est d'utiliser Visual Studio Code.

Tout d'abord, ouvrir le dossier `ed-be` avec Visual Studio Code.
Ensuite, cliquer sur l'onglet `Terminal`, puis `New terminal`.
Dans le terminal qui vient de s'ouvrir, vérifier que vous vous situez dans le dossier `ed-be`, puis taper : `npm run start`

## Démarrage du front

Ouvrir un terminal et taper la commande `npm run dev` dans le dossier `ed-ui`.

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

5) Un dossier 'app/repositories' qui contient tous les fichiers qui feront des appels à la base de donnée.

## Appliquer un dump à sa BDD

Pour appliquer un dump :

1) Faire clic droit sur la BDD "EternalDinoDB" puis cliquer sur "Delete/Drop" -> Valider la pop-in de confirmation
2) Faire un clic droit sur "Databases" puis "Create -> Database"
3) Nommer la nouvelle BDD "EternalDinoDB" et mettre "eternaldino" comme utilisateur -> Cliquer sur le bouton "Save"
4) Faire un clic droit sur la BDD créée puis cliquer sur "Restore"
5) Dans la pop-in, sélectionner le dump voulu puis cliquer sur "Restore"


