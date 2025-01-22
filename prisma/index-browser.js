
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
 * Prisma Client JS version: 6.0.1
 * Query Engine version: 5dbef10bdbfb579e07d35cc85fb1518d357cb99e
 */
Prisma.prismaVersion = {
  client: "6.0.1",
  engine: "5dbef10bdbfb579e07d35cc85fb1518d357cb99e"
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
  unavailableReason: 'unavailableReason',
  seed: 'seed',
  playerId: 'playerId'
};

exports.Prisma.DinozItemScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  dinozId: 'dinozId'
};

exports.Prisma.DinozItemToDinozScalarFieldEnum = {
  dinozId: 'dinozId',
  dinozItemId: 'dinozItemId'
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
  dinozId: 'dinozId'
};

exports.Prisma.DinozSkillUnlockableScalarFieldEnum = {
  id: 'id',
  skillId: 'skillId',
  dinozId: 'dinozId'
};

exports.Prisma.DinozStatusScalarFieldEnum = {
  id: 'id',
  statusId: 'statusId',
  dinozId: 'dinozId'
};

exports.Prisma.MigrationsScalarFieldEnum = {
  id: 'id',
  timestamp: 'timestamp',
  name: 'name'
};

exports.Prisma.NewsScalarFieldEnum = {
  id: 'id',
  title: 'title',
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

exports.Prisma.NPCScalarFieldEnum = {
  id: 'id',
  npcId: 'npcId',
  step: 'step',
  dinozId: 'dinozId'
};

exports.Prisma.PlayerScalarFieldEnum = {
  customText: 'customText',
  name: 'name',
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
  banCaseId: 'banCaseId',
  id: 'id'
};

exports.Prisma.DojoScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  activeChallenge: 'activeChallenge',
  reputation: 'reputation',
  teamUpdate: 'teamUpdate',
  dailyReset: 'dailyReset'
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
  userId: 'userId'
};

exports.Prisma.OfferScalarFieldEnum = {
  id: 'id',
  endDate: 'endDate',
  dinozId: 'dinozId',
  total: 'total',
  status: 'status',
  dinozDetails: 'dinozDetails',
  sellerId: 'sellerId'
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
  playerName: 'playerName'
};

exports.Prisma.ClanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  treasureValue: 'treasureValue',
  creationDate: 'creationDate',
  clanWarId: 'clanWarId',
  banner: 'banner',
  leaderId: 'leaderId'
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
  createdDate: 'createdDate'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.UnavailableReason = exports.$Enums.UnavailableReason = {
  frozen: 'frozen',
  sacrificed: 'sacrificed',
  selling: 'selling',
  superdom: 'superdom',
  resting: 'resting'
};

exports.AdminRole = exports.$Enums.AdminRole = {
  ADMIN: 'ADMIN',
  MODERATOR: 'MODERATOR',
  PLAYER: 'PLAYER',
  BETA: 'BETA'
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
  AdminAddMoney: 'AdminAddMoney',
  AdminRemoveMoney: 'AdminRemoveMoney',
  AdminAddReward: 'AdminAddReward',
  AdminRemoveReward: 'AdminRemoveReward',
  AdminUpdatePlayer: 'AdminUpdatePlayer',
  AdminUpdateSecret: 'AdminUpdateSecret',
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
  customText: 'customText'
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
  ban: 'ban'
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
  migrations: 'migrations',
  News: 'News',
  NPC: 'NPC',
  Player: 'Player',
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
  FightArchive: 'FightArchive'
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
