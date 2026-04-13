
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 6.5.0
 * Query Engine version: 173f8d54f8d52e692c7e27e72a88314ec7aeff60
 */
Prisma.prismaVersion = {
  client: "6.5.0",
  engine: "173f8d54f8d52e692c7e27e72a88314ec7aeff60"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.ConcentrationScalarFieldEnum = {
  id: 'id'
};

exports.Prisma.RelationLoadStrategy = {
  query: 'query',
  join: 'join'
};

exports.Prisma.DinozScalarFieldEnum = {
  id: 'id',
  leaderId: 'leaderId',
  name: 'name',
  raceId: 'raceId',
  level: 'level',
  nextUpElementId: 'nextUpElementId',
  nextUpAltElementId: 'nextUpAltElementId',
  placeId: 'placeId',
  canChangeName: 'canChangeName',
  display: 'display',
  life: 'life',
  maxLife: 'maxLife',
  experience: 'experience',
  nbrUpFire: 'nbrUpFire',
  nbrUpWood: 'nbrUpWood',
  nbrUpWater: 'nbrUpWater',
  nbrUpLightning: 'nbrUpLightning',
  nbrUpAir: 'nbrUpAir',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
  order: 'order',
  concentrationId: 'concentrationId',
  fight: 'fight',
  gather: 'gather',
  remaining: 'remaining',
  FBTournamentStep: 'FBTournamentStep',
  unavailableReason: 'unavailableReason',
  seed: 'seed',
  playerId: 'playerId',
  buildId: 'buildId'
};

exports.Prisma.DinozItemScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  dinozId: 'dinozId',
  gameDinozId: 'gameDinozId'
};

exports.Prisma.DinozItemToDinozScalarFieldEnum = {
  dinozId: 'dinozId',
  dinozItemId: 'dinozItemId',
  gameDinozId: 'gameDinozId'
};

exports.Prisma.DinozMissionScalarFieldEnum = {
  id: 'id',
  missionId: 'missionId',
  dinozId: 'dinozId',
  step: 'step',
  isFinished: 'isFinished',
  progress: 'progress'
};

exports.Prisma.DinozSkillScalarFieldEnum = {
  id: 'id',
  skillId: 'skillId',
  state: 'state',
  dinozId: 'dinozId',
  gameDinozId: 'gameDinozId'
};

exports.Prisma.DinozSkillUnlockableScalarFieldEnum = {
  id: 'id',
  skillId: 'skillId',
  dinozId: 'dinozId',
  gameDinozId: 'gameDinozId'
};

exports.Prisma.DinozStatusScalarFieldEnum = {
  id: 'id',
  statusId: 'statusId',
  dinozId: 'dinozId',
  gameDinozId: 'gameDinozId'
};

exports.Prisma.DinozBuildScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  skills: 'skills',
  shareable: 'shareable',
  name: 'name'
};

exports.Prisma.MigrationsScalarFieldEnum = {
  id: 'id',
  timestamp: 'timestamp',
  name: 'name'
};

exports.Prisma.NewsScalarFieldEnum = {
  id: 'id',
  title: 'title',
  type: 'type',
  image: 'image',
  frenchTitle: 'frenchTitle',
  frenchText: 'frenchText',
  englishTitle: 'englishTitle',
  englishText: 'englishText',
  spanishTitle: 'spanishTitle',
  spanishText: 'spanishText',
  germanTitle: 'germanTitle',
  germanText: 'germanText',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate'
};

exports.Prisma.PollScalarFieldEnum = {
  id: 'id',
  newsId: 'newsId',
  isActive: 'isActive',
  createdDate: 'createdDate',
  endDate: 'endDate'
};

exports.Prisma.PollOptionScalarFieldEnum = {
  id: 'id',
  pollId: 'pollId',
  optionText: 'optionText',
  orderIndex: 'orderIndex',
  createdDate: 'createdDate'
};

