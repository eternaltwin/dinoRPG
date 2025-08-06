Date: 5 Août 2025
Version: 0.1
Auteur: Jahaa

- [Introduction](#introduction)
  - [Expérimentation #1](#expérimentation-1)
  - [Autre idée #1](#autre-idée-1)
    - [Idées pour le futur](#idées-pour-le-futur)
- [Notes techniques](#notes-techniques)

# Introduction 

Cette note explore plusieurs approches pour équilibrer les compétences du jeu. Il se base sur les premières expérimentations menées dont les notes sont consignées dans [Équilibrages des Compétences : Expérimentation #1](experimentation-equilibrage-1.md).

Notons aussi la liste des réflexions pour équilibrer en général la génération des combats.

## Expérimentation #1

L'[expérimentation #1](experimentation-equilibrage-1.md) est partie sur l'hypothèse d'avoir chaque arbre suit une forme spécifique. Ainsi chaque élément a le même nombre de compétences, ce qui en théorie, devrait aider pour l'équilibrage.

La forme étant 3 T1, 6 T2, 12 T3, 6 T4 et 3 T5, il a fallut créer de nouvelles compétences. En plus d'être limité par les animations, ceci s'avère compliqué et difficile. Cela va même à contre courant de viser un équilibrage plus juste car on se prend à être à l'apprenti soricer en game design et équilibrage.

Les tests et retours des joueurs, bien que positifs sur les nouvelles compétences, révèlent que l'ajout d'une seule compétence peut changer beaucoup de choses.

Autre point important, cette expérimentation mélange tellement de changements qu'il est difficile de savoir l'impacte de chacun...

Cette expérimentation a permis de brasser et d'essayer beaucoup d'idées. Pour résumer, voici un comparatif des inconvénients de cette approche. Si l'on veut c'est un retour d'expérience de l'effort, le dialogue avec les joueurs, de la mesure du succès de l'opération, etc.

Points positifs:
- ajouter de nouvelles compétences est un degré de liberté supplémentaire pour essayer d'équilibrer les éléments entre eux,
- comparaison facilité des arbres élémentaires,

Points négatifs:
- limitation en animations et rendus, ce qui limite les compétences qui peuvent être ajoutées,
- les caractéristiques uniques de chaque arbre sont perdus et ils ont ainsi perdu de leur charme,
- créer de nouvelles compétences est difficile,
- manque d'outils et de références pour mesurer et évaluer les impactes de compétences,
- ajoute beaucoup de nouveautés d'un coup, ce qui freine ou empêche l'ajout de nouveaux contenus - mieux murement réfléchi - plus tard.

## Autre idée #1

La base de cette idée est de changer un minimum de choses: les arbres gardent leur forme (ou presque, des exceptions sont possibles), les compétences restent grossièrement les mêmes, seulement les compétences les plus problématiques ou délaissées sont équilibrées ou revues.

Cette idée se base sur l'expérience acquise lors des précédentes réfléxions et a les objectifs suivant:
- Garder le charme actuel des arbres, leur forme, leurs spécificités et ne pas les lisser pour qu'ils se ressemblent tous.
- Se vouloir comme un "balance patch" à l'anglaise, c'est-à-dire, utiliser l'expérience accumulées d'une dizaine d'années du jeu original et d'une année de beta afin de proposer des ajustements aux compétences.
- Ne pas ajouter de nouvelles compétences ce qui permet de se concentrer sur les changements aux compétences actuelles et de ne pas être limités par les animations.

### Idées pour le futur

Enfin, au lieu de rentrer dans les détails de quelles compétences changer et comment (qui sera regardé séparémment si on va dans cette direction), voici une réflexion pour le futur.

Tout comme la MT qui a ajouté des compétences, nous serions intéressés pour en faire de même. Mais il ne s'agit pas seulement de rajouter des compétences, il faut prévoir de prochains équilibrages afin de continuer à itérer.

DinoRPG permet un end-game accessible. Oui de futurs changements rendront des bons Dinoz moins compétitifs, mais cela permettra de renouveler la meta et possiblement l'intérêt des joueurs.

Le concept de saison, qui est commun dans le domaine du jeu vidéo en ligne et qui a déjà été discuté entre développeurs de DinoRPG, peut faire son apparition.

À chaque saison son lot de changement, que ce soit un gros patch d´équilibrage, l'ajout de contenu à explorer voire même l'ajout de compétences ! Une saison n'aurait pas de durée fixe, ce qui donne le temps de soigner le développement des changements, comme l'ajout d'animation de compétences si l'on se sent foufou. Ces saisons pourraient raviver l'intérêt des joueurs et les motiver à revenir sur le jeu pour l'essayer.

Résumons ainsi, l'idée dans les grandes lignes.

Au cours d'une saison, l'équipe peut livrer des changements QoL, des outils, des corretions de bugs, des équilibrages mineurs, collecter des informations sur l'état du jeu et potentiellement ajouter du contenu. Pendant ce temps là, le développement peut se faire pour préparer la nouvelle saison.

Une nouvelle saison c'est l'occasion de changer des choses:
- nouvelle récompense de dojo (de quoi raviver la flamme des collectionneurs)
- ajout de contenus (quêtes, objets, missions, pnj, compétences)
- équilibrage des combats

Notons que le terme de saison n'est pas nécessaire, on peut simplement parler de "mise à jour majeure".

Bref, le concept donne un cadre pour itérer aussi bien sur le contenu offert aux joueurs mais aussi sur l'équilibrage des combats. À partir des bases saines de la 1.0, les joueurs et développeurs savent que de futur équilibrages arriveront et la possiblité de rajouter du contenus est aussi attendues.

# Notes techniques

Afin de faciliter de futurs ou équilibrages courant il va falloir quelques ajouts pour aider les développeurs:
- collecter des données sur les combats et des outils pour les analyser
- versioner les compétences pour que les replays "legacy" fonctionnent toujours - c'est surtout pour les replays cela
