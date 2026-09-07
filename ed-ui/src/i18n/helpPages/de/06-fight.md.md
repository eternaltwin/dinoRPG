---
icon:
  path: icons
  name: small_fire
---

# Die Kämpfe

Ein Kampf wird ausgelöst, wenn deine Dinoz unterwegs angegriffen werden oder selbst Monster angreifen. Die verschiedenen Akteure beteiligen sich automatisch am stattfindenden Kampf:

![Gegen ein Monster kämpfen](@guide/fight)

Die Monster und deine Dinoz greifen einander der Reihe nach an, abhängig von ihrer **Initiative**, **Geschwindigkeit** und **Energie**. Mit jedem Treffer verlieren Gegner die angezeigten **Lebenspunkte** ![](@icons/small_pv). Um den Kampf zu gewinnen, müssen deine Dinoz alle Monster töten.

Während seines Zuges kann ein Dinoz abhängig von seiner Energie eine oder mehrere der folgenden Aktionen ausführen:

- Einen **Angriff** starten, indem im Nahkampf attackiert wird
- Eine **Spezialattacke** ausführen, die einen Angriff ersetzt
- Eine Fähigkeit des Typs **„Ereignis“** einsetzen
- **Kampfausrüstung** benutzen

## Die Elemente

Ein Dinoz verfügt über 5 **Element**-Werte, die auf seinem Profil zu sehen sind:

- ![](@elements/elem_fire) Feuer
- ![](@elements/elem_wood) Holz
- ![](@elements/elem_water) Wasser
- ![](@elements/elem_lightning) Blitz
- ![](@elements/elem_air) Luft

Diese Elemente sind dem **Großen Zyklus der Elemente** nach angeordnet:

![Der Große Zyklus der Elemente](@guide/elements)

Ein Element ist jeweils stark gegenüber den zwei nachfolgenden und schwach gegenüber den zwei zuvor. So ist beispielsweise Feuer sehr stark gegen Holz und etwas stärker gegen Wasser, während es sehr schwach gegen Luft und etwas schwächer gegen Blitz ist.

## Die Angriffe

Angriffe erfolgen immer in einer festgelegten Reihenfolge, die auf den Elementarwerten basiert, wobei sie im Falle von Gleichheit zufällig bestimmt wird.

![Elemente der Dinoz](@guide/assault)

So wird ein Dinoz mit den oben dargestellten Elementen seine Angriffe in der folgenden Reihenfolge ausführen:

- Zunächst Wasser ![](@elements/elem_water)
- dann Holz ![](@elements/elem_wood)
- anschließend Blitz ![](@elements/elem_lightning) oder Luft ![](@elements/elem_air) in einer zufälligen Reihenfolge
- und schließlich Feuer ![](@elements/elem_fire)

Sobald 5 Angriffe erfolgt sind, wird der Dinoz den Zyklus von Vorne beginnen.

Abhängig von seinen **Elementen** und **Fähigkeiten**, hat ein Dinoz eine bestimmte **Angriffsstärke** und **Abwehr** gegenüber jedem Element. Diese Eigenschaften sind auf dem Dinoz-Profil unter dem Reiter **„Details“** einsehbar.

Je höher die **Angriffsstärke** eines Elements, desto mehr Lebenspunkte verlieren Gegner, wenn der Dinoz einen Angriff dieses Elements ausführt. Je stärker die **Abwehr** gegenüber einem Element ist, desto besser ist der Dinoz vor Angriffen geschützt, wenn Gegner hierzu dieses Element verwenden.

## Die Monster

Zahlreiche Monster führen Angriffe des Leerenelements durch. Das bedeutet, dass bei der Abwehr alle Elemente berücksichtigt werden. Jedoch sind manche Monster in der Lage, Angriffe oder Spezialattacken bestimmter Elemente auszuführen.

## Einnahmen

Nach dem Kampf erhalten deine Dinoz **Goldmünzen** :gold:, die es ihnen ermöglichen, sich zu heilen, sowie **Erfahrungspunkte**, die es ihnen ermöglichen, Stufen aufzusteigen.

## Energie

![Energie der Dinoz](@guide/energy)

