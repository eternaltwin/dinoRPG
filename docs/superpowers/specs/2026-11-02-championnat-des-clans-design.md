# Championnat Des Clans (CDC) — Design

> Statut : design validé le 2026-11-02. Les points marqués **[choix Claude]**
> ont été tranchés par Claude et non par l'utilisateur.

## Intention

Proposer aux clans un mode compétitif **coopératif et asynchrone**. Au sein
d'un clan, les joueurs discutent entre eux pour coordonner leurs dinoz sur un
damier : ils doivent faire avancer leur ligne de score tout en contenant celle
de l'adversaire, et ils lancent des attaques synchronisées. Le plaisir du mode
vient de la coordination d'équipe, qui doit compter davantage que la puissance
brute d'un seul joueur.

**Non-objectifs (v1)** : aucune récompense, que ce soit au classement ou par
match ; pas de brouillard de guerre ; pas de match aller-retour.

## 1. Cycle de vie d'un CDC

- **Lancement** : un admin lance le CDC en choisissant un lundi de début et la
  liste des lieux possibles. Le CDC **est un `ClanEvent`** avec un nouveau
  `ClanEventType` `championship` et une config dédiée, sur le modèle de
  `startClanWarEvent` (`ed-be/src/business/adminService.ts:1109`).
  `ClanEvent` doit gérer correctement les différents types d'événements : le
  code de la guerre ne doit jamais prendre un CDC pour une guerre.
- **Inscriptions** : elles durent 2 semaines à partir du lundi de début.
  Seuls le chef de clan et les membres qui ont le droit
  `ClanMemberRight.WAR_OFFICER` peuvent inscrire leur clan, sans aucune
  autre restriction, à une exception près : l'inscription est **refusée** si
  le clan est en guerre ou qu'une guerre lui a été déclarée.
  **[choix Claude]** Le clan peut se désinscrire tant que les inscriptions
  sont ouvertes.
- **Clôture** : la liste des clans inscrits est figée.
  - S'il y a moins de 2 clans inscrits, le CDC est annulé automatiquement.
  - Sinon, on génère un calendrier en round-robin (méthode du cercle) :
    chaque clan affronte une fois chacun des autres, soit N−1 journées.
  - Si N est impair, il faut N journées : à chaque journée, un clan est
    exempt et marque 0 point.
- **Calendrier** : il y a 2 créneaux par semaine, **du lundi 18h UTC au
  mercredi 18h UTC** et **du jeudi 18h UTC au samedi 18h UTC**. Tout est
  calculé en UTC, sans gestion de fuseau horaire.
  - Le premier match se joue le lundi de la 3e semaine.
  - **[choix Claude]** Les inscriptions ferment ce même lundi à 00h00 UTC.
- **Exclusivité avec la guerre** : une guerre des clans et un CDC ne peuvent
  jamais avoir lieu en même temps. Un seul événement de clan peut être en
  cours ou programmé à la fois, quel que soit son type.
- **Dissolution** : un clan inscrit ne peut pas être dissous avant la fin du
  CDC.
- **Tournois** : ils ne sont pas affectés par le CDC.
- **Classement** : 3 points pour une victoire, 1 pour un nul, 0 pour une
  défaite. En cas d'égalité, on départage d'abord par la différence de score
  cumulée, puis **[choix Claude]** par le score total marqué.

## 2. Le match

- **Durée** : un match oppose 2 clans pendant 48h.
- **Lieu** : il est tiré au sort parmi les lieux choisis par l'admin, avec
  `getRandomArrayElement` comme pour le château de la guerre des clans.
  - Le tirage a lieu et est révélé aux deux clans **un peu avant le match**,
    **[choix Claude]** 24h avant le coup d'envoi.
  - Plusieurs matchs peuvent avoir lieu au même endroit, chacun sur son propre
    damier.
- **Ordres** : seul le propriétaire d'un dinoz peut le faire entrer, le
  déplacer, attaquer avec lui ou le faire sortir.
- **Damier** : 20×20 cases.
  - **[choix Claude]** Le clan qui joue côté ouest (colonne 1) est tiré au
    sort ; l'autre entre par la colonne 20.
  - Les obstacles sont tirés aléatoirement à chaque match.
  - Ils sont symétriques par rapport au centre : un obstacle en (x, y)
    implique un obstacle en (21−x, 21−y).
  - Il n'y a jamais d'obstacle sur les colonnes 1 et 20.
  - **[choix Claude]** Les obstacles couvrent environ 10 à 15 % des cases,
    et il existe toujours un chemin entre les deux colonnes d'entrée
    (on peut réutiliser `findPath` de `ed-be/src/business/dungeon/pathfind.ts`).
- **Quota** : chaque clan peut faire participer au maximum 100 dinoz
  **uniques** sur la durée du match. Un dinoz qui sort puis revient ne compte
  qu'une fois.
- **Fin du match** : le clan qui a le plus de points gagne ; à égalité, c'est
  un match nul. Tous les dinoz sont alors retirés du damier et déverrouillés.

### Ligne de score et décompte

- La ligne de score d'un clan correspond à la colonne de son dinoz **le plus
  avancé** qui n'a pas été dépassé.
  - Un dinoz est « dépassé » quand un dinoz adverse se trouve plus près du camp
    de son clan que lui.
  - Exemple : A a des dinoz en colonnes 8 et 12, et un dinoz de B est en
    colonne 10. Le dinoz de A en 12 est dépassé, donc la ligne de A vaut 8.
