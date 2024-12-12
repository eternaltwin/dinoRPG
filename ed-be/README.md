# DinoRPG - Partie back

## WebSocket

Lors de la connexion au serveur via une WebSocket, il n'est pas possible ni d'envoyer les headers d'authentification, ni d'envoyer une charge utile.
Un système d'authentification en deux temps a donc été mis en place : le joueur doit d'abord s'authentifier auprès d'un service spécifique qui va lui fournir un ticket. Puis ce ticket pourra être ré-utilisé pour se connecter en WebSocket.

Pour aller un peu plus dans la partie technique, il faut tout d'abord appeler le service "api/v1/websockets/authenticate" en lui envoyant en payload le channel sur lequel on veut se connecter.
Ce service va alors faire toutes les vérifications nécessaires à la connexion. Par exemple, si le joueur veut se connecter sur le forum de son clan, le service va vérifier que le joueur a bien un clan, qu'il n'essaye pas se connecter sur un channel auquel il n'a pas accès et etc...

Une fois que le back s'est assuré que toutes les données sont valides, il va retourner un ticket au client. Celui-ci a une durée de vie de 5 minutes.
Ce ticket va alors pouvoir être utilisé pour établir une connexion sécurisée via WebSocket. Il suffit de l'envoyer avec un paramètre de requête nommé "ticket". Un exemple d'implémentation de connexion côté client donnerait ça :

`new WebSocket('ws://{urlDuServeur}?ticket={leTicketFournitParLeBack}')`

Grâce à ce ticket, la connexion bi-directionnelle va être établie et le serveur va réaliser plusieurs actions :

- Il va donner un identifiant unique à la connexion. Ainsi, chaque requête faite par le client n'aura pas besoin d'envoyer ni de header d'authentification ni de ticket de nouveau, la connexion sera automatiquement reconnue.
- Il va placer le joueur dans un channel spécifique. De cette façon, si le joueur envoie un message sur le forum de son clan, alors le message ne sera pas envoyé aux joueurs présents sur le forum d'un autre clan.
