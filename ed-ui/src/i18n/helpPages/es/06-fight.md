---
icon:
  path: icons
  name: small_fire
---

# Los Combates

Un combate tiene lugar cuando tu Dino es atacado o ataca a uno o varios monstruos. Los diferentes participantes se unen entonces al combate, que se desarrolla de forma automática:

![Combate contra un monstruo](@guide/fight)

Los monstruos y tu Dino atacan por turnos, en función de su **iniciativa**, su **velocidad** y su **energía**. En cada golpe, el adversario pierde **puntos de vida** ![pv](@icons/small_pv), y esto se mostrará sobre él. Tu Dino debe matar a todos los monstruos para ganar el combate.

Durante su turno, tu Dino puede realizar una o más de las siguientes acciones, dependiendo de su energía:

- Lanzar un **asalto**, es decir, un ataque normal
- Efectuar un **ataque especial**, que reemplaza al asalto
- Utilizar una competencia de tipo **evento**
- Utilizar un **objeto de combate**

## Los Elementos

Un Dino posee 5 tipos de **elementos** que son indicados en su ficha:

- ![Elemento Fuego](@elements/elem_fire) Fuego
- ![Elemento Madera](@elements/elem_wood) Madera
- ![Elemento Agua](@elements/elem_water) Agua
- ![Elemento Rayo](@elements/elem_lightning) Rayo
- ![Elemento Aire](@elements/elem_air) Aire

Estos elementos son organizados según el **Gran Ciclo de los Elementos**:

![Gran Ciclo de los Elementos](@guide/elements)

Un elemento es fuerte contra los dos que le siguen y débil contra los dos que lo preceden. Por ejemplo, el Fuego es muy fuerte contra la Madera y ligeramente fuerte contra el Agua, pero es muy débil contra el Aire y ligeramente débil contra el Rayo.

## Los Asaltos

Los Asaltos siempre se realizan en un orden preciso, que se determina en función de los valores de los elementos, junto a un factor aleatorio en caso de igualdad.

![Elementos del Dino](@guide/assault)

Por ejemplo, un Dino que tenga los elementos anteriores efectuará sus asaltos en el siguiente orden:

- Agua ![Elemento Agua](@elements/elem_water) en primer lugar
- después Madera ![Elemento Madera](@elements/elem_wood)
- después Rayo ![Elemento Rayo](@elements/elem_lightning) y Aire ![Elemento Aire](@elements/elem_air) en un orden arbitrario
- y finalmente Fuego ![Elemento Fuego](@elements/elem_fire)

Una vez se realicen los 5 asaltos, el Dino empezará de nuevo el ciclo.

En función de sus **elementos** y de sus **competencias**, el Dino tiene un cierto **poder de asalto**, así como una **defensa** para cada elemento. Estas características son visibles en la pestaña **Detalles** de la ficha del Dino.

Cuanto más **potente es el asalto** de un elemento, más daño hará el Dino a su enemigo con un asalto de este elemento. Cuanto mayor es la **defensa** contra un elemento, más protegido estará el Dino contra los ataques realizados con esos elementos.

## Los Monstruos

Muchos monstruos efectúan asaltos de elemento Vacío. Esto quiere decir que todos tus elementos son tomados en cuenta para la defensa. Sin embargo, hay monstruos que realizan asaltos o ataques especiales de un elemento en particular.

## Ganancias

Al final del combate, tu Dino gana **monedas de oro** ![](@icons/small_gold) que le permitirán curarse, y **puntos de experiencia** ![xp](@icons/small_xp) que le permitirán subir de nivel.

## L'Énergie

![Énergie du Dinoz](@guide/energy)

Chaque Dinoz possède une barre d'énergie bleue, à côté de sa barre de vie. Cette barre représente l'**énergie** que le Dinoz possède, elle est remplie à moitié au début du combat. Comme pour la barre de vie, elle dépend de l'énergie maximale appelée **endurance**, que le Dinoz détient. L'endurance d'un Dinoz peut varier en fonction de certaines compétences apprises. Des bonus peuvent aussi augmenter l'endurance.

Chaque compétence a un coût en énergie. À chaque compétence utilisée, la barre d'énergie diminue. Une fois vide, le Dinoz passe obligatoirement son tour. Certaines compétences extraordinairement fortes demandent d'ailleurs beaucoup plus d'énergie que les autres.

Cette barre d'énergie se remplit petit à petit pendant le combat, on parle de **récupération**. La récupération d'un Dinoz peut varier en fonction de certaines compétences apprises. Le Dinoz doit donc attendre d'avoir refait le plein d'énergie avant de lancer une compétence.

## Les Statuts en Combats

Pendant le combat, différents statuts affecteront vos Dinoz, en bonus ou en malus, vous pouvez retrouver la liste de ses statuts ci-dessous :

- ![Statut Endormi](@guide/status_sleep) Le Dinoz est endormi, il ne peut pas bouger
- ![Statut Intangible](@guide/status_untouchable) Le Dinoz ne peut être touché par un assaut classique
- ![Statut Ralenti](@guide/status_slow_down) Le Dinoz est ralenti
- ![Statut Accéléré](@guide/status_faster) Le Dinoz est plus rapide
- ![Statut Pétrifié](@guide/status_petrified) Le Dinoz est pétrifié, il ne peut plus attaquer
- ![Statut Bonus Assaut](@guide/status_assault_bonus) Le Dinoz a un bonus sur ses assauts
- ![Statut Poison](@guide/status_poisoned) Le Dinoz est empoisonné et subit des dégâts chaque tour
- ![Statut Vérouillé](@guide/status_locked) Le Dinoz n'est pas libre d'utiliser tous ses éléments
- ![Statut Étourdi](@guide/status_dazzled) Le Dinoz est ébloui, il peut rater son assaut sur un Dinoz adverse
- ![Statut Protégé](@guide/status_protected) Le Dinoz est protégé par un membre de son équipe
- ![Statut Muet](@guide/status_mute) Le Dinoz est muet, il ne peut plus appeler son invocation
- ![Statut Sharingan](@guide/status_sharingan) Le Dinoz peut copier les techniques de ses adversaires
- ![Statut Équipement Bloqué](@guide/status_blocked_inventory) Le Dinoz ne peut plus utiliser d'équipements
- ![Statut Pénalité d'Énergie](@guide/status_energy_penalty) Le Dinoz a un malus d'énergie
- ![Statut Bonus d'Énergie](@guide/status_energy_bonus) Le Dinoz a un bonus d'énergie
- ![Statut Défense Feu](@guide/status_bonus_def_fire) Le Dinoz a un bonus de défense en feu
- ![Statut Défense Bois](@guide/status_bonus_def_wood) Le Dinoz a un bonus de défense en bois
- ![Statut Défense Eau](@guide/status_bonus_def_water) Le Dinoz a un bonus de défense en eau
- ![Statut Défense Foudre](@guide/status_bonus_def_lightning) Le Dinoz a un bonus de défense en foudre
- ![Statut Défense Air](@guide/status_bonus_def_air) Le Dinoz a un bonus de défense en air
- ![Statut Bonus Initiative](@guide/status_initiative_bonus) Le Dinoz a un bonus en initiative
- ![Statut Malus Initiative](@guide/status_initiative_penalty) Le Dinoz a un malus en initiative
- ![Statut Bonus Esquive](@guide/status_dodge_bonus) Le Dinoz a un bonus en esquive
- ![Statut Bonus Défense](@guide/status_def_bonus) Le Dinoz a un bonus en défense