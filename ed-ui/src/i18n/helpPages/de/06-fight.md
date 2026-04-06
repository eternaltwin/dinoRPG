---
icon:
  path: icons
  name: small_fire
---

# Les Combats

Un combat a lieu quand votre Dinoz est attaqué ou attaque un ou plusieurs monstres. Les différents protagonistes rejoignent alors le combat qui se déroule de façon automatique :

![Combattre un monstre](@guide/fight)

Les monstres et votre Dinoz attaquent au tour à tour, en fonction de leur **initiative**, de leur **vitesse**, et de leur **énergie**. À chaque coup, l'adversaire perd des **points de vie** ![pv](@icons/small_pv) qui sont affichés. Il faut que votre Dinoz tue tous les monstres pour pouvoir remporter le combat.

Lors de son tour, votre Dinoz peut effectuer une ou plusieurs des actions suivantes suivant son énergie :

- Lancer un **assaut**, c'est-à-dire une attaque normale
- Effectuer une **attaque spéciale**, qui remplace alors l'assaut
- Utiliser une compétence de type **événement**
- Utiliser un **équipement de combat**

## Les Éléments

Un Dinoz possède 5 valeurs d'**éléments** qui sont indiqués sur sa fiche :

- ![Élément Feu](@elements/elem_fire) Feu
- ![Élément Bois](@elements/elem_wood) Bois
- ![Élément Eau](@elements/elem_water) Eau
- ![Élément Foudre](@elements/elem_lightning) Foudre
- ![Élément Air](@elements/elem_air) Air

Ces éléments sont organisés selon le **Grand Cycle des Éléments** :

![Grand Cycle des Éléments](@guide/elements)

Un élément est fort contre les deux qui le suivent et faible contre les deux qui le précèdent. Ainsi, par exemple, le Feu est très fort contre le Bois et plutôt fort contre l'Eau, mais est très faible contre l'Air et plutôt faible contre la Foudre.

## Les Assauts

Les Assauts se font toujours dans un ordre bien précis, qui est déterminé en fonction des valeurs des éléments, avec un tirage aléatoire en cas d'égalité.

![Éléments du Dinoz](@guide/assault)

Ainsi, un Dinoz ayant les éléments ci-dessus va effectuer ses assauts dans l'ordre suivant :

- Eau ![Élément Eau](@elements/elem_water) en premier
- puis Bois ![Élément Bois](@elements/elem_wood)
- puis Foudre ![Élément Foudre](@elements/elem_lightning) et Air ![Élément Air](@elements/elem_air) dans un ordre indéterminé
- et enfin Feu ![Élément Feu](@elements/elem_fire)

Une fois les 5 assauts effectués, le Dinoz recommencera à nouveau le cycle.

En fonction de ses **éléments** et de ses **compétences**, le Dinoz a donc une certaine **puissance d'assaut** ainsi qu'une **défense** pour chaque élément. Ces caractéristiques sont visibles dans l'onglet **Détails** de la fiche du Dinoz.

Plus la **puissance d'assaut** d'un élément est forte et plus le Dinoz fera perdre des points de vie à ses adversaires quand il effectuera un assaut de cet élément. Plus la **défense** contre un élément est forte et plus le Dinoz sera protégé contre les attaques des adversaires effectuées avec cet élément.

## Les Monstres

De nombreux monstres effectuent des assauts de l'élément Vide. Cela veut dire que tous vos éléments sont pris en compte lors de la défense. Cependant, certains monstres sont capables d'effectuer des assauts ou des attaques spéciales d'un élément particulier.

## Gains

À la fin du combat, votre Dinoz gagne des pièces d'or :gold qui vont lui permettre de se soigner et des points d'expérience qui vont lui permettre de changer de niveau.

## L'Énergie

![Énergie du Dinoz](@guide/energy)

Chaque Dinoz possède une barre d'énergie bleue, à côté de sa barre de vie. Cette barre représente l'**énergie** que le Dinoz possède, elle est remplie à moitié au début du combat. Comme pour la barre de vie, elle dépend de l'énergie maximale appelée **endurance**, que le Dinoz détient. L'endurance d'un Dinoz peut varier en fonction de certaines compétences apprises. Des bonus peuvent aussi augmenter l'endurance.

Chaque compétence a un coût en énergie. À chaque compétence utilisée, la barre d'énergie diminue. Une fois vide, le Dinoz passe obligatoirement son tour. Certaines compétences extraordinairement fortes demandent d'ailleurs beaucoup plus d'énergie que les autres.

Cette barre d'énergie se remplit petit à petit pendant le combat, on parle de **récupération**. La récupération d'un Dinoz peut varier en fonction de certaines compétences apprises. Le Dinoz doit donc attendre d'avoir refait le plein d'énergie avant de lancer une compétence.

## Les Statuts en Combats

Pendant le combat, différents statuts affecteront vos Dinoz, en bonus ou en malus, vous pouvez retrouver la liste de ses statuts ci-dessous :

- ![Statut Endormi](@guide/status_sleep) Le Dinoz est endormi, il ne peut pas bouger
- ![Statut Endormi](@guide/status_untouchable) Le Dinoz ne peut être touché par un assaut classique
- ![Statut Endormi](@guide/status_slow_down) Le Dinoz est ralenti
- ![Statut Endormi](@guide/status_faster) Le Dinoz est plus rapide
- ![Statut Endormi](@guide/status_petrified) Le Dinoz est pétrifié, il ne peut plus attaquer
- ![Statut Endormi](@guide/status_assault_bonus) Le Dinoz a un bonus sur ses assauts
- ![Statut Endormi](@guide/status_poisoned) Le Dinoz est empoisonné et subit des dégâts chaque tour
- ![Statut Endormi](@guide/status_locked) Le Dinoz n'est pas libre d'utiliser tous ses éléments
- ![Statut Endormi](@guide/status_dazzled) Le Dinoz est ébloui, il peut rater son assaut sur un Dinoz adverse
- ![Statut Endormi](@guide/status_protected) Le Dinoz est protégé par un membre de son équipe
- ![Statut Endormi](@guide/status_mute) Le Dinoz est muet, il ne peut plus appeler son invocation
- ![Statut Endormi](@guide/status_sharingan) Le Dinoz peut copier les techniques de ses adversaires
- ![Statut Endormi](@guide/status_blocked_inventory) Le Dinoz ne peut plus utiliser le contenu de son inventaire
- ![Statut Endormi](@guide/status_energy_penalty) Le Dinoz a un malus d'énergie
- ![Statut Endormi](@guide/status_energy_bonus) Le Dinoz a un bonus d'énergie
- ![Statut Endormi](@guide/status_bonus_def_fire) Le Dinoz a un bonus de défense en feu
- ![Statut Endormi](@guide/status_bonus_def_wood) Le Dinoz a un bonus de défense en bois
- ![Statut Endormi](@guide/status_bonus_def_water) Le Dinoz a un bonus de défense en eau
- ![Statut Endormi](@guide/status_bonus_def_lightning) Le Dinoz a un bonus de défense en foudre
- ![Statut Endormi](@guide/status_bonus_def_air) Le Dinoz a un bonus de défense en air
- ![Statut Endormi](@guide/status_initiative_bonus) Le Dinoz a un bonus en initiative
- ![Statut Endormi](@guide/status_initiative_penalty) Le Dinoz a un malus en initiative
- ![Statut Endormi](@guide/status_dodge_bonus) Le Dinoz a un bonus en esquive
- ![Statut Endormi](@guide/status_def_bonus) Le Dinoz a un bonus en défense