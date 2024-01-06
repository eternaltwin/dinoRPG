# Fight Calculation pseudo code

This is an attempt to translate the [original source code of Motion Twin](https://github.com/motion-twin/WebGamesArchives/tree/main/DinoRPG/src/fight) to process a fight in the game DinoRPG into pseudo-code.

The core of a fight is in the [manager](https://github.com/motion-twin/WebGamesArchives/blob/main/DinoRPG/src/fight/Manager.hx).
A common entity is used for dinoz, monsters and anything else called [fighter](https://github.com/motion-twin/WebGamesArchives/blob/main/DinoRPG/src/fight/Fighter.hx).
[Skills](https://github.com/motion-twin/WebGamesArchives/blob/main/DinoRPG/src/fight/SkillsImpl.hx) are implemented through call back functions. i.e There is no gigantic switch case to process them all.

## Manager

The pseudo code below relates to the function [execute() line 526](https://github.com/motion-twin/WebGamesArchives/blob/main/DinoRPG/src/fight/Manager.hx#L526)

The execution of a fight goes as follows:
- prepare all the fighters if needed, the preparation of a fighter consists in:
  - adding the effect of all permanent objects
  - adding the effect of all activated (a player can elect to disable/enable any skill) skills
  - adding the effect of all non-permanent object
  - setting the initial energy to a dinoz to its maximum energy
  - sorting active skills and event skill in decreasing priority
  - Note: in a prior step the time (similar to initiative) of a fighter is randomized
- apply any effect that take place at the start of a fight
- sort all fighters based on their time, lowest first, random is equal
- reset the fight time-clock to the first fighter's time
- LOOP: iterate as many times as necessary as long as there are fighters alive on both teams (attackers and defenders)
  - sort all fighters based on their time, lowest first, random is equal
  - the first fighter of that list will play a turn (let's call it the "attacker")
  - based on the elapsed time, all fighters except the attacker recover energy multiplied by their recovery speed
  - TODO: some stuff about status/next status, environment skill
  - update all the statuses of all fighters
  - check if any fighters died from the status
  - apply any effect that takes place before the start of the turn 
  - if the attacker casted the environment effect ongoing then apply the environment effect 
  - if the attacker is no different than the previous fighter that did a turn, reset its combo
  - if the attacker has a combo of more than 10 or less than 5 energy, it passes its turn
  - else:
    - check if the attacker will use an event skill, a check if made for all event skills of the attacker (remember they have been ordered by priority)      - 
      - the attacker must have enough energy to use it
      - a random value between 0 and 100 (included) is picked, if that value is below the priority of the skill, that skill will be used
      - if an event skill has been selected, then its effect is applied
      - else, nothing happens
    - CORNER CASE: if the attacker is forced to do a specific attack (in that case execute it)
    - else check if the attacker will use an active skill - this is similar to selecting an event skill as described above with a few additions:
      - there are filters to consider that may remove the ability to use some active skills
    - if a skill or forced attack was picked, execute it
    - else if no skill was selected, execute an assault and consume 4 energy
    - For the details of processing a skill/attack/assault see the "Attack" section 
  - Move the attacker's current element to the next one (regardless if it used a skill, an assault, or passed its turn)
  - Increase the time of the attacker based on its global speed and current element speed (minimum of 1)
  - Apply any effect (not specific to the attacker) that takes place at the end of the turn
  - Check if any fighter died
  - Repeat LOOP
- Once the loop is finished:
  - Handle castle attacks if there is a castle
  - Process any effect that happen after the fight
- The fight is finished 

## Attack

An attack can be be of 3 different types:
- an assault
- a single target skill
- a multi-target skill

The pseudo code below relates to the function [attackTarget() line 778](https://github.com/motion-twin/WebGamesArchives/blob/main/DinoRPG/src/fight/Manager.hx#L778)

Note that this is the common logic to handle: an assault, a single target skill hit and the hit on one fighter for a multi-target skill.

An attack goes as follows:
- given a base damage vector that describes how much damage per element the attack does (see the assault, single target skill or multi-target skill)
- if the attacker has a combo above 10, it passes its turn
- else:
  - The attack score of the attacker is calculated as follows:
    - Add the sum of the base damage vector (sum of Fire, Wood, Water, Air and Lightning)
    - For each non-zero damage component:
      - If it is an assault, add the assault elemental bonus
      - Else (a skill) add the elemental bonus
    - Then if it is an assault:
      - Add the attacker's global assault bonus
      - Add the attacker's bonus to the next assault (then set that bonus for the next assault to 0)
      - Multiply by the attacker's global assault multiplier
      - Multiply by the attacker's multiplier to the next assault (then set that multiplier to 1 - i.e no extra)
    - Add a final random to the attack of up to 33 %
    - Multiply by a factor of 0.9
  - The defense score of the target is calculated as follows:
    - Average of the target's elemental stats for each element used in the damage vector
      - If it is a single element attack, this average equals to the target's defense for that element
    - Add the target's armor
  - Calculate the difference between the attack score and the defense score
  - If the result is below the attacker's minimum damage, use the attacker's minimum damage
  - If the result is below the attacker's minimum assault damage and it is an assault, use the attacker's minimum assault damage
  - Apply the defensive effects of the target
  - If it is an assault, check if the target dodges is
  - Else, check if the target dodges the skill (only if it is not petrified, asleep, flying or stunned)
  - If the target is flying and the attacker cannot attack flying targets or is not flying itself: then no damage is dealt and the target stops flying
  - If the target is intangible:
    - If the attacker can attack intangible targets and is performing an assault OR the skill used does some air damage: then do 1 damage and remove the intangible status of the target
    - Else no damage is dealt
  - TODO: dazzled status?
  - If the attack is dodged, then no damage is dealt
  - The attacker loses the energy of the attack (depends for skills and 2 for assaults)
  - Apply the attacker's after attack effects
  - Apply the target's after defense effects
  - Check if the attacker realizes a combo, if yes the energy cost increases by 1 and the attacker does another assault
  - The target loses as many health points as the resulting damage
  - If the attack is an assault, check if the target realizes a counter attack, if yes, process the counter attack (which is an assault)

### Base damage score
The base damage score follows the same formula for assault and skills. Given the "power" of the attack for a given element:
- for an assault it is 5
- for a skill, it depends

Multiply this power by the corresponding element value of the attacker

For example, for a Water assault by a fighter with water element of 9, the base damage score of the assault is 45.

For example, for the skill Water Canon that has a power of 6 for water, used by a fighter with a water element of 9, the base damage score is 54.

## Fighter

## Skills

## Status