exports.Prisma.PollVoteScalarFieldEnum = {
  id: 'id',
  pollId: 'pollId',
  pollOptionId: 'pollOptionId',
  playerId: 'playerId',
  votedAt: 'votedAt'
};

exports.Prisma.NewsLikeScalarFieldEnum = {
  newsId: 'newsId',
  playerId: 'playerId',
  createdAt: 'createdAt'
};

exports.Prisma.NPCScalarFieldEnum = {
  id: 'id',
  npcId: 'npcId',
  step: 'step',
  dinozId: 'dinozId'
};

exports.Prisma.PlayerScalarFieldEnum = {
  customText: 'customText',
  name: 'name',
  connexionToken: 'connexionToken',
  money: 'money',
  quetzuBought: 'quetzuBought',
  leader: 'leader',
  engineer: 'engineer',
  cooker: 'cooker',
  shopKeeper: 'shopKeeper',
  merchant: 'merchant',
  priest: 'priest',
  teacher: 'teacher',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
  lastLogin: 'lastLogin',
  clanMemberId: 'clanMemberId',
  matelasseur: 'matelasseur',
  messie: 'messie',
  labruteDone: 'labruteDone',
  role: 'role',
  lang: 'lang',
  dailyGridRewards: 'dailyGridRewards',
  skipFight: 'skipFight',
  skipLevel: 'skipLevel',
  shareArchivedData: 'shareArchivedData',
  archivedSiteId: 'archivedSiteId',
  banCaseId: 'banCaseId',
  discoveredSkills: 'discoveredSkills',
  lastVersionSeen: 'lastVersionSeen',
  id: 'id'
};

exports.Prisma.PlayerIpScalarFieldEnum = {
  id: 'id',
  ip: 'ip',
  playerId: 'playerId'
};

exports.Prisma.DojoScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  activeChallenge: 'activeChallenge',
  reputation: 'reputation',
  teamUpdate: 'teamUpdate',
  dailyReset: 'dailyReset',
  tournamentTeamId: 'tournamentTeamId'
};

exports.Prisma.DojoTeamScalarFieldEnum = {
  id: 'id',
  dojoId: 'dojoId',
  dinozId: 'dinozId',
  fighted: 'fighted'
};

exports.Prisma.DojoOpponentsScalarFieldEnum = {
  id: 'id',
  dojoId: 'dojoId',
  dinozId: 'dinozId',
  fighted: 'fighted',
  achieved: 'achieved'
};

exports.Prisma.DojoChallengeHistoryScalarFieldEnum = {
  id: 'id',
  dojoId: 'dojoId',
  myDinozId: 'myDinozId',
  opponentId: 'opponentId',
  challenge: 'challenge',
  victory: 'victory',
  achieved: 'achieved',
  archivedAt: 'archivedAt'
};

exports.Prisma.UsernameHistoryScalarFieldEnum = {
  id: 'id',
  username: 'username',
  playerId: 'playerId'
};

exports.Prisma.PlayerDinozShopScalarFieldEnum = {
  id: 'id',
  raceId: 'raceId',
  display: 'display',
  playerId: 'playerId'
};

exports.Prisma.PlayerGatherScalarFieldEnum = {
  id: 'id',
  place: 'place',
  type: 'type',
  grid: 'grid',
  playerId: 'playerId'
};

exports.Prisma.PlayerIngredientScalarFieldEnum = {
  id: 'id',
  ingredientId: 'ingredientId',
  quantity: 'quantity',
  playerId: 'playerId'
};

exports.Prisma.PlayerItemScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  quantity: 'quantity',
  playerId: 'playerId'
};

exports.Prisma.PlayerQuestScalarFieldEnum = {
  id: 'id',
  questId: 'questId',
  progression: 'progression',
  tracking: 'tracking',
  playerId: 'playerId'
};

exports.Prisma.PlayerRewardScalarFieldEnum = {
  id: 'id',
  rewardId: 'rewardId',
  playerId: 'playerId'
};

