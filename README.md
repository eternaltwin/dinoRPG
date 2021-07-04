# DinoRPG

# Avancement

| Titre                 | Logique Front | Back      | DB     | CSS      | Issue     | Commentaire                 |
|-----------------------|---------------|-----------|--------|----------|-----------|:----------------------------|
| BDD                   | -             | -         | 75%    | -        | TBD       | Évolutions probables        |
| CSS                   | -             | -         | -      | -        | -         | Help                        |
| Sécurisation de l'API | -             | 100%      | -      | -        | -         | Fonctionnel                 |
| Aide                  | TODO          | TODO      | TODO   | TODO     | TBD       | Rediriger vers le wiki ?    |
| Boutique d'objets     | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Boutique dinoz        | 100%          | 100%      | 100%   | 0%       | TBD       | Fonctionnel                 |
| Boutique démoniaque   | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Clan                  | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Classement            | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Combat                | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Compte                | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Dojo                  | TODO          | TODO      | TODO   | TODO     | TBD       |                             |
| Fiche Dinoz           | 25%           | 25%       | 20%    | minimal  | TBD       | Fonctionnel, voir avec Jolu |
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

Il est nécessaire d'avoir docker et docker-compose d'insntallé pour faire tourner l'environnement de dev.
* [Docker](https://docs.docker.com/get-docker/) 
  * _(Windows)_ pendant l'installation, suivre la procédure pour WSL2
* [Docker-compose](https://docs.docker.com/compose/install/) 

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

Copier la configuration ET:
```bash
$ cp ./EternalTwin/etwin.toml.example ./EternalTwin/etwin.toml
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

## Droits
Si jamais des problèmes de droits apparaissent, vérifiez votre uid et gid :
```bash
$ id
```

Modifiez ensuite ./docker/docker-compose.dev.yml :
``` yaml
drpg_back:
 build:
  args:
  - UID=xxxx
  - GID=xxxx
```
Relancez une installation à zero.

# Tips
## Clean-up
Il est possible de supprimer tout les container liés à dinorpg avec les commandes :
```bash
$ make remove-drpg (supprimera uniquement les container utilisés de dinorpg)
ou
$ docker container prune (supprimera tout les container existant sur le poste /!\)
```

## Comptes
Il n'est pas nécessaire de recréer un compte ET à chaque fois. Temps que le container drpg_database n'est pas wype, l'environnement est persistant.