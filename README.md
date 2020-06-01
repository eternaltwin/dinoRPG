# DinoRPG

# Démarrage du front

La partie front-end utilise le framework VueJS et est située dans le dossier "ed-ui" (Eternal-Dino User Interface).

Comment faire fonctionner le front ? 

La partie front-end fonctionne avec le Node Package Manager (npm).

Si vous ne l'avez pas, vous pouvez l'obtenir en téléchargeant NodeJS (https://nodejs.org/fr/download/). 
Une fois le logiciel téléchargé et installé, tapez "Node.js command prompt" dans la barre de recherche Cortana. Déplacez vous ensuite dans le dossier "ed-ui" et tapez la commande : "npm run dev". 
Si vous n'obtenez pas d'erreur et que vous obtenez le message "Your application is running here: http://localhost:8080", rendez-vous sur http://localhost:8080 (comme indiqué) pour accéder à ce magnifique site qu'est EternalDino.

# Démarrage du back

La manière la plus simple pour démarrer la partie back-end est d'utiliser Visual Studio Code.

Si vous l'utilisez, ouvrez le dossier 'ed-be' (EternalDino - BackEnd) et allez dans la partie "NPM SCRIPTS" (visible en bas à gauche).
Il y aura normalement dans cette partie un fichier 'package.json' avec deux attributs : 'test' et 'start'. Cliquez sur la flèche en face du start pour démarrer le serveur.

Si vous n'utilisez pas Visual Studio Code, ouvrez un deuxième node.js command prompt et déplacez vous dans le dossier 'ed-be'. A partir de là, tapez la commande 'nodemon server.js' pour démarrer le serveur.

# BDD

La BDD utilisée est PostGreSQL. Commencez par télécharger le logiciel à cette adresse : https://www.postgresql.org/download/

Une fois le téléchargement effectué, installez le logiciel et mettre 'EternalDinoSQL' en mot de passe (la sélection d'un mot de passe sera proposée pendant l'installation). Tapez ensuite 'pgAdmin 4' dans la barre de recherche Cortana et vous devriez avoir un éxécutable. Lancez-le et il s'ouvrira dans votre navigateur.


# Comment est structuré la partie front ?

La partie front-end est composée de plusieurs parties :

1) Un dossier 'src/assets', qui contient les différentes images de l'application

2) Un dossier 'src/components' qui contient tous les composants utilisés dans EternalDino (fichier '.vue')

3) Un dossier 'src/router' qui contient les différentes routes de l'application

4) Un dossier 'src/services' qui contient les services (logique). Un service sert à centraliser les requêtes vers la partie back-end.

# Comment est structuré la partie back ?

La partie back-end est composée de plusieurs parties :

1) Le dossier 'app/config' qui contient les paramétrages avec la BDD (normalement, personne n'a à y toucher)

2) Le dossier 'app/controllers', qui contient tous les traitement métiers 

3) Le dossier 'app/models', qui contient le modèle. C'est à dire les différentes tables de la BDD.

4) Le dossier 'app/routes' qui contient toutes les routes auxquels on peut faire des requêtes. Ces fichiers fonctionnent de pair avec les controllers. En effet, la route va recevoir la requête et la partie controller va se charger de faire tous les traitement métiers et de renvoyer le bon résultat.

