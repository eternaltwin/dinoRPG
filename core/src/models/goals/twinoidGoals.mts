import { StatTracking } from '../enums/statTracking.mjs';
import { Goal } from './GoalsType.mjs';

export const twinoidGoals: Record<StatTracking, Goal> = {
	[StatTracking.PERLE]: {
		id: StatTracking.PERLE,
		name: {
			en: 'Fountain Pearl',
			fr: 'Perle de la Fontaine',
			de: 'Perle aus dem Brunnen',
			es: 'Perla de la Fuente'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_perle.gif'
			}
		],
		description: {
			en: 'The Fountain Pearl allows your dinoz to regenerate health every day at the Fountain of Youth.',
			fr: 'La perle de la Fontaine permet à tous vos Dinoz de pouvoir se régénerer chaque jour à la Fontaine de Jouvence.',
			de: 'Mit der Perle aus dem Brunnen können alle deine Dinoz sich jeden Tag am Jungbrunnen erholen.',
			es: 'La Perla de la Fuente permite a todos tus Dinos regenerarse cada día en la Fuente de la Juventud.'
		}
	},
	[StatTracking.PTEROZ]: {
		id: StatTracking.PTEROZ,
		name: {
			en: 'Pteroz Trophy',
			fr: 'Trophée des Pteroz',
			de: 'Trophäe der Pteroz',
			es: 'Trofeo de los Teroz'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_pteroz.gif'
			}
		],
		description: {
			en: 'The Pteroz Trophy is awarded to players who have defeated the strange Pteroz. It also unlocks the Pteroz, making it available to buy in the Dinoz Shop.',
			fr: 'Le Trophée des Pteroz récompense les joueurs ayant vaincu le Ptéroz étrange, et donne accès aux Pteroz parmi les Dinoz disponibles dans la Boutique.',
			de: 'Die Trophäe der Pteroz ist eine Belohung für Spieler, die den seltsamen Pteroz besiegt haben. Damit habt ihr im Geschäft die Möglichkeit, Pteroz als neue Dinogattung zu kaufen.',
			es: 'El Trofeo de los Teroz recompensa a los jugadores que hayan vencido al Teroz extraño. Asimismo, este objeto da acceso a la compra de los Dinos Teroz en la Tienda.'
		}
	},
	[StatTracking.HIPPO]: {
		id: StatTracking.HIPPO,
		name: {
			en: 'Hippoclamps Trophy',
			fr: 'Trophée des Hippoclamps',
			de: 'Trophäe der Hippoklampen',
			es: 'Trofeo de los Hippoclamp'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_hippo.gif'
			}
		],
		description: {
			en: 'The Hippoclamps Trophy is awarded to players who have defeated the wild Hippoclamp. It also unlocks the Hippoclamps, making it available to buy in the Dinoz Shop.',
			fr: "Le Trophée des Hippoclamps récompense les joueurs ayant vaincu l'Hippoclamp sauvage, et donne accès aux Hippoclamps parmi les Dinoz disponibles dans la Boutique.",
			de: 'Die Trophäe der Hippoklampen ist eine Belohnung für Spieler, die den wilden Hippoklampus besiegt haben. Damit habt ihr im Geschäft die Möglichkeit, Hippoklampen als neue Dinozgattung zu kaufen.',
			es: 'El Trofeo de los Hippoclamps recompensa a los jugadores que hayan vencido al Hippoclamp salvaje. Asimismo, este objeto da acceso a la compra de los Dinos Hippoclamp en la Tienda.'
		}
	},
	[StatTracking.ROCKY]: {
		id: StatTracking.ROCKY,
		name: {
			en: 'Rockies Trophy',
			fr: 'Trophée des Rockys',
			de: 'Trophäe der Rockys',
			es: 'Trofeo de los Rokkys'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_rocky.gif'
			}
		],
		description: {
			en: 'The Rockies Trophy is awarded to players who have defeated the sleeping Rocky. It also unlocks the Rocky, making it available to buy in the Dinoz Shop.',
			fr: 'Le Trophée des Rockys récompense les joueurs ayant vaincu le Rocky endormi, et donne accès aux Rockys parmi les Dinoz disponibles dans la Boutique.',
			de: 'Die Trophäe der Rockys ist eine Belohnung für Spieler, die den schläfrigen Rocky besiegt haben. Damit habt ihr im Geschäft die Möglichkeit, Rockys als neue Dinozgattung zu kaufen.',
			es: 'El Trofeo de los Rokkys recompensa a los jugadores que hayan vencido al Rokky dormido. Asimismo, este objeto da acceso a la compra de los Dinos Rokky en la Tienda.'
		}
	},
	[StatTracking.QUETZU]: {
		id: StatTracking.QUETZU,
		name: {
			en: 'Quetzu Trophy',
			fr: 'Trophée des Quetzus',
			de: 'Trophäe der Quetzu',
			es: 'Trofeo de los Quetzu'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_quetzu.gif'
			}
		],
		description: {
			en: 'The Quetzu Trophy is given by Mandragore to players who have defeated the Archdorogon Grizorg. This unlocks the Quetzu, making it available to buy in the Dinoz shop.',
			fr: "Le Trophée des Quetzus a été remis par Mandragore aux joueurs ayant vaincu l'Archidorogon Grizorg, il donne accès aux Quetzu parmi les Dinoz disponibles dans la Boutique.",
			de: 'Die Trophäe wurde dir von Mandragore nach dem Sieg über den Erzdorogon Grizorg verliehen. Sie gewährt dir u.a. Zugriff auf Quetzu im Dinoz-Geschäft.',
			es: 'El Trofeo de los Quetzu ha sido entregado por Mandrágora a los Maestros que hayan vencido al Archidorogón Grizorg. Da acceso al Dino Quetzu en la Tienda.'
		}
	},
	[StatTracking.TOUR]: {
		id: StatTracking.TOUR,
		name: {
			en: 'Dinoland Tour',
			fr: 'Tour de Dinoland',
			de: 'Dinolandtour',
			es: 'Vuelta al mundo de Dinoland'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 200,
				icon: 'collec_tour.gif'
			}
		],
		description: {
			en: 'This yellow shirt is awarded for your participation in the Dinoland Tour! You are now one of the great Dinoland explorers.',
			fr: 'Ce maillot jaune vous récompense pour votre magnifique Tour de Dinoland ! Vous faites désormais partie des grands explorateurs de Dinoland.',
			de: 'Dieses gelbe Trikot ist die Belohnung für deine großartige Dinolandtour! Du gehörst nun zu den großen Dinolanderforschern.',
			es: 'Este maillot amarillo te recompensa por la vuelta al mundo de Dinoland. Ya formas parte de los grandes exploradores de Dinoland.'
		}
	},
	[StatTracking.VENER]: {
		id: StatTracking.VENER,
		name: {
			en: 'Venerable Eye',
			fr: "L'oeil du Vénérable",
			de: 'Das Auge des Ehrwürdigen',
			es: 'El ojo del Venerable'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 300,
				icon: 'collec_vener.gif'
			}
		],
		description: {
			en: 'The Venerable Eye is an extremely rare item. Only the finest warriors can possess it! People say that it has incredibly powerful magical abilities.',
			fr: "L'Oeil du Vénérable est un objet extrêmement rare. Seuls les plus grands Guerriers peuvent l'obtenir ! On raconte qu'il aurait des propriétés magiques incroyablement puissantes...",
			de: 'Das Auge des Ehrwürdigen ist ein extrem seltener Gegenstand. Nur die größten Krieger können ihn erhalten! Es wird erzählt, dass er unglaublich starke magische Eigenschaften hätte.',
			es: "L'Oeil du El Ojo del Venerable es un objeto extremadamente raro. Solo los más grandes Guerreros consiguen obtenerlo. Se dice que tiene propiedades mágicas increíblemente poderosas."
		}
	},
	[StatTracking.TAURUS]: {
		id: StatTracking.TAURUS,
		name: {
			en: 'Taurus the magnificent',
			fr: 'Taurus le magnifique',
			de: 'Der fantastische Taurus',
			es: 'Taurus el Magnífico'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_taurus.gif'
			}
		],
		description: {
			en: "You helped Baobob to dispatch Taurus, the infamous Moueffe, to the depths of the Dark World. You're not ready to meet him again yet, although word of your courage is already spreading throughout Dinoland.",
			fr: "Vous avez aidé Baobob à refouler le puissant Moueffe infernal Taurus dans les profondeurs du Monde Sombre. Vous n'êtes pas prêt de le revoir, votre courage commence déjà à traverser les frontières de Dinoland.",
			de: 'Du hast Bao Bob dabei geholfen, den mächtigen und teuflischen Moeffe Taurus zurück in die Tiefen der dunklen Welt zu schicken. Du bist nicht bereit, ihn wiederzusehen. Dein Mut überschreitet bereits die Grenzen von Dinoland.',
			es: 'Has ayudado a Baobob a enviar al poderoso e infernal Moueffe Taurus a las profundidades del Mundo Sombra. Las historias sobre esta hazaña ya han dado la vuelta a todo Dinoland.'
		}
	},
	[StatTracking.MSG]: {
		id: StatTracking.MSG,
		name: {
			en: 'Official Dinoland Stamps',
			fr: 'Timbres homologués',
			de: 'Offizielle Briefmarken',
			es: 'Sellos homologados'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_msg.gif'
			}
		],
		description: {
			en: "This unlimited supply of stamps from the Dinoland Postal Militia is proof of your entitlement to stay in Dinoland for as long as you'd like.",
			fr: 'Ce stock illimité de timbres homologués par les Services Postaux Dinoziens valide votre séjour à Dinoville.',
			de: 'Mit diesem unbegrenzten Vorrat an offiziellen Briefmarken der Dinoz Post AG kannst du private Nachrichten versenden.',
			es: 'Este almacén ilimitado de sellos homologados por los Servicios Postales Dinonianos permite enviar mensajes privados.'
		}
	},
	[StatTracking.MAGNET]: {
		id: StatTracking.MAGNET,
		name: {
			en: 'Negative Lodestone Shard',
			fr: 'Eclat de Magnétite Négative',
			de: 'Splitter aus negativem Magnetit',
			es: 'Trozo de Magnetita Negativa'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 300,
				icon: 'collec_magnet.gif'
			}
		],
		description: {
			en: 'This Negative Lodestone Shard was given to you by the ing of the Rockies himself! Who knows what mysterious powers it holds.',
			fr: 'Cet éclat de Magnétite Négative vous a été offert par le Roi des Rockys en personne ! Qui sait quels pouvoirs mystérieux il possède...',
			de: 'Dieser Splitter aus negativem Magnetit wurde dir vom König der Rockys höchstpersönlich übergeben! Wer weiß was für mysteriöse Kräfte er in sich birgt...',
			es: '¡El Rey de los Rokkys en persona te ha ofrecido este trozo de Magnetita Negativa! A saber los misteriosos poderes que esconde...'
		}
	},
	[StatTracking.PLUME]: {
		id: StatTracking.PLUME,
		name: {
			en: 'Sidereal Feather',
			fr: 'Plume Sidérale',
			de: 'Sternenfeder',
			es: 'Pluma Sideral'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_plume.gif'
			}
		],
		description: {
			en: 'This feather, a gift from a distant traveller, allows you to edit your presentation on your player profile.',
			fr: "Cette plume, cadeau de quelqu'un venu de très loin, permet d'éditer la présentation de la fiche joueur.",
			de: "Diese Feder ist ein Geschenk von jemandem, der von seeeehr weit her gekommen ist. Mit ihr kannst du das Spielerprofil bearbeiten und in den 'Roleplay'-Bereich gelangen, der sich im Forum befindet.",
			es: 'Esta pluma es un regalo de procedencia muy lejana. Permite editar la presentación de la ficha del jugador.'
		}
	},
	[StatTracking.KAURA]: {
		id: StatTracking.KAURA,
		name: {
			en: 'Kabuki Aura',
			fr: 'Aura Kabuki',
			de: 'Kabuki-Aura',
			es: 'Aura Kabuki'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 300,
				icon: 'collec_kaura.gif'
			}
		],
		description: {
			en: 'The Kabuki Aura gives you access to Totem Island where you may find Kabukis, survivors of the Huge Cataclysm!',
			fr: "Cette aura permet d'accéder à l'Ile du Totem et d'y retrouver - peut-être - des Kabuki ayant survécu au Grand Cataclysme !",
			de: 'Mit dieser Aura kannst du auf die Toteminsel gehen und dort - vielleicht - Kabukis antreffen, die die Große Naturkatastrophe überlebt haben!',
			es: 'Este aura permite acceder a la Isla del Tótem. ¡Quizás encuentres allí a Kabukis que hayan sobrevivido al Gran Cataclismo!'
		}
	},
	[StatTracking.DEMON]: {
		id: StatTracking.DEMON,
		name: {
			en: 'Demon Scroll',
			fr: 'Parchemin du Démon',
			de: 'Dämonische Pergamentrolle',
			es: 'Pergamino del Demonio'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_demon.gif'
			}
		],
		description: {
			en: 'This ancient scroll gives you access to the Demon Shop in the Twilight Cemetary!',
			fr: "Cet ancien parchemin vous permettra d'accèder à la Boutique Démoniaque au Cimetière du Crépuscule !",
			de: 'Diese alte Pergamentrolle gewährt dir Zugang zur Dämonenboutique, die sich am Friedhof des Sonnenuntergangs befindet.',
			es: 'Este antiguo pergamino te permite acceder a la Tienda Demoníaca en el Cementerio del Crepúsculo.'
		}
	},
	[StatTracking.PMI]: {
		id: StatTracking.PMI,
		name: {
			en: 'Illustrated Mission Guidebook',
			fr: 'Petit Missionaire Illustré',
			de: 'Illustriertes Missionsbuch',
			es: 'Pequeño Misionario Ilustrado'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_pmi.gif'
			}
		],
		description: {
			en: 'The Illustrated Mission Guidebook lets you see the list of missions which have been completed by your Dinoz, and which remain to be completed.',
			fr: "Le Petit Missionnaire Illustré permet d'avoir accés à tout moment à la liste des missions effectuées et restant à faire pour vos Dinoz.",
			de: 'Das illustrierte Missionsbuch zeigt dir alle Missionen, die deine Dinoz bereits abgeschlossen oder noch vor sich haben.',
			es: 'El Pequeño Misionario Ilustrado te da acceso en todo momento a la lista de misiones efectuadas por tu Dino y las que le quedan por hacer..'
		}
	},
	[StatTracking.PDA]: {
		id: StatTracking.PDA,
		name: {
			en: 'Diamantite Pebble',
			fr: 'Pierre en Diamantite Agglomérée',
			de: 'Stein aus gepresstem Diamantit',
			es: 'Piedra en Diamantito Aglomerado'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_pda.gif'
			}
		],
		description: {
			en: 'The Diamantite Pebble is a stone which is packed with a naturally occurring array of elements which, when combined under pressure, allow the owner to see all their dinoz at a glance. The diamantite, on the other hand, is only for show.',
			fr: "La P.D.A. est une pierre remplie (chose surprenante) de technologie formée naturellement et permettant à l'éleveur d'avoir un aperçu de tous ses Dinoz en un simple coup d'oeil. La Diamantite au contraire c'est juste pour la frime.",
			de: 'Der Stein aus gepresstem Diamantit ist ein Stein, der mit natürlicher Technologie geformt wurde (was überraschend ist) und der den Züchtern erlaubt sich mit einem Blick eine Übersicht all seiner Dinoz zu verschaffen. Das Diamantit hingegen ist nur zum Angeben.',
			es: 'La PDA es una piedra producida con una tecnología especial que permite al maestro que la posea tener una visión general de todos sus Dinos. Lo del Diamantito es sólo para chulear.'
		}
	},
	[StatTracking.DICARB]: {
		id: StatTracking.DICARB,
		name: {
			en: 'Arborian Dictionary',
			fr: 'Dictionnaire Arboris',
			de: 'Wörterbuch Arborianisch',
			es: 'Diccionario Arboris'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 400,
				icon: 'collec_dicarb.gif'
			}
		],
		description: {
			en: 'A very old book, which you have managed to open, maybe now it can be used to decipher the Arborian language.',
			fr: "Un livre très ancien, vous avez réussi à l'ouvrir, il peut désormais servir à déchiffrer le langage Arboris.",
			de: 'Ein antikes, staubiges Buch, mit dessen Hilfe du die Sprache Arborianisch übersetzen kannst.',
			es: 'Un libro muy antiguo. ¡Has conseguido abrirlo! Ya puedes usarlo para descifrar el lenguaje Arboris.'
		}
	},
	[StatTracking.TID1]: {
		id: StatTracking.TID1,
		name: {
			en: 'Zen Medal',
			fr: 'Médaille zen',
			de: 'Zen Medaille',
			es: 'Medalla Zen'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_tid1.gif'
			}
		],
		description: {
			en: 'The zen medal is awarded to the top Dojo in Dinoland, there is no more powerful Dinoz master! You get all the glory, the fame and the respect of all other Dinoz masters...!!',
			fr: 'Félicitation pour avoir gagné le Tournoi Inter-Dojo ! La médaille zen récompense le meilleur Dojo existant à Dinoland, aucun maître Dinoz ne vous surpasse ! A vous la gloire, les flashs, le succès auprès des maîtres/maîtresses dinoz .... !!',
			de: 'Herzlichen Glückwunsch, du hast das Dojo Turnier gewonnen! Nur das beste Dojo erhält die Zen Medaille. Kein anderer Dinozzüchter kann dir das Wasser reichen! Genieße den Ruhm! :)',
			es: '¡Felicitaciones por haber ganado el Torneo Inter-Dojos!'
		}
	},
	[StatTracking.BELIUS]: {
		id: StatTracking.BELIUS,
		name: {
			en: 'Belius the Illustrious',
			fr: "Belius l'illustre",
			de: 'Belius',
			es: 'Belius EL Ilustre'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_belius.gif'
			}
		],
		description: {
			en: 'You have defeated the powerful Belius, the infernal Santaz. He has been sent back to the depths of the Dark World.',
			fr: 'Vous avez supprimé le puissant Santaz infernal Belius. Il est reparti dans les profondeurs du Monde Sombre.',
			de: 'Du hast den mächtigen, teuflischen Santaz Belius vernichtet. Er ist in die Tiefen der dunklen Welt zurückgekehrt.',
			es: 'Has vencido al poderoso Polvorón Infernal Belius y hecho que vuelva a las profundidades del Mundo Sombra.'
		}
	},
	[StatTracking.CAUSH]: {
		id: StatTracking.CAUSH,
		name: {
			en: 'Mandragore Doll',
			fr: 'Poupée Mandragore',
			de: 'Mandragore-Puppe',
			es: 'Muñeco de Mandrágora'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 300,
				icon: 'collec_caush.gif'
			}
		],
		description: {
			en: 'A doll in the likeness of Mandragore, which can be used as a voodoo doll, punching-bag or a pillow, as you choose.\tIt is in pretty poor condition, the previous owner must have taken their frustrations out on it on a regular basis.',
			fr: "Une poupée à l'éffigie de Mandragore, elle peut servir de poupée vaudou, punching-ball ou de coussin, c'est au choix. Elle est en piteuse état, l'ancien propriétaire a dû passer ses nerfs dessus assez souvent.",
			de: 'Die Puppe zeigt Mandragore da und kann als Voodoopuppe, Boxsack oder Kissen dienen - je nach Wetter und Laune. Sie ist in einem miserablen Zustand. Ihrem alten Besitzer müssen ziemlich oft die Nerven durchgegangen sein.',
			es: 'Un muñeco con la forma de Mandrágora puede servir como peluche o como cojín. Está en muy mal estado, su antiguo dueño debió sufrir varias crisis de nervios con él.'
		}
	},
	[StatTracking.FMEDAL]: {
		id: StatTracking.FMEDAL,
		name: {
			en: '3-eyed Medallion',
			fr: 'Médaillon à 3 yeux',
			de: '3-eyed Medallion',
			es: 'Medallón de 3 ojos'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 50,
				icon: 'collec_fmedal.gif'
			}
		],
		description: {
			en: 'This medallion opens the portal to the celestial temple.',
			fr: 'Ce médaillon ouvre le portail vers le temple céleste.',
			de: 'This medallion opens the portal to the celestial temple.',
			es: 'Este medallón abre las puertas del templo celeste.'
		}
	},
	[StatTracking.LABOWI]: {
		id: StatTracking.LABOWI,
		name: {
			en: 'Smogs Medallion',
			fr: 'Trophée des Smogs',
			de: '',
			es: 'Smogs Medallion'
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 50,
				icon: 'collec_labowi.gif'
			}
		],
		description: {
			en: 'This medallion proves that you have finished the smog quest.',
			fr: 'Ce trophée prouve que vous avez terminé la quête du Smog.',
			de: '',
			es: 'This medallion proves that you have finished the smog quest.'
		}
	},
	[StatTracking.MOVES]: {
		id: StatTracking.MOVES,
		name: {
			en: 'Adventurer',
			fr: 'Aventure',
			de: 'Abenteurer',
			es: 'Aventurero'
		},
		rare: 2,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_explor.gif',
				prefix: true,
				title: {
					en: 'Tourist',
					fr: 'Touriste',
					de: 'Tourist',
					es: 'Turista'
				},
				description: {
					en: 'What kind of adventurer are you?',
					fr: "Quel type d'aventurier êtes-vous ?",
					de: 'So ein Typ Abenteurer bist du',
					es: '¿Qué tipo de aventurero eres?'
				}
			},
			{
				count: 50,
				points: 1,
				prefix: true,
				title: {
					en: 'Marcher',
					fr: 'Marcheur',
					de: 'Marschierer',
					es: 'Caminante'
				}
			},
			{
				count: 100,
				points: 1,
				prefix: true,
				title: {
					en: 'Walker',
					fr: 'Promeneur',
					de: 'Spaziergänger',
					es: 'Visionario'
				}
			},
			{
				count: 500,
				points: 1,
				prefix: true,
				title: {
					en: 'Hiker',
					fr: 'Randonneur',
					de: 'Wanderer',
					es: 'Atleta'
				}
			},
			{
				count: 1000,
				points: 1,
				prefix: true,
				title: {
					en: 'Adventurer',
					fr: 'Aventurier',
					de: 'Abenteurer',
					es: 'Aventurero'
				}
			},
			{
				count: 2000,
				points: 1,
				suffix: true,
				title: {
					en: 'Brave Souls',
					fr: 'téméraire',
					de: 'durch dick und dünn',
					es: 'Temerario'
				}
			},
			{
				count: 5000,
				points: 1,
				title: {
					en: 'Grand Adventurer',
					fr: 'Grand aventurier',
					de: 'Großer Abenteurer',
					es: 'Gran Aventurero'
				}
			},
			{
				count: 10000,
				points: 1,
				prefix: true,
				title: {
					en: 'Explorer',
					fr: 'Explorateur',
					de: 'Entdecker',
					es: 'Explorador'
				}
			},
			{
				count: 25000,
				points: 1,
				suffix: true,
				title: {
					en: 'discoveries',
					fr: 'intrépide',
					de: 'ohne Furcht',
					es: 'Intrépido'
				}
			},
			{
				count: 40000,
				points: 1,
				title: {
					en: 'Grand Explorer',
					fr: 'Grand explorateur',
					de: 'Großer Entdecker',
					es: 'Gran Explorador'
				}
			},
			{
				count: 60000,
				points: 1,
				title: {
					en: 'Globe-trotter',
					fr: 'Globe-trotteur',
					de: 'Globetrotter',
					es: 'Trotamundos'
				}
			},
			{
				count: 75000,
				points: 1,
				title: {
					en: 'Supreme Explorer',
					fr: 'Explorateur suprême',
					de: 'Oberster Entdecker',
					es: 'Explorador Supremo'
				}
			},
			{
				count: 100000,
				points: 1,
				title: {
					en: 'Legendary Pioneer',
					fr: 'Pionnier ultime',
					de: 'Ultimativer Pionier',
					es: 'Pionero Legendario'
				}
			},
			{
				count: 150000,
				points: 1,
				title: {
					en: 'Dinoland Legend',
					fr: 'Légende de Dinoland',
					de: 'Dinoland-Legende',
					es: 'Leyenda de Dinoland'
				}
			}
		],
		description: {
			en: 'What kind of adventurer are you?',
			fr: "Quel type d'aventurier êtes-vous?",
			de: 'So ein Typ Abenteurer bist du',
			es: '¿Qué tipo de aventurero eres?'
		}
	},
	[StatTracking.DEATHS]: {
		id: StatTracking.DEATHS,
		name: {
			en: 'Deaths',
			fr: 'Morts',
			de: 'Tode',
			es: 'Inmortal'
		},
		rare: 1,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_barbare.gif',
				title: {
					en: 'Spirit Dinoz master',
					fr: 'Revenant de loin',
					de: 'Wiedergänger',
					es: 'Mala Hierba'
				},
				description: {
					en: 'How many times have you died in combat?',
					fr: 'Combien de fois êtes-vous mort au combat ?',
					de: 'So oft bist du im Kampf gefallen',
					es: 'Cantidad de veces que has muerto en combate'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Comeback King',
					fr: 'Esprit torturé',
					de: 'Gequälter Geist',
					es: 'Alma Perseverante'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					en: 'Master of Puppets',
					fr: 'Fantôme narcissique',
					de: 'Selbstverliebtes Gespenst',
					es: 'Reencanator Ultra'
				}
			},
			{
				count: 1000,
				points: 1,
				title: {
					en: 'Reincarnator 3k',
					fr: 'Réincarnator 3000',
					de: 'Reinkarnator 3000',
					es: 'Ave Fénix'
				}
			},
			{
				count: 1500,
				points: 1,
				title: {
					en: 'Mini Buddha',
					fr: "P'tit Bouddha",
					de: 'Kleiner Buddha',
					es: 'El Inmortal'
				}
			}
		],
		description: {
			en: 'How many times have you died in combat?',
			fr: 'Combien de fois êtes-vous mort au combat ?',
			de: 'So oft bist du im Kampf gefallen.',
			es: 'Cantidad de veces que has muerto en combate'
		}
	},
	[StatTracking.P_DAYS]: {
		id: StatTracking.P_DAYS,
		name: {
			en: 'Education',
			fr: 'Eleveur',
			de: 'Schüler',
			es: 'Criador de Dinos'
		},
		rare: 2,
		unlocks: [
			{
				count: 5,
				points: 1,
				icon: 'r_plume.gif',
				title: {
					en: 'Studious Pupil',
					fr: 'Elève attentif',
					de: 'Geduldiger Schüler',
					es: 'Alumno Atento'
				},
				description: {
					en: 'Number of days spent on the site.',
					fr: 'Nombre de jours de présence sur le site.',
					de: 'Anzahl der in Dinoland verbrachten Tage',
					es: 'Cantidad de días presente en el sitio.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					en: 'Attentive Orator',
					fr: 'Orateur éclairé',
					de: 'Aufgeklärter Redner',
					es: 'Orador Luminoso'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Gifted Preacher',
					fr: 'Prêcheur accompli',
					de: 'Vollkommener Prediger',
					es: 'Profeta en su Tierra'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Experienced Narrator',
					fr: 'Raconteur aguerri',
					de: 'Abgehärteter Erzähler',
					es: 'Lumbrera'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Archive Creator',
					fr: 'Grand conteur',
					de: 'Großer Märchenerzähler',
					es: 'Erudito'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					en: 'Master Historian',
					fr: 'Maître Historien',
					de: 'Professor für Geschichte',
					es: 'Eminencia'
				}
			},
			{
				count: 600,
				points: 1,
				title: {
					en: 'Ancient Oracle',
					fr: 'Grand Ancien',
					de: 'Enzyklopädie',
					es: 'Ancestro Mítico'
				}
			}
		],
		description: {
			en: 'Number of days spent on the site',
			fr: 'Nombre de jours de présence sur le site',
			de: 'Anzahl der in Dinoland verbrachten Tage',
			es: 'Cantidad de días presente en el sitio'
		}
	},
	[StatTracking.LVL_UP]: {
		id: StatTracking.LVL_UP,
		name: {
			en: 'Trainer',
			fr: 'Entraîneur',
			de: 'Trainer',
			es: 'Entrenador de Dinos'
		},
		rare: 2,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'small_lup_fix.gif',
				title: {
					en: 'Sunday Trainer',
					fr: 'Entraîneur du dimanche',
					de: 'Freizeit-Trainer',
					es: 'Entrenador Dominguero'
				},
				description: {
					en: 'Number of Level-ups carried out.',
					fr: 'Nombre de level-up réalisés.',
					de: 'Anzahl der Level-Ups',
					es: 'Cantidad de subida de niveles que has realizado.'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Apprentice Trainer',
					fr: 'Apprenti entraineur',
					de: 'Trainer-Novize',
					es: 'Aprendiz de Entrenador'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Amateur Trainer',
					fr: 'Entraîneur amateur',
					de: 'Amateur-Trainer',
					es: 'Entrenador Amateur'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Experienced Trainer',
					fr: 'Entraîneur expérimenté',
					de: 'Erfahrener Trainer',
					es: 'Entrenador Experimentado'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					en: 'Great Trainer',
					fr: 'Grand Entraîneur',
					de: 'Großer Trainer',
					es: 'Gran Entrenador'
				}
			},
			{
				count: 400,
				points: 1,
				title: {
					en: 'Ultimate Trainer',
					fr: 'Entraîneur ultime',
					de: 'Ultimativer Trainer',
					es: 'Entrenador Supremo'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					en: 'Grand Master',
					fr: 'Grand Maître',
					de: 'Großmeister',
					es: 'Excelentísimo Maestro'
				}
			}
		],
		description: {
			en: 'Number of Level-ups carried out',
			fr: 'Nombre de levelup réalisés',
			de: 'Anzahl der Level-Ups',
			es: 'Cantidad de subidas de niveles que has realizado'
		}
	},
	[StatTracking.KILL_M]: {
		id: StatTracking.KILL_M,
		name: {
			en: 'Monster Killer',
			fr: 'Tueur de monstres',
			de: 'Monsterjäger',
			es: 'Terror de monstruos'
		},
		rare: 2,
		unlocks: [
			{
				count: 50,
				points: 1,
				icon: 'r_monster.gif',
				title: {
					en: 'Monster Hunter',
					fr: 'Balayeur de restes',
					de: 'Freizeit-Jäger',
					es: 'Barredor de Restos'
				},
				description: {
					en: 'Number of monsters killed on your adventures.',
					fr: 'Nombre de monstres tués durant vos aventures.',
					de: 'Anzahl der von dir getöteten Monster',
					es: 'Cantidad de monstruos que mataste en tus aventuras.'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Scourge of Beasts',
					fr: 'Bourreau des corps',
					de: 'Leichenschinder',
					es: 'Cazador de Monstruos'
				}
			},
			{
				count: 1000,
				points: 1,
				title: {
					en: 'Monster Killer',
					fr: 'Chasseur de monstres',
					de: 'Monsterjäger',
					es: 'Mercenario'
				}
			},
			{
				count: 2000,
				points: 1,
				title: {
					en: 'Monster Annihilator',
					fr: 'Tueur barbare',
					de: 'Barbarentöter',
					es: 'Devorador de Monstruos'
				}
			},
			{
				count: 5000,
				points: 1,
				title: {
					en: 'Giant Killer',
					fr: 'Annihilateur de géant',
					de: 'Zerschmetterer der Riesen',
					es: 'Aniquilador'
				}
			},
			{
				count: 10000,
				points: 1,
				title: {
					en: 'Barbarian Destroyer',
					fr: 'Dévastateur de colosses',
					de: 'Verheerer der Kolosse',
					es: 'Practicante del F.U.A.'
				}
			},
			{
				count: 20000,
				points: 1,
				title: {
					en: 'Reaper of Titans',
					fr: 'Exterminateur de Titans',
					de: 'Vernichter der Titanen',
					es: 'Matador'
				}
			},
			{
				count: 50000,
				points: 1,
				title: {
					en: 'King of Chaos',
					fr: 'Roi du chaos',
					de: 'König des Chaos',
					es: 'Devorador de Monstruos'
				}
			},
			{
				count: 100000,
				points: 1,
				title: {
					en: 'God of Destruction',
					fr: 'Dieu de la destruction',
					de: 'Gott der Zerstörung',
					es: 'Exterminador de Monstruos'
				}
			}
		],
		description: {
			en: 'Number of monsters killed on your adventures',
			fr: 'Nombre de monstres tués durant vos aventures',
			de: 'Anzahl der von dir getöteten Monster',
			es: 'Cantidad de monstruos que mataste en tus aventuras'
		}
	},
	[StatTracking.KILL_D]: {
		id: StatTracking.KILL_D,
		name: {
			en: 'Dinoz Challenger',
			fr: 'Challenger de Dinoz',
			de: 'Dinoz-Herausforderer',
			es: 'Gladiador'
		},
		rare: 1,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'small_attack.gif',
				title: {
					en: 'Timid adversary',
					fr: 'Combattant timide',
					de: 'Schüchterner Kämpfer',
					es: 'Combatiente Tímido'
				},
				description: {
					en: 'Number of Dinoz defeated in events.',
					fr: 'Nombre de Dinoz vaincus durant les évènements',
					de: 'Anzahl der während Events besiegter Dinoz',
					es: 'Cantidad de Dinos vencidos en los eventos'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					en: 'Merciless Warrior',
					fr: 'Guerrier sans pitié',
					de: 'Krieger ohne Erbarmen',
					es: 'Guerrero Despiadado'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					en: 'Night Terror',
					fr: 'Terreur nocturne',
					de: 'Schrecken der Nacht',
					es: 'Terror del Enemigo'
				}
			},
			{
				count: 2000,
				points: 1,
				title: {
					en: 'Walking Nightmare',
					fr: 'Cauchemar ambulant',
					de: 'Wandelnder Alptraum',
					es: 'Pesadilla Andante'
				}
			},
			{
				count: 5000,
				points: 1,
				title: {
					en: 'Master Reaper',
					fr: 'Faucheur absolu',
					de: 'Schnitter',
					es: 'Ídolo Guerrero'
				}
			},
			{
				count: 10000,
				points: 1,
				title: {
					en: 'God of Death',
					fr: 'Dieu de la mort',
					de: 'Gott des Todes',
					es: 'Dios de la Muerte'
				}
			}
		],
		description: {
			en: 'Number of Dinoz defeated in events',
			fr: 'Nombre de Dinoz vaincus durant les évènements',
			de: 'Anzahl der während Events besiegter Dinoz',
			es: 'Cantidad de Dinos vencidos en los eventos'
		}
	},
	[StatTracking.HEAL_PV]: {
		id: StatTracking.HEAL_PV,
		name: {
			en: 'Health Points Recovered',
			fr: 'Point de vie récupérés',
			de: 'Wiedergewonnene Lebenspunkte',
			es: 'Puntos de vida recuperados'
		},
		rare: 0,
		unlocks: [
			{
				count: 500,
				points: 1,
				icon: 'r_heal.gif',
				title: {
					en: 'Sexy Nurse',
					fr: 'Infirmière sexy',
					de: 'Sexy Krankenschwester',
					es: 'Enfermero'
				},
				description: {
					en: 'How many HP have you regained?',
					fr: 'Combien de pv avez vous regagné ?',
					de: 'Soviele Lebenspunkte hast du wiedergewonnen',
					es: 'La cantidad de puntos de vida que has recuperado'
				}
			},
			{
				count: 5000,
				points: 1,
				title: {
					en: 'Doctor without borders',
					fr: 'Médecin sans frontière',
					de: 'Arzt ohne Grenzen',
					es: 'Curandero'
				}
			},
			{
				count: 15000,
				points: 1,
				title: {
					en: 'Superior Doctor',
					fr: 'Docteur supérieur',
					de: 'Versierter Leibarzt',
					es: 'Sanador'
				}
			},
			{
				count: 50000,
				points: 1,
				title: {
					en: 'Majestic Healer',
					fr: 'Guérisseur majestueux',
					de: 'Majestätischer Medizinmann',
					es: 'Médico sin Fronteras'
				}
			},
			{
				count: 100000,
				points: 1,
				title: {
					en: 'Chaos Surgeon',
					fr: 'Chirurgien du chaos',
					de: 'Chirurg des Chaos',
					es: 'Doctor Famoso'
				}
			},
			{
				count: 500000,
				points: 1,
				title: {
					en: 'Divine Omnipractician',
					fr: 'Omnipraticien divin',
					de: 'Hippokrates',
					es: 'Cirujano Divino'
				}
			}
		],
		description: {
			en: 'How many HP have you regained?',
			fr: 'Combien de pv avez vous regagnés ?',
			de: 'Soviele Lebenspunkte hast du wiedergewonnen',
			es: 'La cantidad de puntos de vida que has recuperado'
		}
	},
	[StatTracking.UP_WOOD]: {
		id: StatTracking.UP_WOOD,
		name: {
			en: 'Wood Specialist',
			fr: 'Spécialiste du bois',
			de: 'Holzspezialist',
			es: 'Especialista de Madera'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_wood.gif',
				title: {
					en: 'Tiny Acorn',
					fr: 'Jeune pi-mousse',
					de: 'Jungspund',
					es: 'Oledor de Madera'
				},
				description: {
					en: 'Number of Wood level-ups.',
					fr: "Nombre de up réalisés sur l'élément bois.",
					de: 'Anzahl der Level-Ups beim Holz-Element',
					es: 'Cantidad de subidas de nivel realizadas en elemento madera'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Young Shoot',
					fr: 'Belle au bois dormant',
					de: 'Meister Eder',
					es: 'Recogedor de Ramas'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Sturdy Oak',
					fr: 'Gueule de bois',
					de: 'Erfahrener Schreiner',
					es: 'Ayudante de Carpintero'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Megalomaniac Carpenter',
					fr: 'Charpentier mégalomaniaque',
					de: 'Begnadeter Zimmermann',
					es: 'Carpintero Supremo'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					en: 'Would a woodchuck chuck wood?',
					fr: 'Bûcheron ancestral',
					de: 'Ehrwürdiger Holzfäller',
					es: 'Leñador'
				}
			}
		],
		description: {
			en: 'Number of Wood level-ups',
			fr: "Nombre de up réalisés sur l'élément bois",
			de: 'Anzahl der Level-Ups beim Holz-Element',
			es: 'Cantidad de subidas de nivel realizadas en elemento madera'
		}
	},
	[StatTracking.UP_FIRE]: {
		id: StatTracking.UP_FIRE,
		name: {
			en: 'Fire Specialist',
			fr: 'Spécialiste du feu',
			de: 'Feuerspezialist',
			es: 'Especialista de Fuego'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_fire.gif',
				title: {
					en: 'Sparky',
					fr: 'Flammèche',
					de: 'Flämmchen',
					es: 'Chispa'
				},
				description: {
					en: 'Number of Fire level-ups.',
					fr: "Nombre de up réalisés sur l'élément feu.",
					de: 'Anzahl der Level-Ups beim Feuer-Element',
					es: 'Cantidad de subidas de nivel realizadas en elemento fuego'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Firestarter',
					fr: 'Brasier des ténèbres',
					de: 'Flamme der Finsternis',
					es: 'Flama de Vela'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Shadow Flame',
					fr: 'Flamme infernale',
					de: 'Infernale Flamme',
					es: 'Hoguera'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Infernal Furnace',
					fr: 'Maître du feu',
					de: 'Meister der Flammen',
					es: 'Maestro del Fuego'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					en: 'Divine Pyromaniac',
					fr: 'Pyromane divin',
					de: 'Göttlicher Pyromane',
					es: 'Piromaníaco Supremo'
				}
			}
		],
		description: {
			en: 'Number of Fire level-ups',
			fr: "Nombre de up réalisés sur l'élément feu",
			de: 'Anzahl der Level-Ups beim Feuer-Element',
			es: 'Cantidad de subidas de nivel realizadas en elemento fuego'
		}
	},
	[StatTracking.UP_LIGHTNING]: {
		id: StatTracking.UP_LIGHTNING,
		name: {
			en: 'Lightning Specialist',
			fr: 'Spécialiste de la foudre',
			de: 'Blitzspezialist',
			es: 'Especialista del Rayo'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_thunder.gif',
				title: {
					en: 'Volta',
					fr: 'Triton grillé',
					de: 'Kurzschluss',
					es: 'Luciérnaga'
				},
				description: {
					en: 'Number of Lightning level-ups.',
					fr: "Nombre de up réalisés sur l'élément foudre.",
					de: 'Anzahl der Level-Ups beim Blitz-Element',
					es: 'Cantidad de subidas de nivel realizadas en elemento rayo'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Overload',
					fr: 'Excès de vitesse',
					de: 'Überladung',
					es: 'Ráfaga'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Caged Lightning',
					fr: 'Eclair de génie',
					de: 'Blitzschlag',
					es: 'Flash'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Flash',
					fr: 'Guerrier foudroyant',
					de: 'Blitzschleuderer',
					es: 'Guerrero del Rayo'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					en: 'GigaWatt',
					fr: 'Maître du Saint-Elme',
					de: 'Mister 100.000 Volt',
					es: 'Dios de la Tormenta'
				}
			}
		],
		description: {
			en: 'Number of Lightning level-ups',
			fr: "Nombre de up réalisés sur l'élément foudre",
			de: 'Anzahl der Level-Ups beim Blitz-Element',
			es: 'Cantidad de subidas de nivel realizadas en elemento rayo'
		}
	},
	[StatTracking.UP_AIR]: {
		id: StatTracking.UP_AIR,
		name: {
			en: 'Air Specialist',
			fr: "Spécialiste de l'air",
			de: 'Luftspezialist',
			es: 'Especialista del Aire'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_air.gif',
				title: {
					en: 'Morning Breeze',
					fr: 'Gaz incolore',
					de: 'Morgenhauch',
					es: 'Gas'
				},
				description: {
					en: 'Number of Air level-ups.',
					fr: "Nombre de up réalisés sur l'élément air.",
					de: 'Anzahl der Level-Ups beim Luft-Element',
					es: 'Cantidad de subidas de nivel realizadas en elemento aire.'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Fresh Wind',
					fr: 'Vent vif',
					de: 'Frische Brise',
					es: 'Brisa'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Free as the air',
					fr: 'Libre comme l’air',
					de: 'Frei wie der Wind',
					es: 'Viento'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Devastating Cyclone',
					fr: 'Cyclone dévastateur',
					de: 'Verheerender Zyklon',
					es: 'Tornado'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					en: 'Rock you like a Hurricane',
					fr: 'Djinn furieux',
					de: 'Wütender Hurrikan',
					es: 'Ciclón'
				}
			}
		],
		description: {
			en: 'Number of Air level-ups',
			fr: "Nombre de up réalisés sur l'élément air",
			de: 'Anzahl der Level-Ups beim Luft-Element',
			es: 'Cantidad de subidas de nivel realizadas en elemento aire'
		}
	},
	[StatTracking.UP_WATER]: {
		id: StatTracking.UP_WATER,
		name: {
			en: 'Water Specialist',
			fr: "Spécialiste de l'eau",
			de: 'Wasserspezialist',
			es: 'Especialista en Agua'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_water.gif',
				title: {
					en: 'Rubber Duck',
					fr: 'Canard de bain',
					de: 'Gummiente',
					es: 'Pez'
				},
				description: {
					en: 'Number of Water level-ups.',
					fr: "Nombre de up réalisés sur l'élément eau.",
					de: 'Anzahl der Level-Ups beim Wasser-Element',
					es: 'Cantidad de subidas de nivel realizadas en elemento agua'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Leaky Faucet',
					fr: "Marin d'eau douce",
					de: 'Tropfender Wasserhahn',
					es: 'Tiburón'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Heart of Ice',
					fr: 'Coeur de glace',
					de: 'Herz aus Eis',
					es: 'Marea Alta'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Extreme flood',
					fr: 'Déluge extrême',
					de: 'Sintflut',
					es: 'Tsunami'
				}
			},
			{
				count: 800,
				points: 0,
				title: {
					en: 'Aqueous Abyss',
					fr: 'Faille abyssale',
					de: 'Wogender Abyss',
					es: 'Maremoto'
				}
			}
		],
		description: {
			en: 'Number of Water level-ups',
			fr: "Nombre de up réalisés sur l'élément eau",
			de: 'Anzahl der Level-Ups beim Wasser-Element',
			es: 'Cantidad de subidas de nivel realizadas en elemento agua'
		}
	},
	[StatTracking.BROKEN_SHOVEL]: {
		id: StatTracking.BROKEN_SHOVEL,
		name: {
			en: 'Shovel Smasher',
			fr: 'Casseur de pelles',
			de: 'Schaufelzerbrecher',
			es: 'Rompe-palas'
		},
		rare: 0,
		unlocks: [
			{
				count: 5,
				points: 1,
				icon: 'r_digger.gif',
				title: {
					en: 'Earthworm',
					fr: 'Ver de terre',
					de: 'Regenwurm',
					es: 'Gusano'
				},
				description: {
					en: 'Number of broken shovels.',
					fr: 'Nombre de pelles cassées.',
					de: 'Anzahl der von dir zerbrochenen Schaufeln',
					es: 'Cantidad de palas rotas.'
				}
			},
			{
				count: 10,
				points: 1,
				title: {
					en: 'Amateur Miner',
					fr: 'Mineur amateur',
					de: 'Amateur-Bergmann',
					es: 'Excavador'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					en: 'Craftsman Miner',
					fr: 'Galibot',
					de: 'Bergmann',
					es: 'Ayudante de Minero'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'JCB',
					fr: 'Porion',
					de: 'Erfahrener Bergmann',
					es: 'Minero'
				}
			},
			{
				count: 150,
				points: 1,
				title: {
					en: 'Celebrity Excavator',
					fr: 'Taupe herculéenne',
					de: 'Herkulesmaulwurf',
					es: 'Topo'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					en: 'Manic Miner',
					fr: 'Ravineur de légende',
					de: 'Legendärer Buddler',
					es: 'Escavador tectónico'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					en: 'Half-man, half-mole',
					fr: 'Excavateur souverain',
					de: 'Ruhmreicher Gräber',
					es: 'Visitante del Núcleo'
				}
			},
			{
				count: 2500,
				points: 0,
				title: {
					en: 'Subterranean Master',
					fr: 'Maître des profondeurs',
					de: 'Meister der Tiefen',
					es: 'Dios de las Profundidades'
				}
			}
		],
		description: {
			en: 'Number of broken shovels',
			fr: 'Nombre de pelles cassées',
			de: 'Anzahl der von dir zerbrochenen Schaufeln',
			es: 'Cantidad de palas rotas'
		}
	},
	[StatTracking.CHASSE]: {
		id: StatTracking.CHASSE,
		name: {
			en: 'Hunter',
			fr: 'Chasseur',
			de: 'Jäger',
			es: 'Cazador'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_hunt.gif',
				title: {
					en: 'Dinoville Hunt Subscriber',
					fr: 'Galinette Cendrée',
					de: 'Frischling',
					es: 'Colocador de Trampas'
				},
				description: {
					en: "Nombre d'actions de chasses réalisées.",
					fr: "Nombre d'actions de chasses réalisées.",
					de: 'Anzahl der durchgeführten Jagden',
					es: 'Cantidad de cazas realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					en: 'Reader of Hunting, Shooting, Fishing etc.',
					fr: "Champion d'appeau",
					de: 'Waidmann',
					es: 'Aprendiz de Cazador'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Weekend Huntsman',
					fr: 'Braconnier baraqué',
					de: 'Breitschultriger Wilderer',
					es: 'Cazador Profesional'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Sioux Trailfinder',
					fr: 'Pisteur véloce',
					de: 'Flinker Fährtenleser',
					es: 'Coleccionista'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					en: 'Master Trapper',
					fr: 'Trappeur aguerri',
					de: 'Abgehärteter Trapper',
					es: 'Gran Coleccionista'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					en: 'King of the Hunt',
					fr: 'Roi de la chasse',
					de: 'König der Jagd',
					es: 'Rey Cazador'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					en: 'God of the Hunt',
					fr: 'Dieu de la chasse',
					de: 'Gott der Jagd',
					es: 'Dios de la Caza'
				}
			}
		],
		description: {
			en: "Number of times you've set out to kill stuff!",
			fr: "Nombre d'actions de chasses réalisées",
			de: 'Anzahl der von dir durchgeführten Jagden',
			es: 'Cantidad de cazas realizadas'
		}
	},
	[StatTracking.CUEILLE]: {
		id: StatTracking.CUEILLE,
		name: {
			en: 'Harvester',
			fr: 'Cueilleur',
			de: 'Ernter',
			es: 'Recolector'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_gather.gif',
				title: {
					en: 'Dinoville Harvest Subscriber',
					fr: 'Cueilleur romantique',
					de: 'Blumenpflücker',
					es: 'Recolector Romántico'
				},
				description: {
					en: 'Number of harvesting operations carried out.',
					fr: "Nombre d'actions de cueillette réalisées.",
					de: 'Anzahl der von dir durchgeführten Ernten',
					es: 'Cantidad de recolecciones realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					en: 'Evil Herb Collector',
					fr: 'Ramasseur de mauvaises herbes',
					de: 'Unkrautjäter',
					es: 'Recolector Aficionado'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Time-served Picker',
					fr: 'Grapilleur expérimenté',
					de: 'Erfahrener Pflücker',
					es: 'Recolector Experimentado'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Modern Day Druid',
					fr: 'Druide des temps modernes',
					de: 'Druide der Neuzeit',
					es: 'Druida Moderno'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					en: 'Powerful Sorcerer',
					fr: 'Puissant sorcier',
					de: 'Mächtiger Hexer',
					es: 'Alquimista'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					en: 'King of the Harvest',
					fr: 'Roi des récoltes',
					de: 'König der Ernte',
					es: 'Rey de la Cosecha'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					en: 'God of the Harvest',
					fr: 'Dieu des récoltes',
					de: 'Gott der Ernte',
					es: 'Dios de la Cosecha'
				}
			}
		],
		description: {
			en: 'Number of harvesting operations carried out',
			fr: "Nombre d'actions de cueillette réalisées",
			de: 'Anzahl der von dir durchgeführten Ernten',
			es: 'Cantidad de recolecciones realizadas'
		}
	},
	[StatTracking.FISH]: {
		id: StatTracking.FISH,
		name: {
			en: 'Fisherman',
			fr: 'Pêcheur',
			de: 'Angler',
			es: 'Pescador'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_peche.gif',
				title: {
					en: 'Line Fisherman',
					fr: 'Pêcheur à la ligne',
					de: 'Kescher',
					es: 'Ayudante de Pescador'
				},
				description: {
					en: 'Number of fishing trips.',
					fr: "Nombre d'actions de pêche réalisées.",
					de: 'Anzahl deiner Angelausflüge',
					es: 'Cantidad de pescas realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					en: 'Fly Fisherman',
					fr: 'Pêcheur à la mouche',
					de: 'Fliegenfischer',
					es: 'Pescador Aficionado'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Deadliest Catch',
					fr: 'Pêcheur en haute mer',
					de: 'Hochseefischer',
					es: 'Pescador'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Fishing with Dynamite',
					fr: 'Pêcheur à la dynamite',
					de: 'Dynamit-Angler',
					es: 'Pescador de Río'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					en: 'Ultimate Fisherman',
					fr: 'Pêcheur ultime',
					de: 'Ultimativer Angler',
					es: 'Pescador de Alta Mar'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					en: 'King Fisherman',
					fr: 'Roi de la Pêche',
					de: 'König des Angelns',
					es: 'Rey de la Pesca'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					en: 'God of Fishing',
					fr: 'Dieu de la Pêche',
					de: 'Gott des Angelns',
					es: 'Dios de la Pesca'
				}
			}
		],
		description: {
			en: 'Number of fishing trips',
			fr: "Nombre d'actions de pêche réalisées",
			de: 'Anzahl deiner Angelausflüge',
			es: 'Cantidad de pescas realizadas'
		}
	},
	[StatTracking.ENERGY]: {
		id: StatTracking.ENERGY,
		name: {
			en: 'Energizer',
			fr: 'Energétiseur',
			de: 'Energizer',
			es: 'Energético'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_comp.gif',
				title: {
					en: "Energising? It's a bit scary!",
					fr: "Energétiser, je n'ose pas trop",
					de: 'Energizen? Also ich weiß nicht...',
					es: 'Pila AAA'
				},
				description: {
					en: 'Number of actions carried out which regenerate energy.',
					fr: "Nombre d'actions d'énergétisation réalisées.",
					de: 'Anzahl der Energizer-Aktionen',
					es: 'Cantidad de energizaciones realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					en: 'Energising? It beats eating!',
					fr: "Energétiser, c'est mieux que manger",
					de: 'Energizen? Besser als Essen',
					es: 'Batería Alcalina'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Energising? I live for it!',
					fr: "Energétiser, c'est toute ma vie",
					de: 'Energizen? Das ist mein Leben',
					es: 'Pararrayos'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Fission Researcher',
					fr: 'Chercheur en fission',
					de: 'Atomforscher',
					es: 'Maestro Atómico'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					en: 'Atomic Master',
					fr: 'Maître des atomes',
					de: 'Meister der Atome',
					es: 'Central Nuclear'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					en: 'King of Fusion',
					fr: 'Roi de la fusion',
					de: 'König der Fusion',
					es: 'Rey de la Fusión'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					en: 'God of Fusion',
					fr: 'Dieu de la fusion',
					de: 'Gott der Fusion',
					es: 'Dios de la Fusión'
				}
			}
		],
		description: {
			en: 'Number of actions carried out which regenerate energy',
			fr: "Nombre d'actions d'énergétisation réalisées",
			de: 'Anzahl der Energizer-Aktionen',
			es: 'Cantidad de energizaciones realizadas'
		}
	},
	[StatTracking.SEEK]: {
		id: StatTracking.SEEK,
		name: {
			en: 'Scavenger',
			fr: 'Fouilleur',
			de: 'Graber',
			es: 'Buscador'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_fouille.gif',
				title: {
					en: 'Pebble Collector',
					fr: 'Ramasseur de cailloux',
					de: 'Kieswühler',
					es: 'Recogedor de piedritas'
				},
				description: {
					en: 'Number of scavenges carried out.',
					fr: "Nombre d'actions de fouilles réalisées.",
					de: 'Anzahl der von dir ausgeführten Grabungen',
					es: 'Cantidad de excavaciones realizadas.'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					en: 'Skilled Scavenger',
					fr: 'Fouilleur assidu',
					de: 'Eifriger Buddler',
					es: 'Excavador aficionado'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Ruin Fan',
					fr: 'Amateur de ruines',
					de: 'Ruinennovize',
					es: 'Excavador profesional'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Documented Architect',
					fr: 'Archéologue documenté',
					de: 'Diplomierter Archäologe',
					es: 'Maestro de excavaciones'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					en: 'Treasure Inventor',
					fr: 'Inventeur de trésor',
					de: 'Schatzfinder',
					es: 'Buscatesoros'
				}
			},
			{
				count: 1000,
				points: 0,
				title: {
					en: '>Master of Discoveries',
					fr: 'Maître des décombres',
					de: 'Herr der Ausgrabungen',
					es: 'Arqueólogo'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					en: 'Expert on Ancient Worlds',
					fr: 'Expert des mondes Antiques',
					de: 'Fachmann für Antike',
					es: 'Gran Descubridor'
				}
			}
		],
		description: {
			en: 'Number of scavenges carried out',
			fr: "Nombre d'actions de fouilles réalisées",
			de: 'Anzahl der von dir ausgeführten Grabungen',
			es: 'Cantidad de excavaciones realizadas'
		}
	},
	[StatTracking.MARKET]: {
		id: StatTracking.MARKET,
		name: {
			en: 'Salesman',
			fr: 'Vendeur',
			de: 'Verkäufer',
			es: 'Vendedor'
		},
		rare: 0,
		unlocks: [
			{
				count: 2,
				points: 1,
				icon: 'r_market.gif',
				title: {
					en: 'Soul of Camelot',
					fr: 'Âme de camelot',
					de: 'Seele von Camelot',
					es: 'Vendedor Debutante'
				},
				description: {
					en: 'Number of sales made at the market.',
					fr: 'Nombre de ventes conclues au marché.',
					de: 'Anzahl der auf dem Markt verkauften Artikel',
					es: 'Cantidad de ventas en el Mercado.'
				}
			},
			{
				count: 5,
				points: 1,
				title: {
					en: 'Bric-a-brac stallkeeper',
					fr: 'Brocanteur futé',
					de: 'Pfiffiger Trödelhändler',
					es: 'Vendedor Ocasional'
				}
			},
			{
				count: 10,
				points: 1,
				title: {
					en: 'Wise Trader',
					fr: 'Marchand avisé',
					de: 'Besonnener Verkäufer',
					es: 'Vendedor Reconocido'
				}
			},
			{
				count: 20,
				points: 1,
				title: {
					en: 'Experienced Merchant',
					fr: 'Fournisseur expérimenté',
					de: 'Erfahrener Anbieter',
					es: 'Vendedor Experimentado'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Dinoz Broker',
					fr: 'Négociant en Dinoz',
					de: 'Gordon Dinoz',
					es: 'Proveedor de Dinos'
				}
			},
			{
				count: 100,
				points: 0,
				title: {
					en: 'Master Trafficker',
					fr: 'Maître Trafiquant',
					de: 'Meister der Verschieber',
					es: 'Gran Distribuidor'
				}
			},
			{
				count: 500,
				points: 0,
				title: {
					en: 'Traffick-King',
					fr: 'Roi Trafiquant',
					de: 'König der Verschieber',
					es: 'Traficante de Dinos'
				}
			}
		],
		description: {
			en: 'Number of sales made at the market',
			fr: 'Nombre de ventes conclues au marché',
			de: 'Anzahl der auf dem Markt verkauften Artikel',
			es: 'Cantidad de ventas en el Mercado'
		}
	},
	[StatTracking.S_BUYER]: {
		id: StatTracking.S_BUYER,
		name: {
			en: 'Buyer',
			fr: 'Acheteur',
			de: 'Käufer',
			es: 'Comprador'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_purse.gif',
				title: {
					en: 'Bargain Hunter',
					fr: 'Chineur du dimanche',
					de: 'Schnäppchenjäger',
					es: 'Comprador Ocasional'
				},
				description: {
					en: 'Number of purchases made in the shop',
					fr: "Nombre d'objet acquis en boutique",
					de: 'Anzahl der in Geschäften gekauften Artikel',
					es: 'Cantidad de objetos adquiridos en la tienda'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Aware Buyer',
					fr: 'Acheteur averti',
					de: 'Erfahrener Käufer',
					es: 'Comprador Novato'
				}
			},
			{
				count: 200,
				points: 1,
				title: {
					en: 'Compulsive Buyer',
					fr: 'Consommateur compulsif',
					de: 'Zwanghafter Käufer',
					es: 'Comprador Exigente'
				}
			},
			{
				count: 500,
				points: 1,
				title: {
					en: 'Panic Buyer',
					fr: 'Acquéreur fièvreux',
					de: 'Kaufsüchtiger',
					es: 'Comprador Exquisito'
				}
			},
			{
				count: 2000,
				points: 1,
				title: {
					en: 'Master Promoter',
					fr: 'Maître promoteur',
					de: 'Meisterpromoter',
					es: 'Casi Magnate'
				}
			},
			{
				count: 10000,
				points: 1,
				title: {
					en: 'Caveat Emptor',
					fr: 'Géant de la consommation',
					de: 'Ungezügelter Konsument',
					es: 'Magnate'
				}
			},
			{
				count: 25000,
				points: 0,
				title: {
					en: 'Hardcore Gamer',
					fr: 'Hardcore gamer',
					de: 'Hardcore-Gamer',
					es: 'Super Magnate'
				}
			}
		],
		description: {
			en: 'Number of purchases made in the shop',
			fr: "Nombre d'objets acquis en boutique",
			de: 'Anzahl der in Geschäften gekauften Artikel',
			es: 'Cantidad de objetos adquiridos en la tienda'
		}
	},
	[StatTracking.CLANS]: {
		id: StatTracking.CLANS,
		name: {
			en: 'Community Life',
			fr: 'Vie communautaire',
			de: 'Leben in der Community',
			es: 'Fama'
		},
		rare: 0,
		unlocks: [
			{
				count: 5,
				points: 1,
				icon: 'r_mercenaire.gif',
				prefix: true,
				title: {
					en: 'Vagabond',
					fr: 'Vagabond',
					de: 'Vagabund',
					es: 'Vagabundo'
				},
				description: {
					en: 'Number of clans this player has appeared in.',
					fr: 'Nombre de clans dans lequel le joueur a été aperçu.',
					de: 'Anzahl der Klans, in denen du schon einmal warst',
					es: 'Cantidad de clanes en los que has sido identificado.'
				}
			},
			{
				count: 50,
				points: 0,
				prefix: true,
				title: {
					en: 'Mercenary',
					fr: 'Mercenaire',
					de: 'Söldner',
					es: 'Mercenario'
				}
			},
			{
				count: 100,
				points: 0,
				prefix: true,
				title: {
					en: 'Dorogon Knight',
					fr: 'Chevalier Dorogon',
					de: 'Ritter der Dorogon',
					es: 'Caballero Dorogón'
				}
			}
		],
		description: {
			en: 'Number of clans this player has appeared in',
			fr: 'Nombre de clans dans lequel le joueur a été aperçu',
			de: 'Anzahl der Klans, in denen du schon einmal warst',
			es: 'Cantidad de clanes en los que has sido identificado'
		}
	},
	[StatTracking.BEAUTY]: {
		id: StatTracking.BEAUTY,
		name: {
			en: 'Beautician',
			fr: 'Plasticien',
			de: 'Kosmetiker',
			es: 'Estrella'
		},
		rare: 0,
		unlocks: [
			{
				count: 2,
				points: 1,
				icon: 'r_beauty.gif',
				title: {
					en: 'Gifted Groomer',
					fr: 'Toiletteur doué',
					de: 'Begabter Friseur',
					es: 'Ojos lindos'
				},
				description: {
					en: "Number of Beauty Contest titles won by this player's dinoz.",
					fr: 'Nombre de titres de beautés remportés par les Dinoz du joueur.',
					de: 'Anzahl der von deinen Dinoz gewonnenen Schönheitstitel',
					es: 'Cantidad de títulos de belleza.'
				}
			},
			{
				count: 5,
				points: 0,
				title: {
					en: 'Qualified Make-up Artist',
					fr: 'Maquilleur chevronné',
					de: 'Versierter Maskenbildner',
					es: 'Buena pinta'
				}
			},
			{
				count: 10,
				points: 0,
				title: {
					en: 'Aesthetic Designer',
					fr: 'Designer esthète',
					de: 'Ästhet & Designer',
					es: 'Guapo del barrrio'
				}
			},
			{
				count: 20,
				points: 0,
				title: {
					en: 'Professional Beautician',
					fr: 'Plasticien professionnel',
					de: 'Schönheitschirurg',
					es: 'Perfil Griego'
				}
			},
			{
				count: 50,
				points: 0,
				title: {
					en: 'Master Aesthetician',
					fr: 'Maître Apollon',
					de: 'Meister Apollo',
					es: 'Maestro Apolo'
				}
			}
		],
		description: {
			en: "Number of Beauty Contest titles won by this player's dinoz",
			fr: 'Nombre de titres de beautés remportés par les Dinoz du joueur',
			de: 'Anzahl der von deinen Dinoz gewonnenen Schönheitstitel',
			es: 'Cantidad de títulos de belleza'
		}
	},
	[StatTracking.GDC_ATK]: {
		id: StatTracking.GDC_ATK,
		name: {
			en: 'Attacker',
			fr: 'Assaillant',
			de: 'Angreifer',
			es: 'Atacante'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_attack.gif',
				title: {
					en: 'Battlefield dwarf',
					fr: 'Nain des champs de bataille',
					de: 'Kampfzwerg',
					es: 'Duende'
				},
				description: {
					en: 'Number of attacks carried out against enemy castles.',
					fr: "Nombre d'attaques menées contre un château adverse.",
					de: 'So oft hast du ein gegnerisches Schloss angegriffen',
					es: 'Cantidad de atacantes enviados al castillo enemigo.'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Scourge of the Sandbox',
					fr: 'Terreur des bacs à sable',
					de: 'Sandkastenschreck',
					es: 'Bárbaro'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Pit Pillager',
					fr: 'Screugnargneux',
					de: 'Schlossstürmer',
					es: 'Golpeador'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					en: 'Barricade Basher',
					fr: 'Barbar’apapa',
					de: 'Stürmender Barbar',
					es: 'Guerrillero'
				}
			},
			{
				count: 800,
				points: 1,
				title: {
					en: 'Scarecrusher',
					fr: 'Epouvantraille',
					de: 'Herzloser Belagerer',
					es: 'Demoledor'
				}
			},
			{
				count: 1500,
				points: 0,
				title: {
					en: 'Hardcore Attacker',
					fr: 'Gros bourrin',
					de: 'Gefürchteter Schleifer',
					es: 'Rompecastillos'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					en: 'Destructor General',
					fr: 'Roi destructeur',
					de: 'Legendärer Zerstörer',
					es: 'Gran Devastador'
				}
			},
			{
				count: 3000,
				points: 0,
				title: {
					en: 'Almighty Destroyer',
					fr: 'Dieu destructeur',
					de: 'Gott der Zerstörung',
					es: 'Dios de la Guerra'
				}
			}
		],
		description: {
			en: 'Number of attacks carried out against enemy castles',
			fr: "Nombre d'attaques menées contre un château adverse",
			de: 'So viele Male hast du ein gegnerisches Schloss angegriffen',
			es: 'Cantidad de atacantes enviados al castillo enemigo'
		}
	},
	[StatTracking.GDC_DEF]: {
		id: StatTracking.GDC_DEF,
		name: {
			en: 'Defender',
			fr: 'Defenseur',
			de: 'Verteidiger',
			es: 'Defensor'
		},
		rare: 0,
		unlocks: [
			{
				count: 10,
				points: 1,
				icon: 'r_defense.gif',
				title: {
					en: 'Thorn in the foot',
					fr: 'Epine dans le pied',
					de: 'Splitter im Fuß',
					es: 'Vigilante'
				},
				description: {
					en: 'Number of times you have defended your castle.',
					fr: 'Nombre de fois où vous avez défendu votre château.',
					de: 'So viele Male hast du dein Schloss verteidigt',
					es: 'Cantidad de veces que has defendido tu castillo.'
				}
			},
			{
				count: 50,
				points: 1,
				title: {
					en: 'Mousetrap',
					fr: 'Piège à loup',
					de: 'Wolfsfalle',
					es: 'Guardián'
				}
			},
			{
				count: 100,
				points: 1,
				title: {
					en: 'Stake Pit',
					fr: 'Barricade magique',
					de: 'Magische Barrikade',
					es: 'Escudero'
				}
			},
			{
				count: 300,
				points: 1,
				title: {
					en: 'Bear Trap',
					fr: 'Chevalier émérite',
					de: 'Gewandter Ritter',
					es: 'Valiente'
				}
			},
			{
				count: 800,
				points: 1,
				title: {
					en: 'Brave Heart',
					fr: 'Coeur vaillant',
					de: 'Tapferes Herz',
					es: 'Corazón Valiente'
				}
			},
			{
				count: 1500,
				points: 0,
				title: {
					en: 'Defender Rampant',
					fr: 'Rempart sacré',
					de: 'Gesegneter Schutzwall',
					es: 'Gran Protector'
				}
			},
			{
				count: 2000,
				points: 0,
				title: {
					en: 'Brick Top',
					fr: 'Mur ultime',
					de: 'Unüberwindbare Mauer',
					es: 'Héroe Defensor'
				}
			},
			{
				count: 3000,
				points: 0,
				title: {
					en: 'Knight of Legend',
					fr: 'Paladin légendaire',
					de: 'Legendärer Paladin',
					es: 'Defensor Legendario'
				}
			}
		],
		description: {
			en: 'Number of times you have defended your castle',
			fr: 'Nombre de fois où vous avez défendu votre château',
			de: 'So viele Male hast du dein Schloss verteidigt',
			es: 'Cantidad de veces que has defendido tu castillo'
		}
	},
	[StatTracking.BGUM]: {
		id: StatTracking.BGUM,
		name: {
			en: 'Dinoland Community',
			fr: 'Médaille cool',
			de: 'Dinoland Community',
			es: 'Heraldo de Dinoland'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_bgum.gif',
				title: {
					en: 'Kiss Cool™',
					fr: 'Bisou Cool™',
					de: 'Lotse',
					es: 'Simpático™'
				},
				description: {
					en: 'For those who are committed to making Dinoland an even better place!',
					fr: 'Vous oeuvrez pour rendre le monde de Dinoland encore meilleur !',
					de: 'Du bist ein aktives Mitglieder der Dinoland-Community!',
					es: '¡Maestros como tú hacen que Dinoland sea cada vez mejor!'
				}
			},
			{
				count: 5,
				points: 0,
				title: {
					en: 'Proven Mediator',
					fr: 'Mediator accordé',
					de: 'Beredter Vermittler',
					es: 'Maestro reconocido'
				}
			},
			{
				count: 10,
				points: 0,
				title: {
					en: 'Good Time Manager',
					fr: 'Tenancier du bon goût',
					de: 'Guter Geschmack im Überfluss',
					es: 'Maestro famoso'
				}
			},
			{
				count: 15,
				points: 0,
				title: {
					en: 'Enlightener of the Dark World',
					fr: 'Eclaireur du monde sombre',
					de: 'Erleuchter der dunklen Welt',
					es: 'Iluminador del Mundo Sombra'
				}
			},
			{
				count: 20,
				points: 0,
				title: {
					en: 'Michael the Guide v2.0',
					fr: 'Guide Michel 2.0',
					de: 'Guide Michel 2.0',
					es: 'Guía Michel 2.0'
				}
			},
			{
				count: 30,
				points: 0,
				title: {
					en: "Papy Joe's Twin",
					fr: 'Jumeau de Papy joe',
					de: 'Papy Joes Zwilling',
					es: 'Nieto de Papy Jose'
				}
			},
			{
				count: 50,
				points: 0,
				title: {
					en: "Bao's Ancestor",
					fr: 'Ancêtre de Bao',
					de: 'Vorfahre Baos',
					es: 'Ancestro de Bao'
				}
			},
			{
				count: 100,
				points: 0,
				title: {
					en: 'Archdorogon',
					fr: 'Archidorogon',
					de: 'Erzdorogon',
					es: 'Archidorogón'
				}
			},
			{
				count: 150,
				points: 0,
				title: {
					en: '6th Guardian of Dinoland',
					fr: '6ème Gardien de Dinoland',
					de: '6. Wächter von Dinoland',
					es: '6to Guardián de Dinoland'
				}
			}
		],
		description: {
			en: 'The most giving of Dinoz masters',
			fr: 'La crême des maîtres Dinoz',
			de: 'Die Crème de la Crème der Dinozmeister',
			es: 'Aportes al sitio y a la comunidad'
		}
	},
	[StatTracking.MEDAL_1]: {
		id: StatTracking.MEDAL_1,
		name: {
			en: 'Gold Medal',
			fr: "Médaille d'or",
			de: 'Goldmedaille',
			es: 'Medalla dinolímpica de oro'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_medgol.gif',
				title: {
					en: 'Gold Medal',
					fr: "Médaille d'or",
					de: 'Goldmedaille',
					es: 'Medallista olímpico de oro'
				},
				description: {
					en: 'You finished first! Congratulations!',
					fr: 'Vous avez fini premier ! Félicitations !',
					de: 'Herzlichen Glückwunsch, ihr seid erster!',
					es: '¡Eres el Número 1 en los juegos Dinolímpicos! ¡Hurraa!'
				}
			}
		],
		description: {
			en: 'You are the Dinolympic Games Gold Medallist! Congratulations!',
			fr: 'Vous avez fini premier !',
			de: 'Ihr seid erster!',
			es: '¡Eres el Número 1 en los juegos Dinolímpicos! ¡Hurraa!'
		}
	},
	[StatTracking.MEDAL_2]: {
		id: StatTracking.MEDAL_2,
		name: {
			en: 'Silver medal',
			fr: "Médaille d'argent",
			de: 'Silbermedaille',
			es: 'Medalla dinolímpica de plata'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_medsil.gif',
				title: {
					en: 'Silver Medal',
					fr: "Médaille d'argent",
					de: 'Silbermedaille',
					es: 'Medallista olímpico de plata'
				},
				description: {
					en: 'You finished second! Bravo!',
					fr: 'Vous avez fini second ! Bravo !',
					de: 'Bravo, ihr seid zweiter!',
					es: '¡Segundo lugar en los 1ros. Juegos Dinolímpicos Internacionales!'
				}
			}
		],
		description: {
			en: 'The Silver Medallist in the 1st Dinolympic Games!',
			fr: 'Vous avez fini second !',
			de: 'Bravo, ihr seid zweiter',
			es: '¡Segundo lugar en los 1ros. Juegos Dinolímpicos Internacionales!'
		}
	},
	[StatTracking.MEDAL_3]: {
		id: StatTracking.MEDAL_3,
		name: {
			en: 'Bronze Medal',
			fr: 'Médaille de bronze',
			de: 'Bronzemedaille',
			es: 'Medalla dinolímpica de bronce'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_medbro.gif',
				title: {
					en: 'Bronze Medal',
					fr: 'Médaille de bronze',
					de: 'Bronzemedaille',
					es: 'Medallista olímpico de bronce'
				},
				description: {
					en: 'You finished third! Great performance!',
					fr: "Vous avez fini troisième ! C'est une très belle performance !",
					de: 'Ihr seid auf Rang drei. Super Leistung!',
					es: '¡Tercer lugar en los 1ros. Juegos Dinolímpicos Internacionales!'
				}
			}
		],
		description: {
			en: 'The Bronze medal winner in the 1st Dinolympic Games!',
			fr: 'Vous avez fini troisième !',
			de: 'Ihr seid auf Rang drei!',
			es: '¡Tercer lugar en los 1ros. Juegos Dinolímpicos Internacionales!'
		}
	},
	[StatTracking.MEDAL_4]: {
		id: StatTracking.MEDAL_4,
		name: {
			en: 'Participation Medal',
			fr: 'Médaille de participation',
			de: 'Teilnahmemedaille',
			es: 'Medalla dinolímpica de vidrio'
		},
		rare: 1,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'r_medpla.gif',
				title: {
					en: 'Dinolympic Medal',
					fr: 'Médaille de participation',
					de: 'Teilnahmemedaille',
					es: 'Atleta olímpico'
				},
				description: {
					en: 'Dinolympic Athlete - be proud of your achievements!',
					fr: 'Vous avez réussi à vous classer parmi les meilleurs participants !',
					de: 'Ihr gehört zu den besten Teilnehmern!!',
					es: '¡Te colocaste en el Top 10 de nuestro servidor en los 1ros. Juegos Dinolímpicos!'
				}
			}
		],
		description: {
			en: 'You were ranked amongst the top Dinolympic competitors!',
			fr: 'Vous avez réussi à vous classer parmi les meilleurs participants !',
			de: 'Ihr gehört zu den besten Teilnehmern!',
			es: '¡Te colocaste en el Top 10 de nuestro servidor en los 1ros. Juegos Dinolímpicos!'
		}
	},
	[StatTracking.LEVELUP_1]: {
		id: StatTracking.LEVELUP_1,
		name: {
			en: '1st Limit Broken',
			fr: '1ère limite brisée',
			de: '1st Limit Broken',
			es: '1er limite roto'
		},
		rare: 0,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'fx_lvlup1.gif',
				title: {
					en: '2nd Limit Broken',
					fr: '1ère limite brisée',
					de: '2nd Limit Broken',
					es: '1er limite roto'
				},
				description: {
					en: 'Your dinoz have evolved and reached level 60!',
					fr: "Vous avez fait évoluer vos dinoz jusqu'au niveau 60 !",
					de: 'Your dinoz have evolved and reached level 60!',
					es: '¡Has hecho evolucionar tus Dinos hasta el nivel 60!'
				}
			}
		],
		description: {
			en: 'Your dinoz have evolved!',
			fr: 'Vos dinoz ont évolué !',
			de: 'Your dinoz have evolved!',
			es: '¡Tus dinos han evolucionado!'
		}
	},
	[StatTracking.LEVELUP_2]: {
		id: StatTracking.LEVELUP_2,
		name: {
			en: '2nd Limit Broken',
			fr: '2ème limite brisée',
			de: '2nd Limit Broken',
			es: '2do limite roto'
		},
		rare: 0,
		unlocks: [
			{
				count: 1,
				points: 0,
				icon: 'fx_lvlup2.gif',
				title: {
					en: '2nd Limit Broken',
					fr: '2ème limite brisée',
					de: '2nd Limit Broken',
					es: '2do limite roto'
				},
				description: {
					en: 'Your dinoz have evolved and reached level 70!',
					fr: "Vous avez fait évoluer vos dinoz jusqu'au niveau 70 !",
					de: 'Your dinoz have evolved and reached level 70!',
					es: '¡Has hecho evolucionar tus Dinos hasta el nivel 70!'
				}
			}
		],
		description: {
			en: 'Your dinoz have evolved!',
			fr: 'Vos dinoz ont évolué !',
			de: 'Your dinoz have evolved!',
			es: '¡Tus dinos han evolucionado!'
		}
	},
	[StatTracking.CARD]: {
		id: StatTracking.CARD,
		name: {
			en: 'Merguez Deluxe Loyalty Card', // TODO: Translation pending review
			fr: 'Carte de Fidélité Merguez Deluxe',
			de: 'Merguez-Deluxe-Treuekarte', // TODO: Translation pending review
			es: 'Tarjeta de Fidelidad Merguez Deluxe' // TODO: Translation pending review
		},
		rare: 0,
		hidden: true,
		unlocks: [
			{
				count: 1,
				points: 100,
				icon: 'collec_card.webp'
			}
		],
		description: {
			en: 'Grillée à la perfection et tamponnée par le Vendeur de Merguez lui-même, cette carte sacrée récompense les estomacs les plus endurants. Après avoir englouti un nombre indécent de merguez, vous voilà promu au rang de Grand Gourmand Officiel. Dorénavant, vos achats explosent les compteurs : x100 merguez d’un coup, parce que x5, c’est pour les amateurs.', // TODO: No translation available
			fr: 'Grillée à la perfection et tamponnée par le Vendeur de Merguez lui-même, cette carte sacrée récompense les estomacs les plus endurants. Après avoir englouti un nombre indécent de merguez, vous voilà promu au rang de Grand Gourmand Officiel. Dorénavant, vos achats explosent les compteurs : x100 merguez d’un coup, parce que x5, c’est pour les amateurs.',
			de: 'Grillée à la perfection et tamponnée par le Vendeur de Merguez lui-même, cette carte sacrée récompense les estomacs les plus endurants. Après avoir englouti un nombre indécent de merguez, vous voilà promu au rang de Grand Gourmand Officiel. Dorénavant, vos achats explosent les compteurs : x100 merguez d’un coup, parce que x5, c’est pour les amateurs.', // TODO: No translation available
			es: 'Grillée à la perfection et tamponnée par le Vendeur de Merguez lui-même, cette carte sacrée récompense les estomacs les plus endurants. Après avoir englouti un nombre indécent de merguez, vous voilà promu au rang de Grand Gourmand Officiel. Dorénavant, vos achats explosent les compteurs : x100 merguez d’un coup, parce que x5, c’est pour les amateurs.' // TODO: No translation available
		}
	}
};