exports.Prisma.RankingScalarFieldEnum = {
  id: 'id',
  dinozCount: 'dinozCount',
  points: 'points',
  average: 'average',
  completion: 'completion',
  dojo: 'dojo',
  playerId: 'playerId'
};

exports.Prisma.SecretScalarFieldEnum = {
  key: 'key',
  value: 'value'
};

exports.Prisma.OfferItemScalarFieldEnum = {
  id: 'id',
  offerId: 'offerId',
  itemId: 'itemId',
  quantity: 'quantity',
  isIngredient: 'isIngredient'
};

exports.Prisma.OfferBidScalarFieldEnum = {
  id: 'id',
  offerId: 'offerId',
  value: 'value',
  userId: 'userId',
  userName: 'userName'
};

exports.Prisma.OfferScalarFieldEnum = {
  id: 'id',
  endDate: 'endDate',
  dinozId: 'dinozId',
  total: 'total',
  status: 'status',
  dinozDetails: 'dinozDetails',
  sellerId: 'sellerId',
  sellerName: 'sellerName'
};

exports.Prisma.LogScalarFieldEnum = {
  id: 'id',
  dinozId: 'dinozId',
  type: 'type',
  values: 'values',
  createdAt: 'createdAt',
  playerId: 'playerId',
  playerOldId: 'playerOldId'
};

exports.Prisma.DinozCatchScalarFieldEnum = {
  id: 'id',
  dinozId: 'dinozId',
  hp: 'hp',
  monsterId: 'monsterId'
};

exports.Prisma.PlayerTrackingScalarFieldEnum = {
  id: 'id',
  stat: 'stat',
  quantity: 'quantity',
  playerId: 'playerId'
};

exports.Prisma.PantheonScalarFieldEnum = {
  id: 'id',
  motif: 'motif',
  dinozId: 'dinozId',
  date: 'date',
  indicator: 'indicator',
  playerId: 'playerId',
  playerName: 'playerName',
  image: 'image'
};

exports.Prisma.ClanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  treasureValue: 'treasureValue',
  creationDate: 'creationDate',
  clanWarId: 'clanWarId',
  banner: 'banner',
  leaderId: 'leaderId',
  langs: 'langs'
};

exports.Prisma.ClanJoinRequestScalarFieldEnum = {
  id: 'id',
  clanId: 'clanId',
  date: 'date',
  playerId: 'playerId'
};

exports.Prisma.ClanWarScalarFieldEnum = {
  id: 'id',
  dateStart: 'dateStart',
  dateEnd: 'dateEnd'
};

exports.Prisma.ClanIngredientScalarFieldEnum = {
  id: 'id',
  ingredientId: 'ingredientId',
  quantity: 'quantity',
  clanId: 'clanId'
};

exports.Prisma.ClanMessageScalarFieldEnum = {
  id: 'id',
  clanId: 'clanId',
  date: 'date',
  content: 'content',
  authorId: 'authorId',
  authorName: 'authorName'
};

exports.Prisma.ClanHistoryScalarFieldEnum = {
  id: 'id',
  clanId: 'clanId',
  date: 'date',
  type: 'type',
  authorId: 'authorId',
  authorMessage: 'authorMessage'
};

exports.Prisma.ClanMemberScalarFieldEnum = {
  id: 'id',
  clanId: 'clanId',
  dateJoin: 'dateJoin',
  nickname: 'nickname',
  rights: 'rights',
  donation: 'donation',
  playerId: 'playerId'
};

exports.Prisma.ClanPageScalarFieldEnum = {
  id: 'id',
  home: 'home',
  public: 'public',
  name: 'name',
  content: 'content',
  clanId: 'clanId'
};

exports.Prisma.ModerationScalarFieldEnum = {
  id: 'id',
  dinozId: 'dinozId',
  reason: 'reason',
  comment: 'comment',
  banDate: 'banDate',
  banEndDate: 'banEndDate',
  sorted: 'sorted',
  reporterId: 'reporterId',
  targetId: 'targetId'
};

