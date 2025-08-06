Date: 5 Août 2025
Version: 0.5
Auteur: Jahaa

# Équilibrages des Compétences : Expérimentation #1

- [Équilibrages des Compétences : Expérimentation #1](#équilibrages-des-compétences--expérimentation-1)
  - [Préambule](#préambule)
  - [Introduction](#introduction)
  - [Quelques chiffres](#quelques-chiffres)
  - [Problèmes identifiés](#problèmes-identifiés)
    - [Sumo](#sumo)
    - [Self-Control](#self-control)
    - [Poisons](#poisons)
    - [Des Arbres Déséquilibrés](#des-arbres-déséquilibrés)
    - [La priorité](#la-priorité)
    - [L'armure](#larmure)
    - [Compétences non adaptées à tout les modes de jeux](#compétences-non-adaptées-à-tout-les-modes-de-jeux)
    - [Limites des caractéristiques spéciales](#limites-des-caractéristiques-spéciales)
  - [Solutions proposées concernant les compétences](#solutions-proposées-concernant-les-compétences)
  - [Autres aspects encore en étude](#autres-aspects-encore-en-étude)
  - [Solutions proposées pour les mécanismes en général](#solutions-proposées-pour-les-mécanismes-en-général)
    - [Refonte de l'armure](#refonte-de-larmure)
    - [Caractéristiques élémentaires](#caractéristiques-élémentaires)
    - [Conditions bloquantes](#conditions-bloquantes)
    - [Conditions d'annulation](#conditions-dannulation)
    - [Limite de "combo"](#limite-de-combo)
    - [Équilibrage des multicoups](#équilibrage-des-multicoups)
    - [Équilibrage des contres](#équilibrage-des-contres)
    - [Équilibrage des esquives](#équilibrage-des-esquives)
- [Liste des changements par arbre](#liste-des-changements-par-arbre)
  - [Feu](#feu)
    - [T1 Colère](#t1-colère)
    - [T2 Souffle Ardent](#t2-souffle-ardent)
    - [T2 Charge](#t2-charge)
    - [T2 Furie](#t2-furie)
    - [T2 Chasseur de Goupignon](#t2-chasseur-de-goupignon)
    - [T2 Arts Martiaux\*](#t2-arts-martiaux)
    - [T3 Vigilance](#t3-vigilance)
    - [T3 Bélier\*](#t3-bélier)
    - [T3 Paume Chalumeau\*](#t3-paume-chalumeau)
    - [T3 Chasseur de Géant](#t3-chasseur-de-géant)
    - [T3 Coulée de Lave](#t3-coulée-de-lave)
    - [T3 Combustion](#t3-combustion)
    - [T3 Boule de Feu](#t3-boule-de-feu)
    - [T3 Sieste\*](#t3-sieste)
    - [T4 Chef de Guerre\*](#t4-chef-de-guerre)
    - [T4 Riposte](#t4-riposte)
    - [T4 Kamikaze\*](#t4-kamikaze)
    - [T4 Chasseur de Dragon](#t4-chasseur-de-dragon)
    - [T4 Torche\*](#t4-torche)
    - [T4 Self-Control](#t4-self-control)
    - [T5 Rage](#t5-rage)
    - [T5 Brasier](#t5-brasier)
    - [T5 Brave](#t5-brave)
    - [Sphères](#sphères)
      - [T1 Coeur du Phoenix](#t1-coeur-du-phoenix)
      - [T2 Braséro](#t2-braséro)
      - [T3 Détonation](#t3-détonation)
  - [Bois](#bois)
    - [T1 Carapace\*](#t1-carapace)
    - [T2 Sympathique](#t2-sympathique)
    - [T2 Vignes\*](#t2-vignes)
    - [T2 Fouille](#t2-fouille)
    - [T2 Renforts Korgon](#t2-renforts-korgon)
    - [T3 Garde Forestier](#t3-garde-forestier)
    - [T3 Planificateur](#t3-planificateur)
    - [T3 Printemps Précoce](#t3-printemps-précoce)
    - [T3 Esprit Gorilloz](#t3-esprit-gorilloz)
    - [T3 Cocon](#t3-cocon)
    - [T3 Large Machoire](#t3-large-machoire)
    - [T3 Détective](#t3-détective)
    - [T3 Expert en Fouilles](#t3-expert-en-fouilles)
    - [T3 Acrobate](#t3-acrobate)
    - [T3 Charisme](#t3-charisme)
    - [T3 Héritage Faroe\*](#t3-héritage-faroe)
    - [T4 Provocation\*](#t4-provocation)
    - [T4 État Primal](#t4-état-primal)
    - [T4 Géant (des Forêts)](#t4-géant-des-forêts)
    - [T4 Archéologue](#t4-archéologue)
    - [T4 Forcebrute\*](#t4-forcebrute)
    - [T4 Gardien Arboricole\*](#t4-gardien-arboricole)
    - [T5 Maitre des Ronces\*](#t5-maitre-des-ronces)
    - [T5 Colosse (des Forêts)](#t5-colosse-des-forêts)
    - [T5 Écorce Centenaire](#t5-écorce-centenaire)
    - [Sphères](#sphères-1)
      - [T1 Lanceur de Glands](#t1-lanceur-de-glands)
      - [T2 Gratteur -\> Griffes Métalliques](#t2-gratteur---griffes-métalliques)
      - [T3 Grosse Beigne](#t3-grosse-beigne)
  - [Eau](#eau)
    - [T1 Canon à Eau](#t1-canon-à-eau)
    - [T1 Perception\*](#t1-perception)
    - [T1 Mutation\*](#t1-mutation)
    - [T2 Douche Écossaise](#t2-douche-écossaise)
    - [T2 Gel\*](#t2-gel)
    - [T2 Apprenti Pêcheur](#t2-apprenti-pêcheur)
    - [T2 Coup Sournois](#t2-coup-sournois)
    - [T2 Poche Ventral](#t2-poche-ventral)
    - [T3 Pétrification](#t3-pétrification)
    - [T3 Zéro Absolu](#t3-zéro-absolu)
    - [T3 Marécage](#t3-marécage)
    - [T3 Pêcheur Confirmé](#t3-pêcheur-confirmé)
    - [T3 Coup Fatal](#t3-coup-fatal)
    - [T3 Entrainement Sous-Marin](#t3-entrainement-sous-marin)
    - [T3 Clone Aqueux](#t3-clone-aqueux)
    - [T3 Griffes Empoisonnées](#t3-griffes-empoisonnées)
    - [T3 Sumo](#t3-sumo)
    - [T3 Branchies](#t3-branchies)
    - [T4 Malédiction Acqueuse](#t4-malédiction-acqueuse)
    - [T4 Rayon Kaar Sheer](#t4-rayon-kaar-sheer)
    - [T4 Maitre Pêcheur](#t4-maitre-pêcheur)
    - [T4 Entrainement Sous-Marin Avancé](#t4-entrainement-sous-marin-avancé)
    - [T4 Sang Acide](#t4-sang-acide)
    - [T4 Décomposeur](#t4-décomposeur)
    - [T5 Onde de Vie](#t5-onde-de-vie)
    - [T5 Nécroman](#t5-nécroman)
  - [Foudre](#foudre)
    - [T1 Focus](#t1-focus)
    - [T2 Régénérescence](#t2-régénérescence)
    - [T2 Paratonnerre](#t2-paratonnerre)
    - [T2 Premiers Soins -\> Revitalisation](#t2-premiers-soins---revitalisation)
    - [T2 Plan de Carrière](#t2-plan-de-carrière)
    - [T3 Foudre](#t3-foudre)
    - [T3 Aura Hermétique](#t3-aura-hermétique)
    - [T3 Voie de Gaïa\*](#t3-voie-de-gaïa)
    - [T3 Fission Élémentaire](#t3-fission-élémentaire)
    - [T3 Brancardier\*](#t3-brancardier)
    - [T3 Crocs-Diamant\*](#t3-crocs-diamant)
    - [T3 Voie de Kaos](#t3-voie-de-kaos)
    - [T3 Voie de Gaia](#t3-voie-de-gaia)
    - [T3 Voie d'Ouranos](#t3-voie-douranos)
    - [T3 Réincarnation](#t3-réincarnation)
    - [T3 Flash\*](#t3-flash)
    - [T4 Bénédiction](#t4-bénédiction)
    - [T4 Aube Feuillue](#t4-aube-feuillue)
    - [T4 Médecine](#t4-médecine)
    - [T4 Décharge](#t4-décharge)
    - [T4 Parafoudre](#t4-parafoudre)
    - [T5 Archage Corrosif](#t5-archage-corrosif)
    - [T5 Archage Génésif](#t5-archage-génésif)
    - [T5 Archage Evasif](#t5-archage-evasif)
  - [Air](#air)
    - [T1 Stratégie](#t1-stratégie)
    - [T1 Mistral\*](#t1-mistral)
    - [T2 Analyse](#t2-analyse)
    - [T2 Cueillette](#t2-cueillette)
    - [T2 Tai-Chi](#t2-tai-chi)
    - [T2 Vent Vif](#t2-vent-vif)
    - [T3 Disque Vacuum](#t3-disque-vacuum)
    - [T3 Élasticité](#t3-élasticité)
    - [T3 Furtivité](#t3-furtivité)
    - [T3 Attaque Plongeante](#t3-attaque-plongeante)
    - [T3 Spécialiste](#t3-spécialiste)
    - [T3 Talon d'Achille\*](#t3-talon-dachille)
    - [T3 Nuage Toxique](#t3-nuage-toxique)
    - [T3 Oeil de Lynx](#t3-oeil-de-lynx)
    - [T3 Méditation Solitaire\*](#t3-méditation-solitaire)
    - [T3 Rafale](#t3-rafale)
    - [T3 Tornade\*](#t3-tornade)
    - [T3 Forme Vaporeuse\*](#t3-forme-vaporeuse)
    - [T4 Tempête\*](#t4-tempête)
    - [T4 Maitre Levitateur](#t4-maitre-levitateur)
    - [T4 Paume Éjectable](#t4-paume-éjectable)
    - [T4 Haleine Fétive](#t4-haleine-fétive)
    - [T4 Méditation Transcendantale\*](#t4-méditation-transcendantale)
    - [T4 Forme Éthérale](#t4-forme-éthérale)
    - [T5 Trou Noir](#t5-trou-noir)
    - [T5 Souffle de Vie](#t5-souffle-de-vie)
    - [T5 Brouillard Éthérale](#t5-brouillard-éthérale)
    - [Spécial](#spécial)
      - [T1 Envol](#t1-envol)
      - [T2 Décollage d'urgence](#t2-décollage-durgence)
    - [Sphères](#sphères-2)
      - [T1 Aiguillon](#t1-aiguillon)
      - [T2 Aura Puante](#t2-aura-puante)
    - [T3 Hypnose](#t3-hypnose)
  - [Autres changements](#autres-changements)
    - [Catégorie de compétences](#catégorie-de-compétences)
    - [Coque (Winks)](#coque-winks)

## Préambule

Je n'ai pas de formation en développement de jeux vidéos. J'ai contribué à recréer de la facon la plus authentique possible l'[algorithme partagé par Motion Twin](https://github.com/motion-twin/WebGamesArchives/tree/8b8e2f202e1fa8cdf1d96e4140dad0cba458054e/DinoRPG).
Ainsi j'ai accumulé une expérience de ce qui existe et de ses défauts et c'est à peu près tout.

Ces notes de développement s'appuient sur cette expérience, les réflexions eut avec la communauté, l'amphithéâtre et d'autres personnes sur l'équilibrage, puis enfin sur de nombreux testes et retours de joueurs.

Les combats de DinoRPG sont une accumulation de pleins de petits effets: les éléments dont on dérive la puissance des attaques et la défense, les esquives, les mécanismes d'attaques ou de défenses, etc.
Ainsi lors de l'équilibrage, cet esprit a été conservé le plus possible afin de garder des mécaniques accessibles et explicables.

Il est aussi à noter que dans l'existence du jeu, celui-ci a évolué et la génération des combats avec. Cela est visible dans le code source où certaines des dernières compétences ne sont pas codés dans le même style (qui indique que quelqu'un avec moins d'expérience s'en est chargé). Mais les compétences en elle-même ont peu varié.

Nous avons de la chance d'avoir accès au code source de la MT, sans quoi nous en serions toujours à deviner comment les combats fonctionnaient et faire beaucoup d'approximations. Cette chance nous permet de poser un regard plus critique sur ce que ces compétences ont été pendant des années, les limitations de l'équilibrage actuel par arbre et compétence.

L'effort fait ne concerne que les compétences dites vanilla, les premières, et les sphèriques. Les invocations, compétences doubles et compétences éther (2e arbre) sont ignorées bien que les changements suggérées vont impacter ces compétences qui seront nécessairement modifiées à termes.

La liberté n'est pas totale pour créer ou changer des compétences car les animations d'affichage ne sont pas nécessairement disponible, donc il faut faire avec.

Les analyses et idées présentées plus bas touchent également aux mécaniques du jeu. Certaines mécaniques ont des défauts ou des incohérences qui peuvent être invisibles pour les joueurs.

Ainsi, au delà de l'équilibrage des compétences vanilla, il s'agit d'assainir les bases du jeu afin de pouvoir batir un équilibrage qui résistera mieux aux évolutions futures du jeu.

La présente note se veut de documenter les problèmes trouvés, les analyses de ces problèmes, les solutions proposées, des pistes de changement pour les compétences.

## Introduction

Cette note de développement synthétise les notes, études et réflexions eut lors de la première expérimentation pour équilibrer les compétences du jeu.

Elle pourra servir de référence à ce qui a été essayé et les pistes de réflexion suivi.

## Quelques chiffres

Les Dinoz comme les monstres possèdes des compétences et des paramètres. Les compétences jouent un rôle essentiel dans le déroulement d'un combat en influant les petits mécanismes existant en ou ajoutant de nouveaux mécanismes uniques. Les paramètres (PV, énergie, éléments) influencent l'effet des compétences.

Il existe plusieurs types de compétences:
- collecte (C)
- évènement (E)
- active (A)
- invocation (I)
- passive (P)
- spéciale (S) - mixe des autres ou avec des effets uniques

Ces catégories sont plus descriptives qu'autre chose, car il est facile de rajouter des effets passifs et actifs à une compétence de collecte (par exemple).

En examinant le code, les compétences peuvent être triées en d'autres catégories, comme cette liste non-exhaustives :
- effets passifs (PV, élément, assaut, repos) - exemple: mutation, maitre nageur
- effets de récolte - exemple cueillette
- effets actifs (i.e qui remplace un assaut) - exemple canon à eau
- effets évènements (i.e qui ont une chance de se déclencher avant un assaut) - exemple focus
- effets au début du combat - exemple torche
- effets en fin de combat - exemple premiers soins
- effets de défense (i.e qui se déclenchent dès que des dégâts directes sont subis et peuvent les changer) - exemple cuirasse du féross, forme vaporeuse, bulle
- effets post attaque (i.e qui se déclenchent quand avoir infligé une attaque) - exemple griffes empoisonnées
- effets post défense (i.e qui se déclenchent après avoir subit une attaque) - exemple sang acide
- effets de soins - exemple aube feuillue
- effets offensifs - exemple brasier
- effets qui ajoutent des statuts - exemple nuage empoisonné
- effets qui enlèvent des statuts - exemple état primal
- effets qui ajoutent/enlèvent de l'initiative - exemple vignes
- etc.

Ces catégories ne sont pas exhaustives ni exclusives mais donnent des archétypes et permettent de comparer avec plus de granularité les arbres de compétences.

Il est possible de catégoriser et comparer différemment, il ne s'agit pas d'une unique grille de lecture universelle.

Voici quelques chiffres comparatifs globaux par arbre élémentaire. Ces chiffres permettent quelques comparaisons et peuvent orienter certains axe de réflexion, mais sont aussi réducteurs car ils ne peuvent pas capturer l'unicité et l'exhaustivité de toutes les compétences.

| Ele | T1 | T2 | T3 | T4 | T5 | T6 |
| --  | -- | -- | -- | -- | -- | -- |
| Feu | 3 | 6 | 12 | 6 |  1 | 0  |
| Bois | 3 | 6 | 12 | 6 |  1 | 0  |
| Eau | 3 | 6 | 12 | 6 |  1 | 0  |
| Foudre | 3 | 6 | 12 | 6 |  3 | 0  |
| Air | 3 | 6 | 12 | 6 |  1 |  1 |

En générale, chaque arbre possède 3 T1, 6 T2, 12 T3, 6 T4, 1 T5. Mais il y a des exceptions. Le diable est dans les détails car certains arbres ont plus de compétences dans une branche de l'arbre que dans d'autre, toutes les compétences spéciales ne sont pas utiles (exemple sympatique ou cocon) ou encore un arbre va avoir plus de compétences de collecte.

| Ele | Passives | Actives | Évènements | Collecte | Spéciales | Universelles |
| --  | -- | -- | -- | -- | -- | -- |
| Feu    | 13 | 7 | 2 |  3 | 3 | 0 |
| Bois   | 12 | 0 | 6 | 5 | 3 | 2 |
| Eau    | 9 | 6 | 3 | 3 | 5 | 2 |
| Foudre | 10 | 4 | 4 | 2 | 8 | 2 |
| Air    | 8 | 7 | 1 | 2 | 10 | 1 |

Quelques irrégularités deviennent visibles, mais il faut encore se plonger plus dans les détails pour reconnaître des problèmes. Voici un extrait de statistiques passives cumulées :

| Ele | PV Max*| Assaut | Défense | Élément | Vitesse | Armure | Contre | Évasion | Multicoup |
| --  | ------ | ------ | ------- | ------- | ------ | ------ | ------ | ------- | --------- |
| Feu    | 90  | 25     | 5       | 8       | 15          | 0      | 10 + 5 | 0       | 0  |
| Bois   | 100 | 53     | 2       | 2       | 15 -20 -20  | 2      | 0      | 0       | 0  |
| Eau    | 160 | 14     | 25      | 5       | 0           | 0      | 0      | 0       | 0  |
| Foudre | 0   | 8      | 6       | 6       | 15          | 0      | 0      | 0       | 20 |
| Air    | 0   | 32     | 18      | 0       | -20 -50 -50 | 0      | 0      | 10      | 0  |

On peut se dire facilement en regardant ce tableau que les arbres Foudre et Air ont la nécessité d'augmenter leur PV Max via les autres arbres. On peut noter également la disparité en bonus élémentaire entre les arbres avec l'Air et le Bois qui en ont le moins.

D'autres disparités peuvent sauter aux yeux:
- certains arbres donnent plus de bonus en éléments,
- certains arbres accumulent plus d'effets négatifs.

\* Ne compte pas vitalité

Ces chiffres permettent de renforcer un ressentiment partagé par la communauté

## Problèmes identifiés

Venons en aux problèmes majeurs identifiés. Encore une fois, ceci s'inscrit dans l'aire pure vanilla i.e jusqu'au niveau 50, sans compétence double, invocation, etc. Mais avec les dernières mécaniques disponibles à la fin du jeu (notamment l'énergie qui n'existait pas avant).
La beta permet de confirmer les tendances: les arbres Feu et Eau dominant sur les autres et la possibilité de monter des dinoz très forts bas niveau en rushant certaines compétences.

Résoudre ces problèmes permettrait de ré-équilibrer les combats et d'éviter la domination de certaines meta.

### Sumo

Creuvons le premier absès, Sumo.
Cette compétence T3 Eau augmente les PV max de 100, elle se trouve aussi sur le chemin de mutation, griffes empoisonnées, clone aqueux, etc.
C'est la compétence qui augmente les PV max le plus de toutes les compétences vanilla, sans aucun malus. Nécessairement, elle est prisée, *très* prisée. Tellement que pour être viable, un dinoz se doit de l'avoir sinon l'écart de PV est tel que ce n'est pas possible.

Statistiquement, cela éloigne plusieurs races de dinoz qui ont très peu de chance de up en eau ou ne peuvent pas. Pouvoir avoir un dinoz d'une certaine race viable ne devrait pas résider dans une anomalie des statistiques.

Cela aussi contribue à une domination de l'arbre eau à bas niveau qui peuvent avoir un bonus cumulé de 130 PV au niveau 10.

La compétence éclipse toute autre alternative dans les autres arbres, limitant ainsi la diversité.

### Self-Control

Self control est une compétence T4 Feu. Elle immunise contre *tous* les statuts négatifs.

Donc une seule compétence immunise votre Dinoz contre un pan entier des compétences. Nécessairement, cette compétence est très prisée, c'est un "no-brainer". Aussi elle est difficile à atteindre pour certains Dinoz, mais cela tombe bien car c'est sur le chemin de Brave, aussi très fort, ou coeur ardent pour quelques PV en plus. Bref, tout pousse pour tenter de l'avoir avec n'importe quel Dinoz non feu.

Non seulement cette compétence est un must-have (après Sumo) mais c'est aussi une entrave à l'équilibrage en lui-même: ajouter des sources de status négatifs ne feraient que renforcer l'attrait pour cette compétence.

### Poisons

Le statut le plus intéressant du jeu, si vous ne combattez pas un Dinoz immunisé. Pour information, un poison inflige ses dégâts à chaque cycle (un cycle = 6 unité de temps, vignes c'est 15 par exemple). Les poisons ont soit des dégâts fixés (14 pour griffes empoisonnées, 10 pour aura puante) ou proportionnel avec l'élément de l'empoisonneur (nuage toxique, haleine fétide).

L'un ou l'autre, la détermination des dégâts est différentes de tout autre source de dégâts du jeu et amène à des compétences pouvant être surpuissante. Un seul assaut eau avec griffes empoisonnées va occasioner 70 de dégâts, 70, imaginez ! Nécessairement il faut s'en immuniser ou lorsque ce n'est pas possible, c'est une victoire assurée lorsque la compétence est priorisée. Et si le combattant en face n'a pas Sumo, c'est probablement la moitié -voire plus- de sa vie qui s'envole en fumée avec un seul assaut.

Cela aussi contribue à une domination de l'arbre eau à bas niveau qui peuvent avoir un bonus cumulé de 130 PV et un poison au niveau 10.

### Des Arbres Déséquilibrés

Les chiffres mentionnés plus haut l'illustre, les arbres ont des déséquilibres pour plusieurs raisons:
- certains arbres ont des compétences universelles, une fois apprise, il n'y en a plus besoin
- certains arbres ont plus de compétences de collecte, les rendant plus faible que ceux qui en ont moins
- certains arbres ont plus de compétences en générale
- certains arbres ont plus de compétences qui donnent principalement des effets négatifs
- certains arbres ont plus de compétences actives que d'autres
- certains arbres ont plus de compétences évènements que d'autres

Ces même déséquilibres peuvent se retrouver en comparant les branches d'un même arbre.

Une des conséquences est que avoir beaucoup de gains de niveau dans un certain élément est utile pour certains mais pas pour d'autres arbres car il en vient à manquer de compétences utiles.

### La priorité

Késako ?

La priorité c'est ce qui définit dans quel ordre sont inspectés les compétences actives pour déterminer la quelle sera testée sur sa probabilité en premier. Cette caractéristique cachée des compétences a pu être estimé pendant un certain temps (T1 = priorité 1, etc.). Mais cette intuition est partiellement fausse.

### L'armure

L'armure apparaît comme une caractéristique rare. Mais elle a en fait un effet très faible. Une refonte de l'armure va être envisagée.

### Compétences non adaptées à tout les modes de jeux

Certaines compétences comme Trou Noir, Hypnose mais aussi sympathique et charisme, ne sont pas adaptées à tout les mode de jeu: trou noir et hypnose sont désactivées en dojo, tandis que sympathique et charisme n'ont juste aucun effet. Tout comme sapeur et poche ventrale.

### Limites des caractéristiques spéciales

Les caractéristiques tels que contre, multicoup et évasion ont le défaut d'être complètement déséquilibré dès que l'on en a beaucoup: un Dinoz va contrer constamment, ou enchainer des séries presque infinies de multicoups, ou sera presque intouchables. Tout cela, seulement contrer par le hasard et sans limitation.

Bien que fait parti de la nature du gens, cela empêche ou limite extrêmenent de rajouter des bonus pour ces caractéristiques. Il peut être mentionné que ces limites étaient déjà observables dans le jeu d'origine (Dinoz full contre + multicoup, équipe full Toufufu invocation).

## Solutions proposées concernant les compétences

Les grandes lignes adoptées reflètent un esprit qui se veut de comprendre et être cohérent, à l'instar de dire "ca a toujours été comme cela" pour ne rien faire d'audacieux.

- Sumo & Self Control doivent être changés. Sans ces changements, les lignes bougeront peu sauf à réhausser vers le haut pour rendre "abusé" d'autres compétences. Ce n'est pas le parti pris ici.
- Poisons: il est préconisé de basé les poisons sur les éléments de la compétence et de lisser le résultat avec "une puissance 0.6" tel que les autres mécaniques (torche, sang acide).
- Déséquilibre des arbres: l'approche choisit est de balancer chaque arbre et chaque branche en suivant les règles suivantes: Le partie pris est d'offrir le même nombre d'options par arbre. Cela peut évidemment ne pas faire consensus et certains peuvent préférer des arbres avec des "formes" uniques. Cette porte n'est pas fermée. Il m'est apparu qu'il est beaucoup plus facile d'équilibrer les branches d'un arbre et les arbres entre eux, s'ils ont la même forme.
  - 3 T1, 6 T2, 12 T3, 6 T4 & 3 T5 - aucune T6,
  - Chacune des 3 branches d'un arbre a 2 T2, 4 T3, 2 T4 et 1 T5,
  - les compétences U ne comptent *pas*,
  - les compétences de récoltent comptent et donnent un ou des effets,
  - les compétences plan de carrière et réincarnation ne comptent *pas*,
  - les compétences spéciales et situationnelles tel que sapeur, poche ventrale, sympathique, charisme, etc. seront améliorées ou refaites pour être utile en toute circonstance.
- Armure: refonte complète pour agir en % de réduction des dégâts directes subis
- Priorité: appliquer la règle T-X = priorité X (puis afficher la priorité dans le jeu)

Voici le même tableau que dans [des chiffres](#des-chiffres) mais pour les changements proposés, les 2 plus gros points de correction sont les suivants :
- les arbres foudre et air obtiennent des bonus de PV max,
- les bonus d'élément sont équilibrés, notamment les arbres air et bois rattrapent leur retard.

| Ele | PV Max*| Assaut | Défense | Élément | Vitesse     | Armure | Contre | Évasion | Multicoup |
| --  | ------ | ------ | ------- | ------- | ----------- | ------ | ------ | ------- | --------- |
| Feu    | 90  | 22     | 9       | 8       | 15          | 5      | 10 +5 | 0       | 0  |
| Bois   | 110 | 53     | 15      | 10      | 10 +5 -20 -20 | 5+5+5+5+10+20 | 0  | 10 | 0  |
| Eau    | 110 | 14     | 31      | 8       | -10         | 5+10   | 0      | 0       | 0  |
| Foudre | 55  | 8      | 9       | 10      | 15          | 5+5    | 5+5    | 5+5     | 20 |
| Air    | 50  | 30     | 21      | 8       | -20 -50 -10 | 5      | 0      | 10+5+5+10  | 30  |
\* Vitalité n'est pas compté

## Autres aspects encore en étude

- globaliser l'utilisation de l'énergie à tout type d'actions (esquives, compétences spéciales, etc.)
- revoir le scaling des soins : ajouter de l'aléa, les basés sur ^0.6 également
- status : ré-appliquer un statut pourrait en prolonger la durée ?
- avoir le plus possible de up dans un élément *semble* plus fort que d'être diversifié (Dinoz mono élé VS dinoz multi-ele) dans le jeu concu par la MT, donnant un avantage natif aux Dinoz mono-élément VS ceux multi-élément

## Solutions proposées pour les mécanismes en général

### Refonte de l'armure

L'armure devient un pourcentage et applique une réduction aux dégâts directes subis de ce pourcentage. L'armure se calcule comme les multicoups, les contres et l'esquive.

La réduction de dégâts se fait après la différence entre l'attaque et la défense mais aussi après équilibrage.

Ainsi, la formule simplifiée ressemble à `(attaque - defense)^0.6 * (1 - armure)`.

Ce concepte vient également avec son opposé qui est la capacité à ignorer l'armure ou d'enlever de l'armure à un opposant durant un combat.

L'armure effective est donc calculée selon `armure - armure ignorée`.

### Caractéristiques élémentaires

Inspirée de la vitesse qui existe sous forme globale mais aussi élémentaire, l'armure, la capacité d'ignorer l'armure, les contres, les multicoups, l'esquive et la super esquive ont été complétée avec des formes élémentaires:
- la contribution élémentaire de l'armure, la capacité à ignorer l'armure, l'esquive, la super esquive et les multicoups ne s'applique en bonus de la caractéristique de base que pour les attaques du même élément,
- la capacité à ignorer l'armure a aussi une catégorie pour les assauts, permettant de donner l'obtien de permettre aux assauts d'ignorer plus d'armure,
- le contre élémetaire ne s'applique en bonus des chances de contre de base que si l'élément actif du combattant est le même, selon la roue élémentaire du dinoz.

Exemple:
Un Dinoz avec 10% d'esquive globale et 20% d'esquive foudre aura 32% de chance d'esquiver les assauts foudre mais seulement 10% pour les autres assauts.
Un Dinoz avec 10% en contre globale et 20 en contre feu, aura 32% de chance de contrer lorsque son élément actif sera le feu, et 10% les autres moements.

Ces nouvelles variantes ont pour but de donner plus de flexibilité dans la création et l'équilibrage des compétences, présent comme futur.

### Conditions bloquantes

Si un combattant est mort ou endormit, étourdit ou pétrifié: il ne peut pas esquivé, combo ou contré. La majorité des autres effets qui se déclenchent dans ses conditions spécifiques fonctionnent toujours sauf indication contraire.

Cela permet notamment d'éviter qu'un combattant (ou un clone) fasse 10 multicoups d'affilés alors qu'il est mort au premier due à un effet de défense tel que torche.

### Conditions d'annulation

C'est une partie technique dans la génération des combats de la MT qui a été reprise telle quelle par fidélité. Certaines compétences ont des conditions pour pouvoir se lancer. Par exemple, détonation ne se lance pas si le combattant a 5 PV ou moins pour éviter qu'il se suicide. Autre exemple concerne les invocations, qui ne peuvent être lancée qu'une seule fois.

Lorsque ces conditions sont réunies, l'activation de la compétence est annulée :
- pour un évènement, cela veut pas de compétence E ou objet déclenché pour ce tour,
- pour une compétence A, cela veut pas de compétence E ou objet déclenché pour ce tour, mais un assaut à la place.

L'effet pervers est qu'une compétence avec une priorité élevée peut empêcher l'activation de compétence de priorité plus faible car les conditions d'activations ne sont pas réunies. Pour les invocations, une fois qu'un Dinoz a appelé son invocation, il ne pourra plus l'appeler de nouveau mais à la place de l'appeler il réalisera un assaut si le test de probabilité réussit, bloquant ainsi la possibillité de vérifier s'il aurait pu lancer une autre compétence.

Bon c'est possible que ce soit obscure et que j'ai perdu 90% des gens à ce niveau.

Il faut retenir que ce détail créer un effet négatif invisible pour les joueurs et devient ainsi une contrainte pour équilibrer des compétences ou en créer de nouvelles :
- utiliser vent vif alors que le Dinoz est déjà dans l'état accéléré est discutable,
- utiliser printemps précoce alors que le Dinoz est tout seul est discutable,
- etc.

C'est pour ces raisons qu'un changement a été fait pour supprimer cet effet négatif et améliorer la logique de certaines compétences.

### Limite de "combo"

Dans le fonctionnement originale du jeu, selon le code source publié par Motion Twin, un compteur de "combo" existe.

Celui-ci augmente de 1 pour:
- un nouveau tour du combattant
- le combattant inflige des dégâts à une cible:
  - pour les compétences, l'incrément se fait pour chaque combattant touché
  - chaque assaut, multicoup et contre

Puis une limite de 10 est fixée pour imposer au combattant de passer son tour s'il a atteint cette limite (lors d'un nouveau tour, d'une compétence ou d'une série de multicoups).

Il est possible que le code source partagée par Motion Twin ait mal été compris. Néanmoins, cela a donne lieu à des incompréhensions de la part des joueurs.

Il semblerait que cette limite ait été instaurée avant l'apparition du système d'énergie et n'ait pas été retirée.

Cet équilibrage est l'opportunité de revoir cette limtie et de la remplacer par d'autres mécanismes, notamment basés sur l'énergie.

### Équilibrage des multicoups

Avec seulement coup double pour augmenter les chances de multicoups, on peut facilement rater le dessous de l'iceberg de cette attribut et ignorer les 5 à 6 coups d'affilés en invoquant une histoire de chance.

Le système de multicoups est tel que chaque coup a autant de chance que le précédent d'avoir lieu, sans autre limitation. Ainsi avec en théorie 100% de chance, le dinoz infligerait des coups à l'infini.

Due aussi de la nature de l'attribut qui est multiplicatif ("plus on en a, plus on en a"): ajouter de nouvelles sources de multicoups devient un calvaire voire un risque de déséquilibrage majeur.

Plusieurs changements sont proposés dans un premier temps:
- dans l'évalutation d'une tentative de multicoup, un combattant ne peut pas dépasser 90% de chance,
- chaque multicoup décroit la chance du prochain multicoup de moitié (ce ratio sera probablement ajustée),
- pour chaque multicoup, le coût en énergie augmente de 2 (le coup de base d´un coup),
- le combattant doit être en vie (i.e que des effets défensifs peuvent l'avoir tué entre temps)
- le combattant doit avoir suffisemment d'énergie pour effectuer un multicoup.

Exemple: un combattant A avec 50% de multicoup et 100 d'énergie
- le combattant lance un assaut: le coût en énergie est 4 (energie d'un assaut) + 2 (energie du coup) soit 6, il a 50% de chance de faire un multicoup (50% / 2^0)
- le combattant fait un multicoup: le coût en énergie est 2 (enegie du coup) + 2 * 1 pour le multicoup soit 4 supplémentaire, il a 25% de chance de faire un multicoup (50% / 2^1)
- le combattant fait un autre multicoup: le coût en énergie est 2 + 2 * 2, il a 12.5% de chance de faire un multicoup (50% / 2^2)

Coût total en énergie: 6 + 4 + 6 = 16

Ce changement devrait permettre de continuer de rajouter des bonus en multicoups dans le future.

### Équilibrage des contres

Similairement au multicoup, plusieurs solutions sont proposées pour éviter les contres abusifs :
- dans l'évalutation d'une tentative de contre, un combattant ne peut pas dépasser 90% de chance,
- un combattant ne peut pas contrer s'il n'a pas l'énergie nécessaire pour effectuer un coup,
- un combattant doit être en vie pour contrer.

Ce changement devrait permettre de continuer de rajouter des bonus en multicoups dans le future.

### Équilibrage des esquives

Dans l'évalutation d'une tentative d'esquvie, un combattant ne peut pas dépasser 90% de chance.

# Liste des changements par arbre

Liste des changements et de quelques notes explicatives.

Ces changements se basent sur l'introduction de nouvelles mécaniques ou le changement de mécaniques existantes :
- l'armure et les armures élémentaires,
- la capacité d'ignorer l'armure (global et par élément),
- les esquives élémentaires,
- les super esquives élémentaires,
- les contres élémentaires,
- les multi-coups élémentaires.

Chacun a une forme globale, les autres formes s'ajoutent multiplicativement.

Les armures, esquives et super esquives élémentaires ne contribuent que lorsque les attaques subis sont du même élément.

La capacité élémentaire d'ignorer l'armure ne contribue que pour les attaques effectuées du même élément.

Les contres et multi-coups élémentaires dépendent de l'élément actuel du Dinoz dans sa roue élémentaire.

Ces mécaniques ne sont pas définitives et peuvent toujours être modifiées.

Introduction d'une limite à 90% aux effets suivants: armure (cumulée global & élémentaires), esquive (idem), super esquive (idem), contre (idem).

Autres changements notables :
- Coût en énergie des compétences T1:
Il peut être préférable de désactiver les compétences pour conserver de l'énergie. Néanmoins, leurs effets sont faibles pour leur coût en énergie. Le coût en énergie des compétences T1 dans son ensemble a été revu pour être plus cohérent.
- Les compétences de récoltes donnent un bonus passif basé sur l'élément de l'arbre
  - 1ère donne 3 en défense
  - 2e donne 10 PV et 1 point d'élément
  - 3e donne 5% d'armure et 2 points d'élément

Les \* marques les suggestions de l'amphithéatre qui ont été reprises.

Si une compétence n'est pas mentionnée, cela veut dire qu'elle n'a pas été modifiée.

## Feu

L'arbre Feu est déjà complet. Mais sa branche Self-Control & Brave domine sur les deux autres.

Un effort a été fait pour revaloriser les 2 autres branches et inciter les joueurs à les utiliser dans leurs plans en ré-équilibrant des compétences existantes et via les nouvelles compétences T5.

Mouvements:
- paume chalumeau est débloqué après charge,
- bélier est inversé avec kamikaze,
- coeur de phoenix devient T1, braséro T2, détonation T3.

### T1 Colère

Coût en énergie réduit de 20 à 10

### T2 Souffle Ardent

Priorité ajustée de 1 à 2.

### T2 Charge

Ancien effet: (P) la puissance du premier assaut est augmentée de 5.

Nouvel effet:
(A) lance un assaut avec un bonus de Feu 2 et s'applique aussi aux multicoups de l'assaut.
- énergie 20
- priorité 2
- probabilité 20

Note: La compétence était vraiment faible, avec un effet mineur pour un seul et unique assaut. Elle aide légèrement en PvE mais l'impacte est minimale voir inexistante en PvP. 

### T2 Furie

Ancien effet: (P) Augmente la puissance de tous les assauts de 3 et diminue toutes les défenses de 2

Nouvel effet: (S) À chaque dégât direct subit, le Dinoz a 20% de chance d'augmenter la puissance de son prochain assaut de 3.

Note: avec Arts Martiaux, la compétence manquait d'originalité.

### T2 Chasseur de Goupignon

Effet supplémentaire: Augmente la défense en Feu de 3.

### T2 Arts Martiaux\*

Effet supplémentaire: Augmente la défense en Feu de 1.

### T3 Vigilance

Effet supplémentaire: Augmente les PV max de 20.

### T3 Bélier\*

Ancien effet: (P) Augmente la puissance du premier assaut de 20.

Nouvel effet: (P) les assauts ignorent 20% d'armure.

Autre changement:
- Bélier devient T3 et permet de débloquer Kamikaze

Note: comme charge, la compétence manquait d'utilité en PvP.

### T3 Paume Chalumeau\*

Effet supplémentaire: détruit 5% de l'armure de l'adversaire.

Autre changement: Désormais débloquée après charge.

### T3 Chasseur de Géant

Effets supplémentaires:
- Augmente les PV max de 10,
- Augmente l'élément Feu de 1.

### T3 Coulée de Lave

Priorité ajustée de 8 (!) à 3.

### T3 Combustion

Priorité ajustée de 1 à 3.

### T3 Boule de Feu

Priorité ajustée de 2 à 3.

### T3 Sieste\*

Priorité ajustée de 1 à 3.
Soin minimum augmentée à 10.

### T4 Chef de Guerre\*

Ancien effet: (P) Augmente la puissance des assauts de tout le groupe de 2.

Nouvel effet: (U) Augmente la puissance des assauts de tous les Dinoz de 2.

Note: Il manquait à l'arbre Feu une compétence universelle. Chef de Guerre a été identifié comme la meilleure solution. La compétence était également faible pour une T4. Le changement permet à la fois de garder l'esprit de la compétence tout en la rendant plus accessible.

### T4 Riposte

Nouvelle compétence T4 spéciale: débloquée aprèa waïkikido.

Le Dinoz a 50% de chance d'interrompre un enchainement (i.e à partir du moment où l'adversaire fait un multi-coup) et réalise un contre. Ne fonctionne pas si le Dinoz est pétrifié, endormi ou étourdit.

### T4 Kamikaze\*

Ancien effet: (A) Attaque un ennemi avec un pouvoir de Feu 15 puis le Dinoz perd la moitié de sa vie actuelle.

Nouvel effet: (A) Attaque un adversaire avec un pouvoir de puissance 15, sacrifie 10% de ses PV max puis étourdit la cible pendant une durée moyenne.

Autres changments:
- devient T4, débloquée après bélier,
- priorité ajustée de 1 à 4.

Note: la perte de points de vie de kamikaze rendait la compétence totalement suicidaire, en réduisant la perte de points de vie puis en donnant un étourdissement, l'idée est de renouveler l'intérêt pour cette compétence.

### T4 Chasseur de Dragon

Effets supplémentaires :
- augmente l'armure de 5%,
- augmente l'élément Feu de 2.

### T4 Torche\*

Changements :
- devient une compétence E:
  - énergie: 20,
  - priorité 4,
  - probabilité: 10%,
  - 
  - si le combattant a déjà l'état torche, la compétence ne se déclenche pas.

Note: Torche est une compétence forte dans l'arbre Feu et prisée. Mais une fois éteinte, pouf, plus rien. L'idée est de revaloriser la compétence en permettant au Dinoz de se rallumer. Mais d'autres compétences vont pouvoir l'éteindre. Pour équilibrer la compétence, la durée passe de infinie à longue et le Dinoz ne commmence pas avec l'état Torche.

### T4 Self-Control

Effet devient:
Immunité au stun, au sommeil et aux prises de contrôle (hypnose, nécromancie).
Losque le Dinoz va devenir étourdit ou endormi, à la place il gagne 3 d'initiative.

Variante à tester:
À l'application d'un statut négatif, le Dinoz a X % de chance d'être immunisé contre celui-ci et cela lui coutera N en énergie. Si le Dinoz n'a pas l'énergie suffisante, la compétence ne peut pas se déclencher.

Note: voir [analayse de Self-Control](#Self-Control)

### T5 Rage

Nouvelle compétence T5 spéciale: débloquée après Kamikaze
Lorsque le Dinoz perd plus de 10% de ses PV max sur une attaque directe, immédiatement:
- il se purifie de tous ses status négatifs,
- il regagne 10 points d'énergie,
- il gagne 6 d'initiative,
- il devient enragé pour une durée courte:
  - il gagne 25% de puissance à tous les assauts,
  - il gagne 20% de vitesse,
  - il gagne 20% de contre.

### T5 Brasier

Nouvelle compétence T5 A: débloquée après Torche
- énergie: 40,
- priorité: 5,
- probabilité: 8.

Le Dinoz invoque 1 flamèche tout les 9 points dans son élément Feu. Les flamèches ont 1/9 de l'élément Feu du Dinoz et le statut Torche.

### T5 Brave

Note: La compétence est très forte car son défaut peut être contourné. La logique du Dinoz solitaire combattant seul a été poussée et encouragée en substituant une part des bonus fixes pour des bonus si le Dinoz est effectivement seul. Néanmoins, la restriction de ne pas pouvoir rejoindre un groupe est gardée.

Les bonus fixes sont revus à la baisse:
- Bonus PV: 50 -> 20
- Bonus Feu: 6 -> 3
- Bonus vitesse: inchangé

Nouveaux bonus:
Si le combattant est effectivement seul, il gagne en plus:
- 12 d'initiative
- 15% de vitesse supplémentaire
- 20% de bonus à tous les assauts

### Sphères

Coeur du Phoenix dans son effet actuel ressemble à une T1 sphèrique.

#### T1 Coeur du Phoenix

La compétence passe T1.\*

Effet supplémentaire: augmente la défense en Feu de 3.

#### T2 Braséro

Braséro est une compétence très forte permettant de faire de lourd dégâts pour une compétence évènement.

La compétence passe T2 derrìere Coeur du Phoenix.
La priorité passe de 1 à 2.
Le coût en énergie passe de 30 à 35.
La probabilité passe de 25 à 20.

#### T3 Détonation

La compétence passe T3 derrìere Braséro.
La priorité passe de 1 à 3.

## Bois

L'arbre Bois possède le moins de compétence "utile" en combat avec 2 compétences U, 5 C, 2 compétences pour augmenter la taille du groupe et 1 compétence de repos. Un effort a été fait pour revaloriser toutes les compétences afin qu'elles aient également un effet en combat.

Les nouvelles compétences visent à rajouter de nouvelles mécaniques de défense ou d'attaque pour rendre l'arbre plus intéressant en général et rattraper le retard sur les autres arbres.

Des dépendances ont été introduites entre les compétences pour éviter que "rush" une compétence donne un avantage trop grand comme Sumo/Griffes Empoisonnées.

En résumé, l'arbre a été améliorée sur de nombreux aspects.

Compétence déplacée :
- esprit gorilloz est inversé avec état primal.

### T1 Carapace\*

Bonus changée de 1 point d'armure à 5% d'armure.

### T2 Sympathique

Effet supplémentaire: augmente les chances d'utiliser une compétence de renfort de 5%.

### T2 Vignes\*

Note: vignes est un "goto" très facile et commun dans l'arbre Bois. Mais l'effet est aussi très fort en 1v1 car elle permet d'enchainer les coups sur son adversaire.

Effet modifié: diminue l'initiave de 6 au lieu de 15.

### T2 Fouille

Effet supplémentaire :
- Augmente la défense en Bois de 3.

### T2 Renforts Korgon

Priorité ajustée de 3 à 2.

Changement : le korgon appelé en renfort gagne 1% de vitesse pour chaque point dans l'élément Bois du Dinoz.

Note: la compétence ne s'améliorait pas avec les gains de niveau du Dinoz contrairement à des compétences tels que Canon à Eau. Le changement proposé essaye de traiter d'une manière simplement explicable.

### T3 Garde Forestier

Effets ajustés :
- bonus d'armure de 5%,
- bonus de défense en Bois de 3,
- les bonus sont cumulables si plusieurs combattants ont la compétence,
- les bonus affectent aussi les renforts qui rejoignent durant le combat.

### T3 Planificateur

Effets supplémentaires :
- augmente l'énergie maximum de 10%,
- augmente la récupération d'énergie de 10%.

### T3 Printemps Précoce

Priorité ajustée de 2 à 3.

Si le combattant est tout seul, la compétence ne se déclenche pas.

### T3 Esprit Gorilloz

Priorité ajustée de 4 à 3.

Changements :
- de base, l'esprit qui rejoint le combat n'est pas intangible, sauf si le Dinoz possède la compétence Géant (des Forêts),\*
- l'esprit appelé en renfort gagne 1 de puissance à tous les assauts tous les 2 points en Bois du Dinoz,
- l'esprit appelé en renfort gagne 1 PV max tous les 2 points en Bois du Dinoz.

Note: la compétence ne s'améliorait pas avec les gains de niveau du Dinoz contrairement à des compétences tels que Canon à Eau. Le changement proposé essaye de traiter d'une manière simplement explicable.

### T3 Cocon

Note: la compétence n'avait pas d'utilité hors combat.

Effet supplémentaire évènement:
- énergie: 25,
- priorité: 3,
- probabilité: 10,
- effet: regagne jusqu'à autant de points de vie que son élément Bois et augmente son armure de 5% pour le reste du combat.

### T3 Large Machoire

Effet supplémentaire:
- les assauts ignorent 5% de l'armure.

### T3 Détective

Effets supplémentaires:
- Augmente les PV max de 10,
- Augmente l'élément Bois de 1.

### T3 Expert en Fouilles

Effets supplémentaires:
- Augmente la vitesse de 5%,
- Augmente l'élément Bois de 1.

### T3 Acrobate

Effet modifié:
- bonus de vitesse 15 -> 10%,
- ajout d'un bonus d'esquive de 10%.

Note: la compétence donnait le même bonus que Célérité (T1 Foudre). La compétence a été revalorisée pour insister que vaut plus qu'une T1 tout en donnant un bonus d'esquive qui correspond avec son nom.

### T3 Charisme

Effet supplémentaire:
Après un assaut réussi et non-contré, le Dinoz appelle l'aide de *ses* renforts pour attaquer la cible dans le même tour.

### T3 Héritage Faroe\*

Effet modifié: 5% d'armure.

### T4 Provocation\*

Nouvelle compétence T4 (A):
- énergie: 40
- priorité: 4,
- probabilité: 10,
- effets: gagne 30% d'armure et devient la cible privilégiée des assauts adverses pendant une durée moyenne.
- Si le combattant est déjà dans l'état "provocation", la compétence ne se déclenche pas.

### T4 État Primal

Note: à cause de la priorité, la compétence est en conflit avec Printemps Précoce, d'autres parts son effet est plus digne d'une T4 (en comparaison de Purée Salvatrice ou Résistance à la Magie)

Changements:
- la compétence devient T4 débloquée après Esprit Gorilloz,
- priorité ajustée de 3 à 4.

### T4 Géant (des Forêts)

Effets supplémentaires :
- augmente l'élément Bois de 1,
- les Esprits Gorilloz appelés en renfort sont intangibles pour une durée infinie.\*

### T4 Archéologue

Effets supplémentaires :
- augmente l'armure de 5%,
- augmente l'élément Bois de 2.

### T4 Forcebrute\*

Nouvelle compétence (A):
- Débloquée après Instinct Sauvage,
- Énergie: 20,
- Priorité: 4,
- Probabilité: 9,
- Effet: réalise un assaut avec un bonus Bois de 3 et qui ignore 100% de l'armure.

### T4 Gardien Arboricole\*

Nouvelle compétence T4 (E):
- Débloquée après Héritage Faroe,
- Énergie: 60,
- Priorité: 4,
- Probabilité: 5,
- Effet: Appelle en renfort un jeune gardien arboricole (40 PV et sans la compétence météore).
  - Si le Dinoz possède la compétence Colosse (des Forêts), le gardien appelé en renfort est adulte (avec la compétence météores),
  - Le gardien appelé en renfort gagne 1% d'armure pour chaque point dans l'élément Bois du Dinoz.


### T5 Maitre des Ronces\*

Nouvelle compétence T5 (S):
- Débloquée après État Primal,
- Effets:
  - Le Dinoz est protégé par des Ronces, à chaque assaut subit, l'attaquant a 50% de chance d´être entravé par les ronces, i.e il perd 1 point d'initiative et subit des dégâts relatifs à l'élément Bois du Dinoz,
  - Augmente l'armure de 10%,
  - Augmente l'élément Bois de 1.

### T5 Colosse (des Forêts)

Effets supplémentaires:
- augmente l'élément Bois de 1,
- les Gardiens Arboricoles appelés en renfort sont adultes (80 PV et avec la compétence Météore),\*
- les Gardiens appelés en renfort gagne 1 PV max pour chaque point dans l'élément Bois du Dinoz.

### T5 Écorce Centenaire

Nouvelle compétence T5 (P):
- débloquée après Forcebrute,
- augmente la défense en Bois de 10,
- augmente l'élément Bois de 1,
- augmente l'armure contre le Feu de 20%.

### Sphères

#### T1 Lanceur de Glands

Priorité ajusté de 3 à 1.
Énergie ajustée de 25 à 10.

#### T2 Gratteur -> Griffes Métalliques

Effet supplémentaire :
- augmente l'armure de 5%.

#### T3 Grosse Beigne

Priorité ajusté de 4 à 3.

## Eau

Avec 2 compétences U, l'arbre Eau contient de nouvelles compétences T4.

Des ajustements ont été fait pour essayer de résoudre les [problèmes identifiés](#problèmes-identifiés): notamment Sumo et Griffes Empoisonnées qui sont nerfs. En contrepartie, l'arbre Eau s'offre de nouvelles mécaniques pour rester compétitifs et intéressés les joueurs à explorer d'autres options.

### T1 Canon à Eau

Énergie ajustée de 5 à 10.
Probabilité réduite de 25 à 20.

### T1 Perception\*

Changements:
- n'annule plus les effets supplémentaires de Coup Sournois et Coup Fatal,
- CHANGEMENT TEMPORAIREMENT ANNULÉ - seulement les assauts Eau peuvent enlever l'état intangible (au lieu de tous les assauts)

Note: de par son universalité, perception rendait l'état intangible et une partie de l'arbre Air inutile, ce qui aurait complexifié (si garder en l'état) l'équilibrage de l'arbre Air. Néamoins de part la nature de l'état intangible, cet effet est difficile à équilibrer.

### T1 Mutation\*

Changement:
- bonus de points de vie ajustée de 30 à 20.

### T2 Douche Écossaise

Note: Douche Écossaise est une compétence redoutable contre des groupes, elle fait des dégâts raisonables, avec un faible coût en énergie et avec de fortes chances de déclenchement. Ainsi, la compétence peut facilement compter pour plus de 50% des dégâts effectués par un Dinoz contre un groupe (mieux que Rayon Kaar Sher ou Déluge). Certains paramètres ont été ajustée pour rendre la compétence moins décisive.

Changements :
- énergie ajustée de 20 à 25,
- priorité ajustée de 1 à 2,
- probabilité ajustée de 40 à 25.

### T2 Gel\*

Effet supplémentaire:
- la compétence éteint Torche au lieu de ralentir si la cible a torche.

### T2 Apprenti Pêcheur

Effet supplémentaire :
- Augmente la défense en Eau de 3.

### T2 Coup Sournois

Changements :
- priorité ajustée de 3 à 2,
- l'effet secondaire devient: la cible perd 5% de ses points de vie max,\*
- l'effet secondaire a moins de chance de se déclencher plus la cible a de l'armure.

### T2 Poche Ventral

Effet supplémentaire :
- augmente les PV max de 20.

### T3 Pétrification

L'état pétrifié augmente l'armure de 50%.

### T3 Zéro Absolu

Effet Supplémentaire:
- le Dinoz a 5% de chance de ralentir son aggresseur pour une courte durée lorsqu'il est attaqué par un assaut.

### T3 Marécage

Changement:
- l'effet ne touche pas les ennemis en vol.

### T3 Pêcheur Confirmé

Effets supplémentaires :
- Augmente les PV max de 10,
- Augmente l'élément Eau de 1.

### T3 Coup Fatal

Changements :
- priorité ajustée de 4 à 3,
- probabilité ajustée de 2 à 7,
- effets:
  - la compétence *remplace* coup sournois,\*
  - détruit 10% de l'armure de l'adversaire,
  - l'effet secondaire inflige 10% des PV max.

### T3 Entrainement Sous-Marin

Effets supplémentaires:
- augmente la défense en Eau de 3,
- immunise contre les ralentissements.

### T3 Clone Aqueux

Priorité ajustée de 8 (!) à 3.

La compétence subit un nerf indirect à cause de l'addition de [conditions bloquantes](#conditions-bloquantes).

### T3 Griffes Empoisonnées

Dégâts de poison ajustée avec la formule suivante:
- Base: Élément Eau divisé par 2,
- Équilibrage: Puissance 0,6,
- Minimum: 1.

En résumé: (Eau/2)^0.6

Note: les dégâts ont été ajustée sur le même modèle que Sang Acide afin de résoudre [le problème des poisons](#poisons)

### T3 Sumo

Changements :
- bonus de points de vie ajusté de 100 à 50,
- ajout d'un malus de vitesse de 10%.

### T3 Branchies

Nouvelle compétence T3 Passive débloquée après douche écossaise (remplace Sapeur):
- augmente l'élément Eau de 2.

### T4 Malédiction Acqueuse

Nouvelle compétence spéciale débloquée après acuponcture.
Chaque assaut et pouvoir Eau a 10% de chance d'appliquée l'état insoignable pour une durée moyenne.

### T4 Rayon Kaar Sheer

Priorité ajustée de 1 à 4.
Probabilité réduite de 20 à 15.

### T4 Maitre Pêcheur

Effets supplémentaires :
- augmente l'armure de 5%,
- augmente l'élément Eau de 2.

### T4 Entrainement Sous-Marin Avancé

Effet supplémentaire :
- augmente l'armure de 10%.

### T4 Sang Acide

Changement :
La probabilité de déclenchement de la compétence est réduit de une chance sur deux à une chance sur trois.

### T4 Décomposeur

Nouvelle compétence spéciale T4 :
- débloquée après Sans Pitié,
- effet: lorsque une cible est vaincue par un assaut, le Dinoz regagne 10% des points de vie max de la cible. Cela ne fonctionne pas sur les clones mais fonctionne sur les renforts.

### T5 Onde de Vie

Nouvelle compétence spéciale T5 :
- débloquée après [Compétence T4 à déterminer après acuponcture]
- pour chaque assaut et pouvoir Eau qui touche une cible, le Dinoz regagne 1 PV.

### T5 Nécroman

Nouvelle compétence activable T5 :
- débloquée après Décomposeur,
- énergie: 50,
- priorité: 5,
- probabilité: 50,
- effet: ramène à la vie un allié ou un opposant dans son camp avec 10 points de vie, il ne peut pas être soignée. L'effet ne peut se produire qu'une seule fois par Dinoz ou Monstre, ne peut pas se déclencher sur les renforts ou les clones,
- s'il n'y a pas de combattant mort, la compétence ne se déclenche pas.

## Foudre

L'arbre Foudre a servi de modèles d'une certaine facon au modèle 3-6-12-6-3 (3 T1, 6 T2, 12 T3, 6 T4 et 3 T5). Il illustre très bien la difficulté à équilibrer une arbre qui n'a pas une forme symétrique:
- la branche Focus offre des bonus et effets uniques et puissants mais nécessaite beaucoup plus d'investissements. Elle est plus "high risk/high reward".
- la branche Célérité est très bonne, facile à atteindre, et comble du tout, elle donne accès à plan de carrière et réincarnation. Impossible de se tromper en la privilégiant.
- en comparaison, la branche intelligence est juste inutile, sauf pour un Rocky niveau 50, et encore, un joueur pourrait préférer avoir autre chose que des UP foudre.

L'amphithéâtre a eu la brillante idée d'explorer des branches à thème: celle orientée Feu avec Crépuscule Flamboyant et Archange Corrosif, celle orientée "vie"/soins avec Aube Feuillue et Archange Génésif, puis inventer une troisième branche orientée vitesse/status avec Décharge et Archange Evasif.

Il en découle beaucoup de mouvements dans l'arbre.

Concernant plan de carrière et réincarnation, le parti pris est de ne pas les compter dans le modèle 3-6-12-6-3 et de les rendre plus accessible via la branche intelligence.

### T1 Focus

Énergie ajustée de 20 à 10.

### T2 Régénérescence

Effet supplémentaire:
- évènement (E)
- énergie: 20,
- priorité : 2,
- probabilité: 15,
- effet: donne le statut "soins" pour une durée moyenne.
- si le combattant a déjà l'état "soins", la compétence ne se déclenche pas.

### T2 Paratonnerre

Effet supplémentaire :
- Augmente la défense en Foudre de 3.

### T2 Premiers Soins -> Revitalisation

Premiers soins est renommée Revitalisation.

Effet supplémentaire :
- soigne 1 points de vie pour chaque assaut foudre.

### T2 Plan de Carrière

Devient T2, débloqué après intelligence.

### T3 Foudre

Changements :
- Débloquée après Concentration,
- Priorité ajustée de 4 à 3.

### T3 Aura Hermétique

Changements :
- Priorité ajustée de 1 à 3,
- Bonus d'armure ajustée de 5 (50%) à 30%,
- Durée ajustée de court à moyen.
 
### T3 Voie de Gaïa\*

Changements :
- débloquée après Paratonnerre.

### T3 Fission Élémentaire

Effets supplémentaires :
- Augmente les PV max de 10,
- Augmente l'élément Foudre de 1.

### T3 Brancardier\*

Effet supplémentaire :
- évènement (E)
- énergie: 20,
- priorité : 3,
- probabilité: 25,
- effet: rend 5 PV à un allié,
- si le combattant est tout seul, la compétence ne se déclenche pas.

### T3 Crocs-Diamant\*

Effet supplémentaire : chaque assaut réduit l'armure de la cible de 1%.

### T3 Voie de Kaos

Effet supplémentaire : augmente les poins de vie de 15.

### T3 Voie de Gaia

Effet supplémentaire : augmente les poins de vie de 15.

### T3 Voie d'Ouranos

Nouvelle compétence Passive:
- débloquée après Attaque Éclair,
- augmnente la vitesse Air et la vitesse Foudre de 25%,
- augmente les points de vie de 15.

### T3 Réincarnation

Devient T3, toujours débloqué après Plan de Carrière.

### T3 Flash\*

Nouvelle compétence spéciale : chaque assaut a 5% de chance d'aveugler la cible pour une courte durée.

### T4 Bénédiction

Ancien effet: bonus de +3 en assaut pour chaque élément.

Nouveaux effets:
- si le Dinoz est affecté par un statut négatif alors qu'il est béni, il perd sa bénédiction mais ne recoit pas le statut négatif
- bonus de +10 pour tous les assauts

Priorité ajustée de 3 à 4.

### T4 Aube Feuillue

Le pouvoir du soin est réduit de 2 à 1 en Foudre et Bois.

Priorité ajustée de 3 à 4.

### T4 Médecine

Effet supplémentaire : augmente les soins recus de 100%.

### T4 Décharge

Nouvelle compétence spéciale : Le Dinoz a 10% de chance de répliquer à toute source dégâts directes par une décharge électrique: la cible de la décharge subit des dégâts relatifs aux éléments Foudre et Air du Dinoz (soumis à équilibrage) et est étourdit pour une très courte durée.

Débloqué après Voie d'Ouranos.

### T4 Parafoudre

Nouvelle compétence T4 évènement débloquée après danse foudroyante:
- énergie : 50,
- priorité : 4,
- probabilité : 12,
- effet : Le Dinoz obtient le pouvoir de la Foudre elle-même pour une durée moyenne: son élément est bloqué sur l'élément Foudre.
- si l'élément du Dinoz est déjà bloqué, la compétence ne se déclenche pas.

### T5 Archage Corrosif

Effets supplémentaires :
- augmente les chances de contre de 5% ,
- augmente les chances de contre Foudre de 5%.

### T5 Archage Génésif

Effets supplémentaires :
- augmente l'armure de 5%'
- augmente l'armure Foudre de 5%.

### T5 Archage Evasif

Effets supplémentaires :
- augmente les chances d'esquive de 5% ,
- augmente les chances d'esquive Foudre de 5%.

## Air

L'arbre Air, comme l'arbre Foudre, a des spécificités dans sa forme qui l'on rendu très peu attractif. L'Arbre possède des compétences fortes mais qui sont soit désactivée d'office dans certains modes (tel Trou Noir en dojo) ou d'autres  qui sont soit trop forte soit complètement annulée (perception & forme vaporeuse, ou les poisons et Self-Control & piqûres).

Dans l'ensemble, il y a eu peu d'ajouts mais un effort a été fait pour rendre les compétences Air plus viables et intéressantes même pour les Dinoz avec peu d'affinités avec l'Air.

Dans les suggestions qui suivent :
- Éveil a été supprimée pour faire coller l'arbre avec le modèle 3-6-12-6-3,
- Vent-Vif et Tornade ont été inversé.

### T1 Stratégie

Note: Bien qu'originale, la compétence avait un impact quasi nul sur les combats, une refonte est donc proposée.

Ancien effet :

Nouvel effet : réduit la consommation en énergie des compétences de 10%.

### T1 Mistral\*

Cout en énergie réduit à 10.

### T2 Analyse

Note : Tout comme stratégie, l'impacte de la compétence en combat était minime.

Ancien effet :

Nouvel effet : ignore 10% de l'armure adverse.

### T2 Cueillette

Effet supplémentaire :
- Augmente la défense en Air de 3.

### T2 Tai-Chi

Effet supplémentaire : Augmente la puissance des pouvoir Air de 15.

### T2 Vent Vif

Devient T2.

Ajustement : si le combattant a déjà l'état accéléré, la compétence ne se déclenche pas.

### T3 Disque Vacuum

Priorité ajustée de 8 à 3.

### T3 Élasticité

Effet supplémentaire : augmente les PV max de 20.

### T3 Furtivité

Effet supplémentaire : augmente l'esquive de 5%.

### T3 Attaque Plongeante

Effet modifié : le bonus Air passe de 2 à 3 et s'applique aussi aux multicoups líees à l'attaque.

### T3 Spécialiste

Ancien effet :
Supprime l'élément le plus faible de la roue élémentaire du Dinoz

Nouvel effet :
*Remplace* l'élément le plus faible par le plus fort de la roue élémentaire du Dinoz.

### T3 Talon d'Achille\*

Ancien effet : augmente la puisance de tous les assauts de 2.

Nouvel effet :
- compétence évènement
- énergie : 20,
- priorité : 3,
- probabilité : 10,
- effet: donne l'état affaibili à un opposant pour une durée moyenne.

L'état affaibli fait que la défense la plus faible est prise en compte lors du calcul des dégâts. 

### T3 Nuage Toxique

Dégâts de poison ajustée avec la formule suivante:
- Base: Élément Air,
- Équilibrage: Puissance 0,6,
- Minimum: 1.

En résumé: Air^0.6.

Note: les dégâts ont été ajustée en utilisant la puissance 0.6 afin de résoudre [le problème des poisons](#poisons)

### T3 Oeil de Lynx

Effets supplémentaires :
- Augmente les PV max de 10,
- Augmente l'élément Air de 1.

### T3 Méditation Solitaire\*

Effets supplémentaires :
- augmente l'esquive de 5%,
- augmente la défense en Air de 3,
- augmente l'élément Air de 1.

### T3 Rafale

Nouvelle compétence passsive T3 :
- débloquée après Taï-Chi,
- effets:
  - augmente les multi-coups Air de 30%,
  - augmente l'élément Air de 1.

### T3 Tornade\*

Note: tornade est une compétence avec un fort potentiel mais comme elle était en T2, sa probabilité était basse. La compétence a été passée en T3 afin de justifier l'augmentation de sa probabilité.

Priorité ajustée de 5 (!) à 3.
Probabilité ajustée de 3 (!) à 8.
Effet supplémentaire : les ennemis touchés sont étourdis pour une courte durée.

### T3 Forme Vaporeuse\*

Nouveaux effets :
- le Dinoz commence le combat avec le statut intangible pour une durée moyenne,
- augmente l'élément Air de 1.

### T4 Tempête\*

Nouvelle compétence T4 spéciale: le Dinoz a 30% de chance d'empêcher l'arrivée d'un renfort ou clone.

### T4 Maitre Levitateur

Ancien effet : permet à tout le groupe d'attaquer les ennemis volants.

Nouvel effet :
- compétence évènement,
- énergie: 30,
- priorité 4,
- probabilité: 7,
- effet: permet à tout le groupe de s'envoler pour une durée courte.

### T4 Paume Éjectable

Changements :
- débloqué après spécialiste,
- priorité ajustée de 2 a 4,
- nouvel effet :
  - lance un assaut avec une puissance doublée (affecte aussi les multi-coups de l'assaut),
  - si la cible est touchée, elle perd 6 d'initiative et tout ses status positifs.

### T4 Haleine Fétive

Ancien effet : chaque assaut applique un poison basé sur l'élément Air du Dinoz,

Nouvel effet : chaque assaut sur un opposant a 50% de chance d'infliger des dégâts supplémentaires basés sur l'élément Air du Dinoz (soumis à équilibrage)

### T4 Méditation Transcendantale\*

Effets supplémentaires :
- augmente l'esquive de 10%,
- augmente la défense en Air de 6,
- augmente l'élément Air de 2.

### T4 Forme Éthérale

Reprend l'ancien principe de forme vaporeuse avec un léger buff (6 -> 8% de chance):
Le Dinoz a 8% de chance de devenir intangible pour une durée courte juste avant de subir une attaque.

### T5 Trou Noir

Note : le changement n'est pas implémenté car il nécessite des changements dans l'affichage du combat (aussi car je galère à l'implémenter, LOL)

Ancien effet : le combattant disparaît du combat dans un trou noir

Nouvel effet envisagé : le combattant disparaît pendant 5 cycles, ou dès qu'il n'y a plus d'autres combattants en vie, puis revient et subit les dégâts d'un pouvoir Air de puissance 15. Fonctionne s'il n'y a qu'un seul combattant en face, il revient juste immédiatement sur le terrain.
Limite de un seul trou noir actif à la fois.

### T5 Souffle de Vie

Changements :
- débloqué après haleine fétive,
- immunité aux poisons et aux malédictions
- augmente les PV max de 20,
- augmente l'élément Air de 2,
- gagne 1 PV par dégâts de poison infligé par ses propres poisons

### T5 Brouillard Éthérale

Nouvelle compétence T5 activable :
- débloquée après forme éthérale,
- énergie : 60,
- priorité : 5,
- probabilité : 7,
- effet: rend tout le groupe intangible pour une durée courte.

### Spécial

#### T1 Envol

Coût en énergie réduit de 20 à 10

#### T2 Décollage d'urgence

COMPÉTENCE TEMPORAIREMENT DÉSACTIVÉ
Le dinoz a 5% de chance de s'envoler juste avant de subir un assaut

### Sphères

#### T1 Aiguillon

Note: le coup en énergie était rédibitoire pour cette compétence

Changements :
- énergie ajustée de 35 à 10,
- probabilité ajustée de 15 à 40,

#### T2 Aura Puante

Dégâts de poison ajustée avec la formule suivante:
- Base: Élément Air divisé par 4,
- Équilibrage: Puissance 0,6,
- Minimum: 1.

En résumé: (Air / 4)^0.6.

Durée du poison devient très courte (1 cycle) donc 1 seul tick de poison au total.

### T3 Hypnose

Dans le but de rendre hypnose utilisable en Dojo, le changement suivant est proposé:
Hypnose se termine immédiatement si il n'y a plus d'alliés vivants dans le camp d'origine du combattant hypnotisé.

## Autres changements

### Catégorie de compétences

Les catégories C, S et P ont été légèrement modifiés pour avoir la logique suivante:
- C devient R pour Récolte,
- S devient C pour Conditionnée, i.e des compétences qui ont un effet qui se produit dans certains conditions (comme forme vaporeuse)
- certains compétences S deviennent P ou autre, comme Torche qui devient E, ou Poche Ventrale qui devient P.

### Coque (Winks)

Effet modifié: Augmente l'armure de 10%
