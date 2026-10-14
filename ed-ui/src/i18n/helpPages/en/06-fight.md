---
icon:
  path: icons
  name: small_fire
---

# Fights

A battle occurs when your Dinoz is attacked or attacks one or more monsters. The different participants then join the battle, which unfolds automatically:

![Combattre un monstre](@guide/fight)

Monsters and your Dinoz take turns attacking, based on their **initiative**, **speed**, and **energy**. With each hit, the opponent loses **health points** ![pv](@icons/small_pv), which are displayed. Your Dinoz must defeat all the monsters to win the battle.

During its turn, your Dinoz can perform one or more of the following actions based on its energy:

- Launch an **assault**, meaning a normal attack
- Execute a **special attack**, which then replaces the assault
- Use an **event** type skill
- Use **combat equipment**

## The Elements

A Dinoz has 5 **elemental** values that are indicated on its profile:

- ![](@elements/elem_fire) Fire
- ![](@elements/elem_wood) Wood
- ![](@elements/elem_water) Water
- ![](@elements/elem_lightning) Lightning
- ![](@elements/elem_air) Air

These elements are organized according to **the Grand Cycle of Elements**:

![Grand Cycle of Elements](@guide/elements)

An element is strong against the two that follow it and weak against the two that precede it. Thus, for example, Fire is very strong against Wood and quite strong against Water, but is very weak against Air and rather weak against Thunder.

## The Assaults

Assaults always occur in a specific order, determined by the elemental values, with a random draw in case of a tie.

![Dinoz Elements](@guide/assault)

Thus, a Dinoz with the above elements will perform its assaults in the following order:

- Water ![](@elements/elem_water) first
- then Wood ![](@elements/elem_wood)
- then Lightning ![](@elements/elem_lightning) and Air ![](@elements/elem_air) in a random order
- and finally Fire ![](@elements/elem_fire)

Once the 5 assaults are completed, the Dinoz will go through the cycle again.

Based on its **elements** and **skills**, the Dinoz has a certain **assault power** and **defense** for each element. These characteristics are visible in the **Details** tab of the Dinoz' profile.

The stronger **the assault power** of an element, the more health points the Dinoz will deduct from its opponents when performing an assault of that element. The stronger **the defense** against an element, the more protected the Dinoz will be against attacks from opponents using that element.

## The Monsters

Many monsters perform Void element assaults. This means that all your elements are taken into account during defense. However, some monsters are capable of performing assaults or special attacks of a particular element.

## Gains

At the end of the battle, your Dinoz earns **gold coins** :gold: that will allow it to heal, and **experience points** that will enable it to level up.

## The Energy

![Dinoz Energy](@guide/energy)

This bar represents the **energy** that the Dinoz possesses, and it is halfway filled at the beginning of the battle. This bar represents the **energy** that the Dinoz possesses, and it is halfway filled at the beginning of the battle. Like the health bar, it depends on the maximum energy called **endurance** that the Dinoz possesses. _The endurance of a Dinoz can vary depending on certain learned skills. Bonuses allow to increase it._

Each skill has an energy cost. With each skill used, the energy bar decreases. Once empty, the Dinoz must pass its turn. Some extraordinarily powerful skills require much more energy than others.

This energy bar gradually fills up during the battle, referred to as **recovery**. The recovery of a Dinoz can vary depending on certain learned skills. The Dinoz must therefore wait until it has replenished its energy before using a skill.

## Fight Statuses

During the battle, different statuses will affect your Dinoz, either as a bonus or a penalty. You can find the list of these statuses below:

- ![Asleep Status](@guide/status_sleep) The Dinoz is asleep, it cannot move
- ![Intangible Status](@guide/status_untouchable) The Dinoz cannot be hit by a standard assault
- ![Slowed Status](@guide/status_slow_down) The Dinoz is slowed down
- ![Accelerated Status](@guide/status_faster) The Dinoz is faster
- ![Petrified Status](@guide/status_petrified) The Dinoz is petrified, it cannot attack anymore
- ![Assault Bonus Status](@guide/status_assault_bonus) The Dinoz has a bonus on its assaults
- ![Poison Status](@guide/status_poisoned) The fighter is poisoned and takes damage every cycle
- ![Statut Vérouillé](@guide/status_locked) Le Dinoz n'est pas libre d'utiliser tous ses éléments
- ![Statut Étourdi](@guide/status_dazzled) Le Dinoz est ébloui, il peut rater son assaut sur un Dinoz adverse
- ![Protected Status](@guide/status_protected) The Dinoz is protected by a teammate
- ![Muted Status](@guide/status_mute) The Dinoz is muted and cannot call its invocation
- ![Sharingan Status](@guide/status_sharingan) The Dinoz can copy skills from its opponents
- ![Blocked Equipment Status](@guide/status_blocked_inventory) The Dinoz cannot use items from its inventory
- ![Energy Penalty Status](@guide/status_energy_penalty) The Dinoz has an energy penalty
- ![Energy Bonus Status](@guide/status_energy_bonus) The Dinoz has an energy bonus
- ![Fire Defense Status](@guide/status_bonus_def_fire) The Dinoz has a fire defense bonus
- ![Wood Defense Status](@guide/status_bonus_def_wood) The Dinoz has a wood defense bonus
- ![Water Defense Status](@guide/status_bonus_def_water) The Dinoz has a water defense bonus
- ![Lightning Defense Status](@guide/status_bonus_def_lightning) The Dinoz has a lightning defense bonus
- ![Air Defense Status](@guide/status_bonus_def_air) The Dinoz has an air defense bonus
- ![Initiative Bonus](@guide/status_initiative_bonus) The Dinoz receives an initiative bonus
- ![Initiative Penalty](@guide/status_initiative_penalty) The Dinoz receives an initiative penalty
- ![Dodge Bonus](@guide/status_dodge_bonus) The Dinoz receives a dodge bonus
- ![Defense Bonus](@guide/status_def_bonus) The Dinoz receives a defense bonus