exports.Prisma.ConversationScalarFieldEnum = {
  id: 'id',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  title: 'title',
  pinnedMessageId: 'pinnedMessageId',
  createdById: 'createdById',
  playerId: 'playerId',
  createdByName: 'createdByName'
};

exports.Prisma.ParticipantsScalarFieldEnum = {
  id: 'id',
  conversationId: 'conversationId',
  joinedAt: 'joinedAt',
  playerId: 'playerId',
  playerName: 'playerName'
};

exports.Prisma.MessageScalarFieldEnum = {
  id: 'id',
  content: 'content',
  createdAt: 'createdAt',
  conversationId: 'conversationId',
  senderId: 'senderId',
  senderName: 'senderName'
};

exports.Prisma.NotificationScalarFieldEnum = {
  id: 'id',
  message: 'message',
  severity: 'severity',
  link: 'link',
  read: 'read',
  date: 'date',
  playerId: 'playerId'
};

exports.Prisma.FightArchiveScalarFieldEnum = {
  id: 'id',
  fighters: 'fighters',
  steps: 'steps',
  seed: 'seed',
  result: 'result',
  playerId: 'playerId',
  leftPlayerId: 'leftPlayerId',
  rightPlayerId: 'rightPlayerId',
  tournamentStep: 'tournamentStep',
  slot: 'slot',
  createdDate: 'createdDate',
  tournamentTeamLeftId: 'tournamentTeamLeftId',
  tournamentTeamRightId: 'tournamentTeamRightId',
  tournamentId: 'tournamentId',
  metadata: 'metadata',
  FBTournamentId: 'FBTournamentId',
  FBTournamentLeftId: 'FBTournamentLeftId',
  FBTournamentRightId: 'FBTournamentRightId'
};

exports.Prisma.FightWatchedScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  favorite: 'favorite',
  fightArchiveId: 'fightArchiveId'
};

exports.Prisma.TournamentScalarFieldEnum = {
  id: 'id',
  date: 'date',
  formatName: 'formatName',
  teamSize: 'teamSize',
  raceMinimum: 'raceMinimum',
  poison: 'poison',
  teamRace: 'teamRace',
  levelLimit: 'levelLimit',
  cashPrice: 'cashPrice',
  nextRound: 'nextRound'
};

exports.Prisma.TournamentTeamScalarFieldEnum = {
  id: 'id',
  dojoId: 'dojoId',
  teamCount: 'teamCount',
  tournamentId: 'tournamentId'
};

exports.Prisma.FBTournamentScalarFieldEnum = {
  id: 'id',
  date: 'date',
  teamRace: 'teamRace',
  levelLimit: 'levelLimit',
  cashPrice: 'cashPrice',
  nextRound: 'nextRound',
  winnerId: 'winnerId'
};

exports.Prisma.GameDinozScalarFieldEnum = {
  id: 'id',
  name: 'name',
  raceId: 'raceId',
  level: 'level',
  nextUpElementId: 'nextUpElementId',
  nextUpAltElementId: 'nextUpAltElementId',
  display: 'display',
  life: 'life',
  maxLife: 'maxLife',
  experience: 'experience',
  nbrUpFire: 'nbrUpFire',
  nbrUpWood: 'nbrUpWood',
  nbrUpWater: 'nbrUpWater',
  nbrUpLightning: 'nbrUpLightning',
  nbrUpAir: 'nbrUpAir',
  canChangeName: 'canChangeName',
  createdDate: 'createdDate',
  seed: 'seed',
  usage: 'usage',
  playerId: 'playerId',
  FBTournamentId: 'FBTournamentId'
};

exports.Prisma.EventsScalarFieldEnum = {
  event: 'event',
  playerId: 'playerId',
  totalProgression: 'totalProgression',
  dailyProgression: 'dailyProgression'
};