Jeder Dinoz hat neben seinem Lebensbalken noch einen blauen Energiebalken. Dieser Balken stellt die **Energie** dar, die der Dinoz besitzt und sie ist zu Beginn des Kampfes zur Hälfte gefüllt. Ähnlich dem Lebensbalken hängt dieser von der maximalen Energie des Dinoz ab, die als **Ausdauer** bezeichnet wird. Die Ausdauer eines Dinoz kann abhängig von bestimmten erlernten Fähigkeiten variieren. Darüber hinaus kann Ausdauer auch durch Boni erhöht werden.

Jede Fähigkeit kostet Energie. Wenn eine Fähigkeit gewirkt wird, verringert sich der Energiebalken. Sobald er leer ist, beendet der Dinoz zwangsläufig seine Runde. Einige außergewöhnlich starke Fähigkeiten erfordern wesentlich mehr Energie als andere.

Im Laufe des Kampfes füllt sich der Energiebalken allmählich auf, was **Erholung** genannt wird. Die Erholung eines Dinoz kann abhängig von bestimmten erlernten Fähigkeiten variieren. Der Dinoz muss also warten, bis sich seine Energie wieder aufgefüllt hat, bevor er eine Fähigkeit wirken kann.

## Die Kampfstatus

Während des Kampfes kann ein Dinoz von diversen Status betroffen sein, die entweder ein Bonus oder ein Malus sein können. Im Folgenden findest du eine Liste solcher Status:

- ![Schlafend:](@guide/status_sleep) Der Dinoz ist eingeschlafen und kann sich nicht bewegen
- ![Unantastbar:](@guide/status_untouchable) Der Dinoz kann nicht von gewöhnlichen Angriffen getroffen werden
- ![Verlangsamt:](@guide/status_slow_down) Der Dinoz ist verlangsamt
- ![Beschleunigt:](@guide/status_faster) Der Dinoz ist beschleunigt
- ![Versteinert:](@guide/status_petrified) Der Dinoz ist versteinert und kann nicht mehr angreifen
- ![Gesegnet:](@guide/status_assault_bonus) Der Dinoz hat einen Angriffsbonus
- ![Vergiftet:](@guide/status_poisoned) Der Dinoz ist vergiftet und bekommt jede Runde Schaden
- ![Versiegelt:](@guide/status_locked) Der Dinoz ist in der Nutzung seiner Elemente eingeschränkt
- ![Geblendet:](@guide/status_dazzled) Der Dinoz ist geblendet und seine Angriffe können verfehlen
- ![Geschützt:](@guide/status_protected) Der Dinoz steht unter dem Schutz eines Verbündeten
- ![Verstummt:](@guide/status_mute) Der Dinoz ist zum Schweigen gebracht und kann keine Beschwörungen einsetzen
- ![Sharingan:](@guide/status_sharingan) Der Dinoz kann gegnerische Fähigkeiten kopieren
- ![Ausrüstung blockiert:](@guide/status_blocked_inventory) Der Dinoz kann nicht auf seine Ausrüstung zugreifen
- ![Malus auf Energie:](@guide/status_energy_penalty) Der Dinoz hat einen Energiemalus
- ![Bonus auf Energie:](@guide/status_energy_bonus) Der Dinoz hat einen Energiebonus
- ![Feuerabwehr:](@guide/status_bonus_def_fire) Der Dinoz hat einen Bonus auf Feuerabwehr
- ![Holzabwehr:](@guide/status_bonus_def_wood) Der Dinoz hat einen Bonus auf Holzabwehr
- ![Wasserabwehr:](@guide/status_bonus_def_water) Der Dinoz hat einen Bonus auf Wasserabwehr
- ![Blitzabwehr:](@guide/status_bonus_def_lightning) Der Dinoz hat einen Bonus auf Blitzabwehr
- ![Luftabwehr:](@guide/status_bonus_def_air) Der Dinoz hat einen Bonus auf Luftabwehr
- ![Bonus auf Initiative:](@guide/status_initiative_bonus) Der Dinoz hat einen Initiativebonus
- ![Malus auf Initiative:](@guide/status_initiative_penalty) Der Dinoz hat einen Initiativemalus
- ![Bonus auf Ausweichen:](@guide/status_dodge_bonus) Der Dinoz hat einen Ausweichbonus
- ![Bonus auf Verteidigung:](@guide/status_def_bonus) Der Dinoz hat einen Verteidigungsbonus