- **Décompte** : toutes les 10 minutes, en partant du début du match (soit
  288 décomptes) :
  - chaque clan marque autant de points que l'avancement de sa ligne ;
  - chaque dinoz vivant présent sur le damier gagne 2 PA, sans plafond.
  - **[choix Claude]** L'avancement se mesure en colonnes parcourues depuis la
    colonne d'entrée : 0 sur la colonne d'entrée, 19 au maximum. Un clan sans
    dinoz sur le damier marque 0.

### Entrée, sortie et verrouillage

- **Entrée** :
  - Le dinoz doit appartenir à un joueur du clan, se trouver sur le lieu du
    match, être vivant, ne pas faire partie d'un groupe (il ne doit pas avoir
    de chef ni de suiveurs) et ne pas être mort dans ce match.
  - Le quota de 100 doit le permettre.
  - Il est placé au hasard sur une case libre de la colonne d'entrée de son
    clan, avec 0 PA.
- **Sortie** : elle n'est possible que depuis la colonne d'entrée du clan.
  **[choix Claude]** Elle est gratuite et ne coûte pas de PA. Le dinoz peut
  revenir plus tard, sauf s'il est mort.
- **Verrouillage** : tant qu'il est sur le damier, le dinoz ne peut ni se
  déplacer sur la carte, ni combattre, ni faire de missions, de tournois, etc.
  - Il peut seulement être soigné normalement (sans contrepartie), être
    équipé et monter de niveau (via le `learnSkill` habituel).
  - Implémentation proposée : un nouveau `UnavailableReason` (par exemple
    `clanChampionship`) et une règle dédiée dans `getAvailableActions`
    (`ed-be/src/business/dinozService.ts:130`), pour que les soins restent
    possibles.
- **Départ du clan** : si un joueur quitte son clan ou en est exclu, ses dinoz
  sont retirés du damier et leurs places dans le quota sont libérées.

### Déplacements et combats

- **Déplacement** : un dinoz peut aller sur une case adjacente (N, S, E ou O)
  si elle est libre et sans obstacle. Cela coûte 1 PA.
- **Attaque** : un dinoz attaque en tentant d'aller sur la case d'un ennemi.
  Cela coûte 1 PA à l'attaquant, et **l'attaquant reste sur place**.
  - **Attaque par derrière** : l'attaquant arrive par le côté du camp de la
    victime. Pour un dinoz de A (camp à l'ouest), c'est une attaque depuis la
    case à l'ouest. Le combat est alors un **1v1**.
  - **Sinon, combat de groupe** : participent tous les dinoz vivants présents
    sur le damier dans la zone formée par l'union des carrés 3×3 centrés sur
    chacun des deux combattants. Pour une attaque horizontale, cette zone fait
    4 colonnes sur 3 lignes ; pour une attaque verticale, 3 colonnes sur
    4 lignes. Chaque dinoz se bat dans le camp de son clan. **[choix Claude]**
    Participer coûte 0 PA à tout le monde, sauf à l'attaquant.
  - **Moteur** : `calculateFightBetweenPlayers`
    (`ed-be/src/business/fightService.ts:247`), qui gère déjà le N contre M.
    **[choix Claude]** On utilise des règles PvP dédiées, calquées sur
    `CLAN_WAR_PVP_RULES`.
  - **Après le combat** :
    - Les dinoz morts (PV à 0, c'est-à-dire une vraie mort en jeu, avec
      `LogType.Death`) sortent du match et ne peuvent plus y revenir.
    - Les survivants gardent leurs PV perdus.
    - L'XP est attribuée comme pour la guerre (`calculatePvPxp`), et les
      combats sont archivés (`archiveFight`).
    - Les combats du damier sont limités **uniquement par les PA**. Ils ne
      consomment pas le combat normal du dinoz (`fight`) et n'imposent aucun
      temps de repos (`restingAttack`).
    - Les objets équipés fonctionnent comme d'habitude.

### Ce que voit un joueur

- Il voit tout le damier : les obstacles, les positions de tous les dinoz,
  les deux lignes de score, le score, le temps restant et le quota utilisé.
- Il voit les PV et PA de ses propres dinoz et de ceux de ses alliés, mais
  **pas ceux des ennemis**.
- Le damier est mis à jour en temps réel. Il est proposé d'utiliser un canal
  WebSocket par match, sur le modèle de `CLAN_FORUM` dans
  `ed-be/src/business/serverEventService.ts`.
- La coordination passe par la discussion de clan existante
  (`ClanDiscussion.vue`).
- **[choix Claude]** Seuls les membres des deux clans peuvent ouvrir le damier
  d'un match ; il n'y a pas de spectateurs en v1. Chaque joueur ne peut
  revoir que les combats auxquels l'un de ses dinoz a participé. Il peut donc
  y apercevoir les PV des ennemis qui y étaient : c'est une fuite
  d'information acceptée.

## Laissé au builder

- Le schéma Prisma exact : championnat, inscriptions, matchs, cases ou
  obstacles, pièces, participations au quota, journal des combats.
- La concurrence : deux ordres simultanés sur le même match doivent être
  sérialisés (transaction ou verrou par match).
- La planification (décomptes toutes les 10 min, clôture des inscriptions,
  début et fin des matchs) doit résister aux redémarrages, sur le modèle de
  `ServerState` et `scheduleService.ts`.
- L'UI : la page du CDC (inscription, calendrier, classement), la vue du
  damier et l'écran d'administration (dans le prolongement de `EventCreation.vue`).