exports.Prisma.ServerStateScalarFieldEnum = {
  action: 'action',
  nextCheck: 'nextCheck'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.UnavailableReason = exports.$Enums.UnavailableReason = {
  frozen: 'frozen',
  sacrificed: 'sacrificed',
  selling: 'selling',
  superdom: 'superdom',
  resting: 'resting',
  unfreezing: 'unfreezing'
};

exports.NewsType = exports.$Enums.NewsType = {
  update: 'update',
  information: 'information',
  war: 'war',
  war_mana: 'war_mana',
  championship: 'championship',
  tid_start: 'tid_start',
  tid_end: 'tid_end',
  event_christmas: 'event_christmas',
  story: 'story',
  announce: 'announce'
};

exports.AdminRole = exports.$Enums.AdminRole = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  PLAYER: 'PLAYER',
  BETA: 'BETA',
  AMPHI: 'AMPHI'
};

exports.Lang = exports.$Enums.Lang = {
  fr: 'fr',
  en: 'en',
  de: 'de',
  es: 'es'
};

exports.OfferStatus = exports.$Enums.OfferStatus = {
  ONGOING: 'ONGOING',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED',
  CLAIMED: 'CLAIMED'
};

exports.LogType = exports.$Enums.LogType = {
  ItemUsed: 'ItemUsed',
  ItemBought: 'ItemBought',
  GoldWon: 'GoldWon',
  GoldLost: 'GoldLost',
  Move: 'Move',
  LevelUp: 'LevelUp',
  Fight: 'Fight',
  Death: 'Death',
  Revive: 'Revive',
  MissionStep: 'MissionStep',
  MissionFinished: 'MissionFinished',
  MissionCanceled: 'MissionCanceled',
  Gather: 'Gather',
  CreateDinoz: 'CreateDinoz',
  ChangeDinozOrder: 'ChangeDinozOrder',
  AdminUpdateDinoz: 'AdminUpdateDinoz',
  AdminAddStatus: 'AdminAddStatus',
  AdminRemoveStatus: 'AdminRemoveStatus',
  AdminAddSkill: 'AdminAddSkill',
  AdminRemoveSkill: 'AdminRemoveSkill',
  AdminAddUnlockableSkill: 'AdminAddUnlockableSkill',
  AdminRemoveUnlockableSkill: 'AdminRemoveUnlockableSkill',
  AdminAddMoney: 'AdminAddMoney',
  AdminRemoveMoney: 'AdminRemoveMoney',
  AdminAddReward: 'AdminAddReward',
  AdminRemoveReward: 'AdminRemoveReward',
  AdminAddItem: 'AdminAddItem',
  AdminRemoveItem: 'AdminRemoveItem',
  AdminAddIngredient: 'AdminAddIngredient',
  AdminRemoveIngredient: 'AdminRemoveIngredient',
  AdminUpdateQuest: 'AdminUpdateQuest',
  AdminUpdatePlayer: 'AdminUpdatePlayer',
  AdminUpdateSecret: 'AdminUpdateSecret',
  AdminUpdateClan: 'AdminUpdateClan',
  IngredientSold: 'IngredientSold',
  XPEarned: 'XPEarned',
  HPLost: 'HPLost',
  PlayerCreated: 'PlayerCreated',
  PlayerConnected: 'PlayerConnected',
  LBDone: 'LBDone',
  OfferNew: 'OfferNew',
  OfferBid: 'OfferBid',
  OfferCancelled: 'OfferCancelled',
  OfferExpired: 'OfferExpired',
  OfferWon: 'OfferWon',
  GridFinished: 'GridFinished',
  ItemFound: 'ItemFound'
};

exports.PantheonMotif = exports.$Enums.PantheonMotif = {
  race: 'race',
  epic: 'epic'
};

exports.ModerationReason = exports.$Enums.ModerationReason = {
  multi: 'multi',
  dinozName: 'dinozName',
  accountName: 'accountName',
  avatar: 'avatar',
  customText: 'customText',
  other: 'other'
};

exports.ModerationAction = exports.$Enums.ModerationAction = {
  closed: 'closed',
  warning: 'warning',
  shortBan: 'shortBan',
  mediumBan: 'mediumBan',
  longBan: 'longBan',
  infiniteBan: 'infiniteBan'
};

exports.NotificationSeverity = exports.$Enums.NotificationSeverity = {
  info: 'info',
  success: 'success',
  warning: 'warning',
  error: 'error',
  offerWon: 'offerWon',
  offerExpired: 'offerExpired',
  offerEnded: 'offerEnded',
  ban: 'ban',
  reward: 'reward',
  scenario: 'scenario',
  event: 'event',
  newClanApply: 'newClanApply',
  clanApplyAccepted: 'clanApplyAccepted',
  message: 'message'
};

exports.GameDinozUsage = exports.$Enums.GameDinozUsage = {
  FBTournament: 'FBTournament'
};

exports.EventType = exports.$Enums.EventType = {
  CHRISTMAS: 'CHRISTMAS',
  VALENTINE: 'VALENTINE'
};

exports.ServerAction = exports.$Enums.ServerAction = {
  checkBans: 'checkBans',
  healRestingDinoz: 'healRestingDinoz',
  itinerantMerchant: 'itinerantMerchant',
  midnightReset: 'midnightReset'
};

exports.Prisma.ModelName = {
  Concentration: 'Concentration',
  Dinoz: 'Dinoz',
  DinozItem: 'DinozItem',
  DinozItemToDinoz: 'DinozItemToDinoz',
  DinozMission: 'DinozMission',
  DinozSkill: 'DinozSkill',
  DinozSkillUnlockable: 'DinozSkillUnlockable',
  DinozStatus: 'DinozStatus',
  DinozBuild: 'DinozBuild',
  migrations: 'migrations',
  News: 'News',
  Poll: 'Poll',
  PollOption: 'PollOption',
  PollVote: 'PollVote',
  NewsLike: 'NewsLike',
  NPC: 'NPC',
  Player: 'Player',
  PlayerIp: 'PlayerIp',
  Dojo: 'Dojo',
  DojoTeam: 'DojoTeam',
  DojoOpponents: 'DojoOpponents',
  DojoChallengeHistory: 'DojoChallengeHistory',
  UsernameHistory: 'UsernameHistory',
  PlayerDinozShop: 'PlayerDinozShop',
  PlayerGather: 'PlayerGather',
  PlayerIngredient: 'PlayerIngredient',
  PlayerItem: 'PlayerItem',
  PlayerQuest: 'PlayerQuest',
  PlayerReward: 'PlayerReward',
  Ranking: 'Ranking',
  Secret: 'Secret',
  OfferItem: 'OfferItem',
  OfferBid: 'OfferBid',
  Offer: 'Offer',
  Log: 'Log',
  DinozCatch: 'DinozCatch',
  PlayerTracking: 'PlayerTracking',
  Pantheon: 'Pantheon',
  Clan: 'Clan',
  ClanJoinRequest: 'ClanJoinRequest',
  ClanWar: 'ClanWar',
  ClanIngredient: 'ClanIngredient',
  ClanMessage: 'ClanMessage',
  ClanHistory: 'ClanHistory',
  ClanMember: 'ClanMember',
  ClanPage: 'ClanPage',
  Moderation: 'Moderation',
  Conversation: 'Conversation',
  Participants: 'Participants',
  Message: 'Message',
  Notification: 'Notification',
  FightArchive: 'FightArchive',
  FightWatched: 'FightWatched',
  Tournament: 'Tournament',
  TournamentTeam: 'TournamentTeam',
  FBTournament: 'FBTournament',
  GameDinoz: 'GameDinoz',
  Events: 'Events',
  ServerState: 'ServerState'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
