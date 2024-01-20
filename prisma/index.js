
Object.defineProperty(exports, "__esModule", { value: true });

const {
  PrismaClientKnownRequestError,
  PrismaClientUnknownRequestError,
  PrismaClientRustPanicError,
  PrismaClientInitializationError,
  PrismaClientValidationError,
  NotFoundError,
  getPrismaClient,
  sqltag,
  empty,
  join,
  raw,
  Decimal,
  Debug,
  objectEnumValues,
  makeStrictEnum,
  Extensions,
  warnOnce,
  defineDmmfProperty,
  Public,
  detectRuntime,
} = require('./runtime/library')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.8.1
 * Query Engine version: 78caf6feeaed953168c64e15a249c3e9a033ebe2
 */
Prisma.prismaVersion = {
  client: "5.8.1",
  engine: "78caf6feeaed953168c64e15a249c3e9a033ebe2"
}

Prisma.PrismaClientKnownRequestError = PrismaClientKnownRequestError;
Prisma.PrismaClientUnknownRequestError = PrismaClientUnknownRequestError
Prisma.PrismaClientRustPanicError = PrismaClientRustPanicError
Prisma.PrismaClientInitializationError = PrismaClientInitializationError
Prisma.PrismaClientValidationError = PrismaClientValidationError
Prisma.NotFoundError = NotFoundError
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = sqltag
Prisma.empty = empty
Prisma.join = join
Prisma.raw = raw
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = Extensions.getExtensionContext
Prisma.defineExtension = Extensions.defineExtension

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


  const path = require('path')

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
  isFrozen: 'isFrozen',
  isSacrificed: 'isSacrificed',
  isSelling: 'isSelling',
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
  fight: 'fight',
  gather: 'gather',
  remaining: 'remaining',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
  playerId: 'playerId',
  order: 'order',
  concentrationId: 'concentrationId'
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

exports.Prisma.ImportedDinozScalarFieldEnum = {
  id: 'id',
  importedId: 'importedId',
  name: 'name',
  isSacrificed: 'isSacrificed',
  level: 'level',
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
  playerId: 'playerId',
  isFrozen: 'isFrozen'
};

exports.Prisma.ImportedDinozSkillScalarFieldEnum = {
  id: 'id',
  skillId: 'skillId',
  dinozId: 'dinozId'
};

exports.Prisma.ImportedDinozStatusScalarFieldEnum = {
  id: 'id',
  dinozId: 'dinozId',
  statusId: 'statusId'
};

exports.Prisma.ImportedPlayerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  twinId: 'twinId',
  money: 'money',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
  playerId: 'playerId'
};

exports.Prisma.ImportedPlayerIngredientScalarFieldEnum = {
  id: 'id',
  ingredientId: 'ingredientId',
  quantity: 'quantity',
  playerId: 'playerId'
};

exports.Prisma.ImportedPlayerItemScalarFieldEnum = {
  id: 'id',
  quantity: 'quantity',
  playerId: 'playerId',
  itemId: 'itemId'
};

exports.Prisma.ImportedPlayerRewardScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  rewardId: 'rewardId'
};

exports.Prisma.ImportedPlayerScenarioScalarFieldEnum = {
  id: 'id',
  questName: 'questName',
  progression: 'progression',
  playerId: 'playerId'
};

exports.Prisma.ImportedTwinoidAchievementScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  date: 'date',
  nameId: 'nameId',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
  playerId: 'playerId',
  requirement: 'requirement',
  quantity: 'quantity'
};

exports.Prisma.ImportedTwinoidSiteScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  npoints: 'npoints',
  points: 'points',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
  playerId: 'playerId'
};

exports.Prisma.ImportedTwinoidStatScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  score: 'score',
  nameId: 'nameId',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
  playerId: 'playerId'
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
  id: 'id',
  hasImported: 'hasImported',
  customText: 'customText',
  name: 'name',
  eternalTwinId: 'eternalTwinId',
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
  lastLogin: 'lastLogin'
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
  points: 'points',
  average: 'average',
  dinozCount: 'dinozCount',
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
  userId: 'userId',
  value: 'value'
};

exports.Prisma.OfferScalarFieldEnum = {
  id: 'id',
  sellerId: 'sellerId',
  endDate: 'endDate',
  dinozId: 'dinozId',
  total: 'total',
  status: 'status'
};

exports.Prisma.LogScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  dinozId: 'dinozId',
  type: 'type',
  values: 'values',
  createdAt: 'createdAt'
};

exports.Prisma.DinozCatchScalarFieldEnum = {
  id: 'id',
  dinozId: 'dinozId',
  monsterId: 'monsterId',
  hp: 'hp'
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
exports.OfferStatus = exports.$Enums.OfferStatus = {
  ONGOING: 'ONGOING',
  ENDED: 'ENDED',
  CANCELLED: 'CANCELLED'
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
  AdminUpdateSecret: 'AdminUpdateSecret'
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
  ImportedDinoz: 'ImportedDinoz',
  ImportedDinozSkill: 'ImportedDinozSkill',
  ImportedDinozStatus: 'ImportedDinozStatus',
  ImportedPlayer: 'ImportedPlayer',
  ImportedPlayerIngredient: 'ImportedPlayerIngredient',
  ImportedPlayerItem: 'ImportedPlayerItem',
  ImportedPlayerReward: 'ImportedPlayerReward',
  ImportedPlayerScenario: 'ImportedPlayerScenario',
  ImportedTwinoidAchievement: 'ImportedTwinoidAchievement',
  ImportedTwinoidSite: 'ImportedTwinoidSite',
  ImportedTwinoidStat: 'ImportedTwinoidStat',
  migrations: 'migrations',
  News: 'News',
  NPC: 'NPC',
  Player: 'Player',
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
  DinozCatch: 'DinozCatch'
};
/**
 * Create the Client
 */
const config = {
  "generator": {
    "name": "client",
    "provider": {
      "fromEnvVar": null,
      "value": "prisma-client-js"
    },
    "output": {
      "value": "C:\\Users\\perso\\Documents\\GitHub\\dinorpg\\prisma",
      "fromEnvVar": null
    },
    "config": {
      "engineType": "library"
    },
    "binaryTargets": [
      {
        "fromEnvVar": null,
        "value": "windows",
        "native": true
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-3.0.x"
      },
      {
        "fromEnvVar": null,
        "value": "debian-openssl-1.1.x"
      }
    ],
    "previewFeatures": [
      "nativeDistinct",
      "relationJoins"
    ],
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../ed-be/.env"
  },
  "relativePath": "../ed-be/prisma",
  "clientVersion": "5.8.1",
  "engineVersion": "78caf6feeaed953168c64e15a249c3e9a033ebe2",
  "datasourceNames": [
    "db"
  ],
  "activeProvider": "postgresql",
  "inlineDatasources": {
    "db": {
      "url": {
        "fromEnvVar": "DATABASE_URL",
        "value": null
      }
    }
  },
  "inlineSchema": "Z2VuZXJhdG9yIGNsaWVudCB7CiAgcHJvdmlkZXIgICAgICAgID0gInByaXNtYS1jbGllbnQtanMiCiAgb3V0cHV0ICAgICAgICAgID0gIi4uLy4uL3ByaXNtYSIKICBiaW5hcnlUYXJnZXRzICAgPSBbIm5hdGl2ZSIsICJkZWJpYW4tb3BlbnNzbC0zLjAueCIsICJkZWJpYW4tb3BlbnNzbC0xLjEueCJdCiAgcHJldmlld0ZlYXR1cmVzID0gWyJyZWxhdGlvbkpvaW5zIiwgIm5hdGl2ZURpc3RpbmN0Il0KfQoKZGF0YXNvdXJjZSBkYiB7CiAgcHJvdmlkZXIgPSAicG9zdGdyZXNxbCIKICB1cmwgICAgICA9IGVudigiREFUQUJBU0VfVVJMIikKfQoKbW9kZWwgQ29uY2VudHJhdGlvbiB7CiAgaWQgICAgSW50ICAgICBAaWQobWFwOiAiUEtfOGU1ZDE3ODNkNDhiYWI2ODliMTkxYjBkMmFmIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGRpbm96IERpbm96W10KCiAgQEBtYXAoImNvbmNlbnRyYXRpb24iKQp9Cgptb2RlbCBEaW5veiB7CiAgaWQgICAgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgICAgICAgQGlkKG1hcDogIlBLXzI5N2NhN2Y1NWI1Njg1M2MyMDRkODMwMWZiNiIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBsZWFkZXIgICAgICAgICAgICAgRGlub3o/ICAgICAgICAgICAgICAgICBAcmVsYXRpb24oIkRpbm96Rm9sbG93ZXJzIiwgZmllbGRzOiBbbGVhZGVySWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIGxlYWRlcklkICAgICAgICAgICBJbnQ/ICAgICAgICAgICAgICAgICAgIEBtYXAoImZvbGxvd2luZyIpCiAgbmFtZSAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIKICBpc0Zyb3plbiAgICAgICAgICAgQm9vbGVhbiAgICAgICAgICAgICAgICBAZGVmYXVsdChmYWxzZSkKICBpc1NhY3JpZmljZWQgICAgICAgQm9vbGVhbiAgICAgICAgICAgICAgICBAZGVmYXVsdChmYWxzZSkKICBpc1NlbGxpbmcgICAgICAgICAgQm9vbGVhbiAgICAgICAgICAgICAgICBAZGVmYXVsdChmYWxzZSkKICByYWNlSWQgICAgICAgICAgICAgSW50CiAgbGV2ZWwgICAgICAgICAgICAgIEludAogIG5leHRVcEVsZW1lbnRJZCAgICBJbnQKICBuZXh0VXBBbHRFbGVtZW50SWQgSW50CiAgcGxhY2VJZCAgICAgICAgICAgIEludAogIGNhbkNoYW5nZU5hbWUgICAgICBCb29sZWFuCiAgZGlzcGxheSAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIKICBsaWZlICAgICAgICAgICAgICAgSW50CiAgbWF4TGlmZSAgICAgICAgICAgIEludAogIGV4cGVyaWVuY2UgICAgICAgICBJbnQKICBuYnJVcEZpcmUgICAgICAgICAgSW50CiAgbmJyVXBXb29kICAgICAgICAgIEludAogIG5iclVwV2F0ZXIgICAgICAgICBJbnQKICBuYnJVcExpZ2h0bmluZyAgICAgSW50CiAgbmJyVXBBaXIgICAgICAgICAgIEludAogIGZpZ2h0ICAgICAgICAgICAgICBCb29sZWFuICAgICAgICAgICAgICAgIEBkZWZhdWx0KHRydWUpCiAgZ2F0aGVyICAgICAgICAgICAgIEJvb2xlYW4gICAgICAgICAgICAgICAgQGRlZmF1bHQodHJ1ZSkKICByZW1haW5pbmcgICAgICAgICAgSW50ICAgICAgICAgICAgICAgICAgICBAZGVmYXVsdCgyKQogIGNyZWF0ZWREYXRlICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDYpCiAgdXBkYXRlZERhdGUgICAgICAgIERhdGVUaW1lICAgICAgICAgICAgICAgQGRlZmF1bHQobm93KCkpIEB1cGRhdGVkQXQgQGRiLlRpbWVzdGFtcCg2KQogIHBsYXllcklkICAgICAgICAgICBJbnQ/CiAgb3JkZXIgICAgICAgICAgICAgIEludD8KICBjb25jZW50cmF0aW9uSWQgICAgSW50PwogIHBsYXllciAgICAgICAgICAgICBQbGF5ZXI/ICAgICAgICAgICAgICAgIEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzA2NDEzNWYyM2VjYWYwMjA3YWY5OTI2ZDdjOSIpCiAgY29uY2VudHJhdGlvbiAgICAgIENvbmNlbnRyYXRpb24/ICAgICAgICAgQHJlbGF0aW9uKGZpZWxkczogW2NvbmNlbnRyYXRpb25JZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfNjkzZDFlODM5Y2JkMTM0NzFmZjM3MjFiOTk0IikKICBpdGVtcyAgICAgICAgICAgICAgRGlub3pJdGVtW10KICBtaXNzaW9ucyAgICAgICAgICAgRGlub3pNaXNzaW9uW10KICBza2lsbHMgICAgICAgICAgICAgRGlub3pTa2lsbFtdCiAgdW5sb2NrYWJsZVNraWxscyAgIERpbm96U2tpbGxVbmxvY2thYmxlW10KICBzdGF0dXMgICAgICAgICAgICAgRGlub3pTdGF0dXNbXQogIG5wY3MgICAgICAgICAgICAgICBOUENbXQogIGRpbm96SXRlbXNUb0Rpbm96ICBEaW5vekl0ZW1Ub0Rpbm96W10KICBvZmZlcnMgICAgICAgICAgICAgT2ZmZXJbXQogIGZvbGxvd2VycyAgICAgICAgICBEaW5veltdICAgICAgICAgICAgICAgIEByZWxhdGlvbigiRGlub3pGb2xsb3dlcnMiKQogIGxvZ3MgICAgICAgICAgICAgICBMb2dbXQogIGNhdGNoZXMgICAgICAgICAgICBEaW5vekNhdGNoW10KCiAgQEBtYXAoImRpbm96IikKfQoKbW9kZWwgRGlub3pJdGVtIHsKICBpZCAgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgICBAaWQobWFwOiAiUEtfYzAyZTAxMTkwMTExNTExNjQyYTRjMzUzOGYwIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGl0ZW1JZCAgICAgICAgICAgSW50CiAgZGlub3pJZCAgICAgICAgICBJbnQ/CiAgZGlub3ogICAgICAgICAgICBEaW5vej8gICAgICAgICAgICAgQHJlbGF0aW9uKGZpZWxkczogW2Rpbm96SWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS18zNzA1NWRhNTU1MzQxOTZmMjI0OGExYjVjNmQiKQogIGRpbm96SXRlbVRvRGlub3ogRGlub3pJdGVtVG9EaW5veltdCgogIEBAbWFwKCJkaW5vel9pdGVtIikKfQoKbW9kZWwgRGlub3pJdGVtVG9EaW5veiB7CiAgZGlub3pJZCAgICAgSW50CiAgZGlub3pJdGVtSWQgSW50CiAgZGlub3ogICAgICAgRGlub3ogICAgIEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG1hcDogIkZLXzRlODFiZDU2YjY3NTI2NGJhNWYzMGE1ZjEwOSIpCiAgZGlub3pfaXRlbSAgRGlub3pJdGVtIEByZWxhdGlvbihmaWVsZHM6IFtkaW5vekl0ZW1JZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBtYXA6ICJGS19lOTBmNjI3MWYxMWIzNTIyMzEyMTM5ZWYzYTkiKQoKICBAQGlkKFtkaW5veklkLCBkaW5vekl0ZW1JZF0sIG1hcDogIlBLX2U3MTYxYWQ5NzAyY2E1NzQyODBjZjFhMTYxNyIpCiAgQEBpbmRleChbZGlub3pJZF0sIG1hcDogIklEWF80ZTgxYmQ1NmI2NzUyNjRiYTVmMzBhNWYxMCIpCiAgQEBpbmRleChbZGlub3pJdGVtSWRdLCBtYXA6ICJJRFhfZTkwZjYyNzFmMTFiMzUyMjMxMjEzOWVmM2EiKQogIEBAbWFwKCJkaW5vel9pdGVtc19kaW5vel9pdGVtIikKfQoKbW9kZWwgRGlub3pNaXNzaW9uIHsKICBpZCAgICAgICAgIEludCAgICAgIEBpZChtYXA6ICJQS19kZmViMTI0NWU2OGQ3MmRiOWE2Yzk0MDJhYjciKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgbWlzc2lvbklkICBJbnQKICBkaW5veklkICAgIEludD8KICBzdGVwICAgICAgIEludAogIGlzRmluaXNoZWQgQm9vbGVhbj8KICBwcm9ncmVzcyAgIEludD8KICBkaW5veiAgICAgIERpbm96PyAgIEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfZjQwOGRkYjY5MmFiNTUxOTgwOGYyNGZiMmI3IikKCiAgQEB1bmlxdWUoW21pc3Npb25JZCwgZGlub3pJZF0pCiAgQEBtYXAoImRpbm96X21pc3Npb24iKQp9Cgptb2RlbCBEaW5velNraWxsIHsKICBpZCAgICAgIEludCAgICAgQGlkKG1hcDogIlBLX2M0MTA5ZmFkODYyN2RhNjczZDM2MTRmYmMwMSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBza2lsbElkIEludAogIHN0YXRlICAgQm9vbGVhbiBAZGVmYXVsdCh0cnVlKQogIGRpbm96SWQgSW50PwogIGRpbm96ICAgRGlub3o/ICBAcmVsYXRpb24oZmllbGRzOiBbZGlub3pJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzU2NjJkMGFkNjQzZTU1Njk2ZjEwYmNiYzg1OCIpCgogIEBAdW5pcXVlKFtza2lsbElkLCBkaW5veklkXSkKICBAQG1hcCgiZGlub3pfc2tpbGwiKQp9Cgptb2RlbCBEaW5velNraWxsVW5sb2NrYWJsZSB7CiAgaWQgICAgICBJbnQgICAgQGlkKG1hcDogIlBLX2Y2MTEzMjUwNDIwN2E0Mzc5YTk2YTMyNGU5MyIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBza2lsbElkIEludAogIGRpbm96SWQgSW50PwogIGRpbm96ICAgRGlub3o/IEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfZGI2Yjk1NDc5NjkzZjNlNGI1OTQ4ODAwY2Y4IikKCiAgQEBtYXAoImRpbm96X3NraWxsX3VubG9ja2FibGUiKQp9Cgptb2RlbCBEaW5velN0YXR1cyB7CiAgaWQgICAgICAgSW50ICAgIEBpZChtYXA6ICJQS18xNDk2NTNmMTkzNDYwM2FlZGU5MzgwM2M5ZGUiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgc3RhdHVzSWQgSW50CiAgZGlub3pJZCAgSW50PwogIGRpbm96ICAgIERpbm96PyBAcmVsYXRpb24oZmllbGRzOiBbZGlub3pJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLX2VjNTIzMGZkNGFkNjUzNzcwZTEzNTU4ZGY3ZCIpCgogIEBAdW5pcXVlKFtzdGF0dXNJZCwgZGlub3pJZF0pCiAgQEBtYXAoImRpbm96X3N0YXR1cyIpCn0KCm1vZGVsIEltcG9ydGVkRGlub3ogewogIGlkICAgICAgICAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgICAgICAgQGlkKG1hcDogIlBLX2FjOTdkNmIwYWU4YjU1OTgwZjVjYWFhY2IzZCIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBpbXBvcnRlZElkICAgICAgICAgICAgSW50CiAgbmFtZSAgICAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcgogIGlzU2FjcmlmaWNlZCAgICAgICAgICBCb29sZWFuICAgICAgICAgICAgICAgQGRlZmF1bHQoZmFsc2UpCiAgbGV2ZWwgICAgICAgICAgICAgICAgIEludAogIGRpc3BsYXkgICAgICAgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIKICBsaWZlICAgICAgICAgICAgICAgICAgSW50CiAgbWF4TGlmZSAgICAgICAgICAgICAgIEludAogIGV4cGVyaWVuY2UgICAgICAgICAgICBJbnQKICBuYnJVcEZpcmUgICAgICAgICAgICAgSW50CiAgbmJyVXBXb29kICAgICAgICAgICAgIEludAogIG5iclVwV2F0ZXIgICAgICAgICAgICBJbnQKICBuYnJVcExpZ2h0bmluZyAgICAgICAgSW50CiAgbmJyVXBBaXIgICAgICAgICAgICAgIEludAogIGNyZWF0ZWREYXRlICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgQGRlZmF1bHQobm93KCkpIEBkYi5UaW1lc3RhbXAoNikKICB1cGRhdGVkRGF0ZSAgICAgICAgICAgRGF0ZVRpbWUgICAgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAdXBkYXRlZEF0IEBkYi5UaW1lc3RhbXAoNikKICBwbGF5ZXJJZCAgICAgICAgICAgICAgSW50PwogIGlzRnJvemVuICAgICAgICAgICAgICBCb29sZWFuCiAgaW1wb3J0ZWRfcGxheWVyICAgICAgIEltcG9ydGVkUGxheWVyPyAgICAgICBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS19iNTJmZTQ5NjQzNzg0MWQwYWYzNmM5Mzc3YzgiKQogIGltcG9ydGVkX2Rpbm96X3NraWxsICBJbXBvcnRlZERpbm96U2tpbGxbXQogIGltcG9ydGVkX2Rpbm96X3N0YXR1cyBJbXBvcnRlZERpbm96U3RhdHVzW10KCiAgQEBtYXAoImltcG9ydGVkX2Rpbm96IikKfQoKbW9kZWwgSW1wb3J0ZWREaW5velNraWxsIHsKICBpZCAgICAgICAgICAgICBJbnQgICAgICAgICAgICBAaWQobWFwOiAiUEtfNmIzZWI1YzJkNDgxZDg2ZGU3NTRhMDdlY2U5IikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIHNraWxsSWQgICAgICAgIEludAogIGRpbm96SWQgICAgICAgIEludD8KICBpbXBvcnRlZF9kaW5veiBJbXBvcnRlZERpbm96PyBAcmVsYXRpb24oZmllbGRzOiBbZGlub3pJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzZjMjNjNzczODljNDEwOTQ5ZjczMTc1ODViNSIpCgogIEBAbWFwKCJpbXBvcnRlZF9kaW5vel9za2lsbCIpCn0KCm1vZGVsIEltcG9ydGVkRGlub3pTdGF0dXMgewogIGlkICAgICAgICAgICAgIEludCAgICAgICAgICAgIEBpZChtYXA6ICJQS18yNGI5M2ZjMWFlNTFlMDAyYmQ0YWZmY2NmODgiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgZGlub3pJZCAgICAgICAgSW50PwogIHN0YXR1c0lkICAgICAgIEludAogIGltcG9ydGVkX2Rpbm96IEltcG9ydGVkRGlub3o/IEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfZWRiMTQ3ZWRjOTZjNzgxNGU4OGQ4ZGMzNTQ0IikKCiAgQEBtYXAoImltcG9ydGVkX2Rpbm96X3N0YXR1cyIpCn0KCm1vZGVsIEltcG9ydGVkUGxheWVyIHsKICBpZCAgICAgICAgICAgICAgICAgICAgICAgICAgSW50ICAgICAgICAgICAgICAgICAgICAgICAgQGlkKG1hcDogIlBLX2E3NTRiMDUwYTkzZWQzMmJhMTkwOGQ4ZmU4NCIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBuYW1lICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIKICB0d2luSWQgICAgICAgICAgICAgICAgICAgICAgSW50CiAgbW9uZXkgICAgICAgICAgICAgICAgICAgICAgIEludAogIGNyZWF0ZWREYXRlICAgICAgICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgICAgICBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHVwZGF0ZWREYXRlICAgICAgICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgICAgICBAZGVmYXVsdChub3coKSkgQHVwZGF0ZWRBdCBAZGIuVGltZXN0YW1wKDYpCiAgcGxheWVySWQgICAgICAgICAgICAgICAgICAgIEludD8gICAgICAgICAgICAgICAgICAgICAgIEB1bmlxdWUobWFwOiAiUkVMXzk3YjQ4MzQ5YmU2MDc4ZmExZDBmMGViODc3IikKICBpbXBvcnRlZF9kaW5veiAgICAgICAgICAgICAgSW1wb3J0ZWREaW5veltdCiAgcGxheWVyICAgICAgICAgICAgICAgICAgICAgIFBsYXllcj8gICAgICAgICAgICAgICAgICAgIEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzk3YjQ4MzQ5YmU2MDc4ZmExZDBmMGViODc3OCIpCiAgaW1wb3J0ZWRfcGxheWVyX2luZ3JlZGllbnRzIEltcG9ydGVkUGxheWVySW5ncmVkaWVudFtdCiAgaW1wb3J0ZWRfcGxheWVyX2l0ZW0gICAgICAgIEltcG9ydGVkUGxheWVySXRlbVtdCiAgaW1wb3J0ZWRfcGxheWVyX3Jld2FyZCAgICAgIEltcG9ydGVkUGxheWVyUmV3YXJkW10KICBpbXBvcnRlZF9wbGF5ZXJfc2NlbmFyaW8gICAgSW1wb3J0ZWRQbGF5ZXJTY2VuYXJpb1tdCgogIEBAbWFwKCJpbXBvcnRlZF9wbGF5ZXIiKQp9Cgptb2RlbCBJbXBvcnRlZFBsYXllckluZ3JlZGllbnQgewogIGlkICAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgQGlkKG1hcDogIlBLXzIyZmVkNTI0MTJlMTk1M2Y3NjFhMzhjZTI3YyIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBpbmdyZWRpZW50SWQgICAgSW50CiAgcXVhbnRpdHkgICAgICAgIEludAogIHBsYXllcklkICAgICAgICBJbnQ/CiAgaW1wb3J0ZWRfcGxheWVyIEltcG9ydGVkUGxheWVyPyBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS18xOGVhZjNlYzJlZDc1NzZiZmI2NzZjNmRhYjUiKQoKICBAQG1hcCgiaW1wb3J0ZWRfcGxheWVyX2luZ3JlZGllbnRzIikKfQoKbW9kZWwgSW1wb3J0ZWRQbGF5ZXJJdGVtIHsKICBpZCAgICAgICAgICAgICAgSW50ICAgICAgICAgICAgIEBpZChtYXA6ICJQS19kODU2ODRiMzdhYzNlMDQ0ZDE1ZWE5NWUxNmYiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgcXVhbnRpdHkgICAgICAgIEludAogIHBsYXllcklkICAgICAgICBJbnQ/CiAgaXRlbUlkICAgICAgICAgIEludAogIGltcG9ydGVkX3BsYXllciBJbXBvcnRlZFBsYXllcj8gQHJlbGF0aW9uKGZpZWxkczogW3BsYXllcklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfM2RmNmY5NjhhMTI5ZmUwMzExZjAxZDAwMzM4IikKCiAgQEBtYXAoImltcG9ydGVkX3BsYXllcl9pdGVtIikKfQoKbW9kZWwgSW1wb3J0ZWRQbGF5ZXJSZXdhcmQgewogIGlkICAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgQGlkKG1hcDogIlBLX2M2YjBjNWY5YWViNDEyZWUxMmYwMzA5ZDI5OSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBwbGF5ZXJJZCAgICAgICAgSW50PwogIHJld2FyZElkICAgICAgICBJbnQKICBpbXBvcnRlZF9wbGF5ZXIgSW1wb3J0ZWRQbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzYzYzExOWFhYjVmNmQ5OTkwZjJiMTAwNjJjMyIpCgogIEBAbWFwKCJpbXBvcnRlZF9wbGF5ZXJfcmV3YXJkIikKfQoKbW9kZWwgSW1wb3J0ZWRQbGF5ZXJTY2VuYXJpbyB7CiAgaWQgICAgICAgICAgICAgIEludCAgICAgICAgICAgICBAaWQobWFwOiAiUEtfODRhNTE4MWE4ZDNmMDI1NWJjZjlhYjkwNGM0IikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIHF1ZXN0TmFtZSAgICAgICBTdHJpbmcgICAgICAgICAgQGRiLlZhckNoYXIKICBwcm9ncmVzc2lvbiAgICAgSW50CiAgcGxheWVySWQgICAgICAgIEludD8KICBpbXBvcnRlZF9wbGF5ZXIgSW1wb3J0ZWRQbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzI0YjBkYmU0Yzg2MmMyZjY1MWQ4Nzk1ZjY1YSIpCgogIEBAbWFwKCJpbXBvcnRlZF9wbGF5ZXJfc2NlbmFyaW8iKQp9Cgptb2RlbCBJbXBvcnRlZFR3aW5vaWRBY2hpZXZlbWVudCB7CiAgaWQgICAgICAgICAgSW50ICAgICAgQGlkKG1hcDogIlBLXzJmMDY4ZDk1MWY5Y2M5NzY0MjIxZTY0OTIwNiIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBzaXRlSWQgICAgICBJbnQKICBkYXRlICAgICAgICBTdHJpbmcgICBAZGIuVmFyQ2hhcgogIG5hbWVJZCAgICAgIFN0cmluZyAgIEBkYi5WYXJDaGFyCiAgY3JlYXRlZERhdGUgRGF0ZVRpbWUgQGRlZmF1bHQobm93KCkpIEBkYi5UaW1lc3RhbXAoNikKICB1cGRhdGVkRGF0ZSBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQHVwZGF0ZWRBdCBAZGIuVGltZXN0YW1wKDYpCiAgcGxheWVySWQgICAgSW50PwogIHJlcXVpcmVtZW50IFN0cmluZyAgIEBkYi5WYXJDaGFyCiAgcXVhbnRpdHkgICAgSW50CiAgcGxheWVyICAgICAgUGxheWVyPyAgQHJlbGF0aW9uKGZpZWxkczogW3BsYXllcklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfNTAyODJiMTYwODcyMzUzZWRhNjI3NjQxOGQxIikKCiAgQEBtYXAoImltcG9ydGVkX3R3aW5vaWRfYWNoaWV2ZW1lbnRzIikKfQoKbW9kZWwgSW1wb3J0ZWRUd2lub2lkU2l0ZSB7CiAgaWQgICAgICAgICAgSW50ICAgICAgQGlkKG1hcDogIlBLX2M1YmJiMWMxZmY0NjY0NDJmMWViNGM0ODA3OCIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBzaXRlSWQgICAgICBJbnQKICBucG9pbnRzICAgICBJbnQKICBwb2ludHMgICAgICBJbnQKICBjcmVhdGVkRGF0ZSBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHVwZGF0ZWREYXRlIERhdGVUaW1lIEBkZWZhdWx0KG5vdygpKSBAdXBkYXRlZEF0IEBkYi5UaW1lc3RhbXAoNikKICBwbGF5ZXJJZCAgICBJbnQ/CiAgcGxheWVyICAgICAgUGxheWVyPyAgQHJlbGF0aW9uKGZpZWxkczogW3BsYXllcklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfODAzNTY2OWVjMWU3YjVhMGIwOWQ0Yzc2ZGI3IikKCiAgQEBtYXAoImltcG9ydGVkX3R3aW5vaWRfc2l0ZSIpCn0KCm1vZGVsIEltcG9ydGVkVHdpbm9pZFN0YXQgewogIGlkICAgICAgICAgIEludCAgICAgIEBpZChtYXA6ICJQS184YjNlMDg0YTY5MTc0NDVhMzI0ZDEyYzM4MmQiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgc2l0ZUlkICAgICAgSW50CiAgc2NvcmUgICAgICAgSW50CiAgbmFtZUlkICAgICAgU3RyaW5nICAgQGRiLlZhckNoYXIKICBjcmVhdGVkRGF0ZSBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHVwZGF0ZWREYXRlIERhdGVUaW1lIEBkZWZhdWx0KG5vdygpKSBAdXBkYXRlZEF0IEBkYi5UaW1lc3RhbXAoNikKICBwbGF5ZXJJZCAgICBJbnQ/CiAgcGxheWVyICAgICAgUGxheWVyPyAgQHJlbGF0aW9uKGZpZWxkczogW3BsYXllcklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfYmNmYTk3MDZkMGZkNjI1NjlhN2U5YWVhZjI3IikKCiAgQEBtYXAoImltcG9ydGVkX3R3aW5vaWRfc3RhdHMiKQp9Cgptb2RlbCBtaWdyYXRpb25zIHsKICBpZCAgICAgICAgSW50ICAgIEBpZChtYXA6ICJQS184YzgyZDdmNTI2MzQwYWI3MzQyNjBlYTQ2YmUiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgdGltZXN0YW1wIEJpZ0ludAogIG5hbWUgICAgICBTdHJpbmcgQGRiLlZhckNoYXIKfQoKbW9kZWwgTmV3cyB7CiAgaWQgICAgICAgICAgIEludCAgICAgIEBpZChtYXA6ICJQS18zOWE0M2RmY2I2MDA3MTgwZjA0YWZmMjM1N2UiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgdGl0bGUgICAgICAgIFN0cmluZz8gIEBkYi5WYXJDaGFyCiAgaW1hZ2UgICAgICAgIEJ5dGVzPwogIGZyZW5jaFRpdGxlICBTdHJpbmc/ICBAZGIuVmFyQ2hhcgogIGZyZW5jaFRleHQgICBTdHJpbmc/ICBAZGIuVmFyQ2hhcgogIGVuZ2xpc2hUaXRsZSBTdHJpbmc/ICBAZGIuVmFyQ2hhcgogIGVuZ2xpc2hUZXh0ICBTdHJpbmc/ICBAZGIuVmFyQ2hhcgogIHNwYW5pc2hUaXRsZSBTdHJpbmc/ICBAZGIuVmFyQ2hhcgogIHNwYW5pc2hUZXh0ICBTdHJpbmc/ICBAZGIuVmFyQ2hhcgogIGdlcm1hblRpdGxlICBTdHJpbmc/ICBAZGIuVmFyQ2hhcgogIGdlcm1hblRleHQgICBTdHJpbmc/ICBAZGIuVmFyQ2hhcgogIGNyZWF0ZWREYXRlICBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHVwZGF0ZWREYXRlICBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQHVwZGF0ZWRBdCBAZGIuVGltZXN0YW1wKDYpCgogIEBAbWFwKCJuZXdzIikKfQoKbW9kZWwgTlBDIHsKICBpZCAgICAgIEludCAgICBAaWQobWFwOiAiUEtfZjg4YWNlZTA1MGJmZWEyMTExYjM5OWFiNDliIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIG5wY0lkICAgSW50CiAgc3RlcCAgICBTdHJpbmcgQGRiLlZhckNoYXIKICBkaW5veklkIEludD8KICBkaW5veiAgIERpbm96PyBAcmVsYXRpb24oZmllbGRzOiBbZGlub3pJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzkwY2U4YTA3MGZlYWVhMjhkNWEzOTI5NTc2MiIpCgogIEBAdW5pcXVlKFtucGNJZCwgZGlub3pJZF0pCiAgQEBtYXAoIm5wYyIpCn0KCm1vZGVsIFBsYXllciB7CiAgaWQgICAgICAgICAgICAgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgICAgICAgICAgICAgQGlkKG1hcDogIlBLXzY1ZWRhZGM5NDZhN2ZhZjRiNjM4ZDVlODg4NSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBoYXNJbXBvcnRlZCAgICAgICAgICAgICAgICAgQm9vbGVhbgogIGN1c3RvbVRleHQgICAgICAgICAgICAgICAgICBTdHJpbmc/CiAgbmFtZSAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIKICBldGVybmFsVHdpbklkICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcgogIG1vbmV5ICAgICAgICAgICAgICAgICAgICAgICBJbnQKICBxdWV0enVCb3VnaHQgICAgICAgICAgICAgICAgSW50CiAgbGVhZGVyICAgICAgICAgICAgICAgICAgICAgIEJvb2xlYW4KICBlbmdpbmVlciAgICAgICAgICAgICAgICAgICAgQm9vbGVhbgogIGNvb2tlciAgICAgICAgICAgICAgICAgICAgICBCb29sZWFuCiAgc2hvcEtlZXBlciAgICAgICAgICAgICAgICAgIEJvb2xlYW4KICBtZXJjaGFudCAgICAgICAgICAgICAgICAgICAgQm9vbGVhbgogIHByaWVzdCAgICAgICAgICAgICAgICAgICAgICBCb29sZWFuCiAgdGVhY2hlciAgICAgICAgICAgICAgICAgICAgIEJvb2xlYW4KICBjcmVhdGVkRGF0ZSAgICAgICAgICAgICAgICAgRGF0ZVRpbWUgICAgICAgICAgICAgICAgICAgICBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHVwZGF0ZWREYXRlICAgICAgICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAdXBkYXRlZEF0IEBkYi5UaW1lc3RhbXAoNikKICBsYXN0TG9naW4gICAgICAgICAgICAgICAgICAgRGF0ZVRpbWUgICAgICAgICAgICAgICAgICAgICBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIGRpbm96ICAgICAgICAgICAgICAgICAgICAgICBEaW5veltdCiAgaW1wb3J0ZWRQbGF5ZXIgICAgICAgICAgICAgIEltcG9ydGVkUGxheWVyPwogIGltcG9ydGVkVHdpbm9pZEFjaGlldmVtZW50cyBJbXBvcnRlZFR3aW5vaWRBY2hpZXZlbWVudFtdCiAgaW1wb3J0ZWRUd2lub2lkU2l0ZSAgICAgICAgIEltcG9ydGVkVHdpbm9pZFNpdGVbXQogIGltcG9ydGVkVHdpbm9pZFN0YXRzICAgICAgICBJbXBvcnRlZFR3aW5vaWRTdGF0W10KICBkaW5velNob3AgICAgICAgICAgICAgICAgICAgUGxheWVyRGlub3pTaG9wW10KICBnYXRoZXJzICAgICAgICAgICAgICAgICAgICAgUGxheWVyR2F0aGVyW10KICBpbmdyZWRpZW50cyAgICAgICAgICAgICAgICAgUGxheWVySW5ncmVkaWVudFtdCiAgaXRlbXMgICAgICAgICAgICAgICAgICAgICAgIFBsYXllckl0ZW1bXQogIHF1ZXN0cyAgICAgICAgICAgICAgICAgICAgICBQbGF5ZXJRdWVzdFtdCiAgcmV3YXJkcyAgICAgICAgICAgICAgICAgICAgIFBsYXllclJld2FyZFtdCiAgcmFua2luZyAgICAgICAgICAgICAgICAgICAgIFJhbmtpbmc/CiAgb2ZmZXJzICAgICAgICAgICAgICAgICAgICAgIE9mZmVyW10KICBiaWRzICAgICAgICAgICAgICAgICAgICAgICAgT2ZmZXJCaWRbXQogIGxvZ3MgICAgICAgICAgICAgICAgICAgICAgICBMb2dbXQoKICBAQG1hcCgicGxheWVyIikKfQoKbW9kZWwgUGxheWVyRGlub3pTaG9wIHsKICBpZCAgICAgICBJbnQgICAgIEBpZChtYXA6ICJQS18wNDZkYzczMDk2MzYwZmZiM2MxY2NhN2ZlNzIiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgcmFjZUlkICAgSW50CiAgZGlzcGxheSAgU3RyaW5nICBAZGIuVmFyQ2hhcgogIHBsYXllcklkIEludD8KICBwbGF5ZXIgICBQbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLX2M3OWFiNjFhYTMyZmU2ZTgxYzAzYTdkODdkMSIpCgogIEBAbWFwKCJwbGF5ZXJfZGlub3pfc2hvcCIpCn0KCm1vZGVsIFBsYXllckdhdGhlciB7CiAgaWQgICAgICAgSW50ICAgICBAaWQobWFwOiAiUEtfYWFmYWQwODY3ZGY5NjU1MTk1MzIwMDIwOWM3IikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIHBsYWNlICAgIEludAogIHR5cGUgICAgIEludAogIGdyaWQgICAgIEludFtdCiAgcGxheWVySWQgSW50PwogIHBsYXllciAgIFBsYXllcj8gQHJlbGF0aW9uKGZpZWxkczogW3BsYXllcklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfODZlZWQ1MmY2NmY3MTI2ZTRkYzdhOTk4Y2RmIikKCiAgQEBtYXAoInBsYXllcl9nYXRoZXIiKQp9Cgptb2RlbCBQbGF5ZXJJbmdyZWRpZW50IHsKICBpZCAgICAgICAgICAgSW50ICAgICBAaWQobWFwOiAiUEtfM2FlNWNhOTczMDE0NGQ3NDU2YzE2Mzg2ODY5IikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGluZ3JlZGllbnRJZCBJbnQKICBxdWFudGl0eSAgICAgSW50CiAgcGxheWVySWQgICAgIEludD8KICBwbGF5ZXIgICAgICAgUGxheWVyPyBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS19hZDE5ODM5Mjg4NmE1MmU3ZjE4NDQ3NGEwZDYiKQoKICBAQHVuaXF1ZShbaW5ncmVkaWVudElkLCBwbGF5ZXJJZF0pCiAgQEBtYXAoInBsYXllcl9pbmdyZWRpZW50IikKfQoKbW9kZWwgUGxheWVySXRlbSB7CiAgaWQgICAgICAgSW50ICAgICBAaWQobWFwOiAiUEtfNDc0OTZkMTZjNjFmMWIwOWFmNWMyMzk5OTkzIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGl0ZW1JZCAgIEludAogIHF1YW50aXR5IEludAogIHBsYXllcklkIEludD8KICBwbGF5ZXIgICBQbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzIxNTM1ZmNiOTNmODYxM2ZkODkzYjc0YjA4YiIpCgogIEBAdW5pcXVlKFtpdGVtSWQsIHBsYXllcklkXSkKICBAQG1hcCgicGxheWVyX2l0ZW0iKQp9Cgptb2RlbCBQbGF5ZXJRdWVzdCB7CiAgaWQgICAgICAgICAgSW50ICAgICBAaWQobWFwOiAiUEtfOGNiNGNjOWI0MjM4MDdjNTExZjI0YzBmYWEzIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIHF1ZXN0SWQgICAgIEludAogIHByb2dyZXNzaW9uIEludAogIHBsYXllcklkICAgIEludD8KICBwbGF5ZXIgICAgICBQbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzFiNWIwNDFmYWIzMzYyYzg0NWMxNDJjYTNiMCIpCgogIEBAdW5pcXVlKFtxdWVzdElkLCBwbGF5ZXJJZF0pCiAgQEBtYXAoInBsYXllcl9xdWVzdCIpCn0KCm1vZGVsIFBsYXllclJld2FyZCB7CiAgaWQgICAgICAgSW50ICAgICBAaWQobWFwOiAiUEtfNjYwMjc1M2VjZWY0OTIwZjE5N2RlOTEwNTk5IikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIHJld2FyZElkIEludAogIHBsYXllcklkIEludD8KICBwbGF5ZXIgICBQbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzljZjE0MmIzYTZmYTNlMGZhZWM3ZjhkZWJmYiIpCgogIEBAdW5pcXVlKFtyZXdhcmRJZCwgcGxheWVySWRdKQogIEBAbWFwKCJwbGF5ZXJfcmV3YXJkIikKfQoKbW9kZWwgUmFua2luZyB7CiAgaWQgICAgICAgICBJbnQgICAgIEBpZChtYXA6ICJQS19iZjgyYjhmMjcxZTUwMjMyZTZhM2ZjYjA5YTkiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgcG9pbnRzICAgICBJbnQgICAgIEBkZWZhdWx0KDApCiAgYXZlcmFnZSAgICBJbnQgICAgIEBkZWZhdWx0KDApCiAgZGlub3pDb3VudCBJbnQgICAgIEBkZWZhdWx0KDApCiAgcGxheWVySWQgICBJbnQ/ICAgIEB1bmlxdWUobWFwOiAiUkVMXzNhYzk2MTk2ZDBhMzg1MTk4OWJlOGM1MmE5IikKICBwbGF5ZXIgICAgIFBsYXllcj8gQHJlbGF0aW9uKGZpZWxkczogW3BsYXllcklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfM2FjOTYxOTZkMGEzODUxOTg5YmU4YzUyYTlhIikKCiAgQEBtYXAoInJhbmtpbmciKQp9Cgptb2RlbCBTZWNyZXQgewogIGtleSAgIFN0cmluZyBAaWQgQGRiLlZhckNoYXIKICB2YWx1ZSBTdHJpbmcgQGRiLlZhckNoYXIKCiAgQEBtYXAoInNlY3JldCIpCn0KCm1vZGVsIE9mZmVySXRlbSB7CiAgaWQgICAgICAgICAgIEludCAgICAgQGlkIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBvZmZlcklkICAgICAgSW50CiAgb2ZmZXIgICAgICAgIE9mZmVyICAgQHJlbGF0aW9uKGZpZWxkczogW29mZmVySWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIGl0ZW1JZCAgICAgICBJbnQKICBxdWFudGl0eSAgICAgSW50CiAgaXNJbmdyZWRpZW50IEJvb2xlYW4KfQoKbW9kZWwgT2ZmZXJCaWQgewogIGlkICAgICAgSW50ICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgb2ZmZXJJZCBJbnQKICBvZmZlciAgIE9mZmVyICBAcmVsYXRpb24oZmllbGRzOiBbb2ZmZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgdXNlcklkICBJbnQKICB1c2VyICAgIFBsYXllciBAcmVsYXRpb24oZmllbGRzOiBbdXNlcklkXSwgcmVmZXJlbmNlczogW2lkXSkKICB2YWx1ZSAgIEludAp9CgplbnVtIE9mZmVyU3RhdHVzIHsKICBPTkdPSU5HCiAgRU5ERUQKICBDQU5DRUxMRUQKfQoKbW9kZWwgT2ZmZXIgewogIGlkICAgICAgIEludCAgICAgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgc2VsbGVySWQgSW50CiAgc2VsbGVyICAgUGxheWVyICAgICAgQHJlbGF0aW9uKGZpZWxkczogW3NlbGxlcklkXSwgcmVmZXJlbmNlczogW2lkXSkKICBlbmREYXRlICBEYXRlVGltZQogIGRpbm96SWQgIEludD8KICBkaW5veiAgICBEaW5vej8gICAgICBAcmVsYXRpb24oZmllbGRzOiBbZGlub3pJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgaXRlbXMgICAgT2ZmZXJJdGVtW10KICB0b3RhbCAgICBJbnQKICBiaWRzICAgICBPZmZlckJpZFtdCiAgc3RhdHVzICAgT2ZmZXJTdGF0dXMgQGRlZmF1bHQoT05HT0lORykKfQoKZW51bSBMb2dUeXBlIHsKICBJdGVtVXNlZAogIEl0ZW1Cb3VnaHQKICBHb2xkV29uCiAgR29sZExvc3QKICBNb3ZlCiAgTGV2ZWxVcAogIEZpZ2h0CiAgRGVhdGgKICBSZXZpdmUKICBNaXNzaW9uU3RlcAogIE1pc3Npb25GaW5pc2hlZAogIE1pc3Npb25DYW5jZWxlZAogIEdhdGhlcgogIENyZWF0ZURpbm96CiAgQ2hhbmdlRGlub3pPcmRlcgogIEFkbWluVXBkYXRlRGlub3oKICBBZG1pbkFkZFN0YXR1cwogIEFkbWluUmVtb3ZlU3RhdHVzCiAgQWRtaW5BZGRTa2lsbAogIEFkbWluUmVtb3ZlU2tpbGwKICBBZG1pbkFkZE1vbmV5CiAgQWRtaW5SZW1vdmVNb25leQogIEFkbWluQWRkUmV3YXJkCiAgQWRtaW5SZW1vdmVSZXdhcmQKICBBZG1pblVwZGF0ZVBsYXllcgogIEFkbWluVXBkYXRlU2VjcmV0Cn0KCm1vZGVsIExvZyB7CiAgaWQgICAgICAgIEludCAgICAgIEBpZCBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgcGxheWVyICAgIFBsYXllciAgIEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgcGxheWVySWQgIEludAogIGRpbm96ICAgICBEaW5vej8gICBAcmVsYXRpb24oZmllbGRzOiBbZGlub3pJZF0sIHJlZmVyZW5jZXM6IFtpZF0pCiAgZGlub3pJZCAgIEludD8KICB0eXBlICAgICAgTG9nVHlwZQogIHZhbHVlcyAgICBTdHJpbmdbXSBAZGVmYXVsdChbXSkKICBjcmVhdGVkQXQgRGF0ZVRpbWUgQGRlZmF1bHQobm93KCkpIEBkYi5UaW1lc3RhbXAoNikKfQoKbW9kZWwgRGlub3pDYXRjaCB7CiAgaWQgICAgICAgIEludCAgICBAaWQgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGRpbm96ICAgICBEaW5vej8gQHJlbGF0aW9uKGZpZWxkczogW2Rpbm96SWRdLCByZWZlcmVuY2VzOiBbaWRdKQogIGRpbm96SWQgICBJbnQ/CiAgbW9uc3RlcklkIFN0cmluZwogIGhwICAgICAgICBJbnQKfQo=",
  "inlineSchemaHash": "50486f9bb4e35b2eb4d921aee0ec15ba59727e2c925cb68111ea1e503b1c8902"
}

const fs = require('fs')

config.dirname = __dirname
if (!fs.existsSync(path.join(__dirname, 'schema.prisma'))) {
  const alternativePaths = [
    "../prisma",
    "prisma",
  ]
  
  const alternativePath = alternativePaths.find((altPath) => {
    return fs.existsSync(path.join(process.cwd(), altPath, 'schema.prisma'))
  }) ?? alternativePaths[0]

  config.dirname = path.join(process.cwd(), alternativePath)
  config.isBundled = true
}

config.runtimeDataModel = JSON.parse("{\"models\":{\"Concentration\":{\"dbName\":\"concentration\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"ConcentrationToDinoz\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Dinoz\":{\"dbName\":\"dinoz\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leader\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozFollowers\",\"relationFromFields\":[\"leaderId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leaderId\",\"dbName\":\"following\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFrozen\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isSacrificed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isSelling\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"raceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nextUpElementId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nextUpAltElementId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"placeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"canChangeName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"display\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"life\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxLife\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"experience\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpFire\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpWood\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpWater\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpLightning\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpAir\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"fight\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gather\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"remaining\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":2,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"concentrationId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"DinozToPlayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"concentration\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Concentration\",\"relationName\":\"ConcentrationToDinoz\",\"relationFromFields\":[\"concentrationId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"items\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DinozItem\",\"relationName\":\"DinozToDinozItem\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"missions\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DinozMission\",\"relationName\":\"DinozToDinozMission\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skills\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DinozSkill\",\"relationName\":\"DinozToDinozSkill\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"unlockableSkills\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DinozSkillUnlockable\",\"relationName\":\"DinozToDinozSkillUnlockable\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DinozStatus\",\"relationName\":\"DinozToDinozStatus\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"npcs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"NPC\",\"relationName\":\"DinozToNPC\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozItemsToDinoz\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DinozItemToDinoz\",\"relationName\":\"DinozToDinozItemToDinoz\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"offers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Offer\",\"relationName\":\"DinozToOffer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"followers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozFollowers\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Log\",\"relationName\":\"DinozToLog\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"catches\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DinozCatch\",\"relationName\":\"DinozToDinozCatch\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DinozItem\":{\"dbName\":\"dinoz_item\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToDinozItem\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozItemToDinoz\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DinozItemToDinoz\",\"relationName\":\"DinozItemToDinozItemToDinoz\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DinozItemToDinoz\":{\"dbName\":\"dinoz_items_dinoz_item\",\"fields\":[{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozItemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToDinozItemToDinoz\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz_item\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DinozItem\",\"relationName\":\"DinozItemToDinozItemToDinoz\",\"relationFromFields\":[\"dinozItemId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"dinozId\",\"dinozItemId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DinozMission\":{\"dbName\":\"dinoz_mission\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"missionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"step\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFinished\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToDinozMission\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"missionId\",\"dinozId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"missionId\",\"dinozId\"]}],\"isGenerated\":false},\"DinozSkill\":{\"dbName\":\"dinoz_skill\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skillId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToDinozSkill\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"skillId\",\"dinozId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"skillId\",\"dinozId\"]}],\"isGenerated\":false},\"DinozSkillUnlockable\":{\"dbName\":\"dinoz_skill_unlockable\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skillId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToDinozSkillUnlockable\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DinozStatus\":{\"dbName\":\"dinoz_status\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statusId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToDinozStatus\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"statusId\",\"dinozId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"statusId\",\"dinozId\"]}],\"isGenerated\":false},\"ImportedDinoz\":{\"dbName\":\"imported_dinoz\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importedId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isSacrificed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"display\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"life\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxLife\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"experience\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpFire\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpWood\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpWater\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpLightning\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpAir\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFrozen\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayer\",\"relationName\":\"ImportedDinozToImportedPlayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz_skill\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedDinozSkill\",\"relationName\":\"ImportedDinozToImportedDinozSkill\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz_status\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedDinozStatus\",\"relationName\":\"ImportedDinozToImportedDinozStatus\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedDinozSkill\":{\"dbName\":\"imported_dinoz_skill\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skillId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedDinoz\",\"relationName\":\"ImportedDinozToImportedDinozSkill\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedDinozStatus\":{\"dbName\":\"imported_dinoz_status\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statusId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedDinoz\",\"relationName\":\"ImportedDinozToImportedDinozStatus\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedPlayer\":{\"dbName\":\"imported_player\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"twinId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"money\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedDinoz\",\"relationName\":\"ImportedDinozToImportedPlayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"ImportedPlayerToPlayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player_ingredients\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayerIngredient\",\"relationName\":\"ImportedPlayerToImportedPlayerIngredient\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player_item\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayerItem\",\"relationName\":\"ImportedPlayerToImportedPlayerItem\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player_reward\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayerReward\",\"relationName\":\"ImportedPlayerToImportedPlayerReward\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player_scenario\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayerScenario\",\"relationName\":\"ImportedPlayerToImportedPlayerScenario\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedPlayerIngredient\":{\"dbName\":\"imported_player_ingredients\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ingredientId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayer\",\"relationName\":\"ImportedPlayerToImportedPlayerIngredient\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedPlayerItem\":{\"dbName\":\"imported_player_item\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayer\",\"relationName\":\"ImportedPlayerToImportedPlayerItem\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedPlayerReward\":{\"dbName\":\"imported_player_reward\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rewardId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayer\",\"relationName\":\"ImportedPlayerToImportedPlayerReward\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedPlayerScenario\":{\"dbName\":\"imported_player_scenario\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"questName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progression\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayer\",\"relationName\":\"ImportedPlayerToImportedPlayerScenario\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedTwinoidAchievement\":{\"dbName\":\"imported_twinoid_achievements\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"siteId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nameId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requirement\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"ImportedTwinoidAchievementToPlayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedTwinoidSite\":{\"dbName\":\"imported_twinoid_site\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"siteId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"npoints\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"points\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"ImportedTwinoidSiteToPlayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ImportedTwinoidStat\":{\"dbName\":\"imported_twinoid_stats\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"siteId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nameId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"ImportedTwinoidStatToPlayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"migrations\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"News\":{\"dbName\":\"news\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Bytes\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frenchTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frenchText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"englishTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"englishText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spanishTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spanishText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"germanTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"germanText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"NPC\":{\"dbName\":\"npc\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"npcId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"step\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToNPC\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"npcId\",\"dinozId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"npcId\",\"dinozId\"]}],\"isGenerated\":false},\"Player\":{\"dbName\":\"player\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hasImported\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eternalTwinId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"money\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quetzuBought\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leader\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"engineer\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cooker\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shopKeeper\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"merchant\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priest\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"teacher\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":true},{\"name\":\"lastLogin\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToPlayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importedPlayer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedPlayer\",\"relationName\":\"ImportedPlayerToPlayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importedTwinoidAchievements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedTwinoidAchievement\",\"relationName\":\"ImportedTwinoidAchievementToPlayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importedTwinoidSite\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedTwinoidSite\",\"relationName\":\"ImportedTwinoidSiteToPlayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importedTwinoidStats\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ImportedTwinoidStat\",\"relationName\":\"ImportedTwinoidStatToPlayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozShop\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlayerDinozShop\",\"relationName\":\"PlayerToPlayerDinozShop\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"gathers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlayerGather\",\"relationName\":\"PlayerToPlayerGather\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ingredients\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlayerIngredient\",\"relationName\":\"PlayerToPlayerIngredient\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"items\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlayerItem\",\"relationName\":\"PlayerToPlayerItem\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quests\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlayerQuest\",\"relationName\":\"PlayerToPlayerQuest\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rewards\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"PlayerReward\",\"relationName\":\"PlayerToPlayerReward\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ranking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Ranking\",\"relationName\":\"PlayerToRanking\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"offers\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Offer\",\"relationName\":\"OfferToPlayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bids\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OfferBid\",\"relationName\":\"OfferBidToPlayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"logs\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Log\",\"relationName\":\"LogToPlayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PlayerDinozShop\":{\"dbName\":\"player_dinoz_shop\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"raceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"display\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"PlayerToPlayerDinozShop\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PlayerGather\":{\"dbName\":\"player_gather\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"place\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"grid\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"PlayerToPlayerGather\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"PlayerIngredient\":{\"dbName\":\"player_ingredient\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ingredientId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"PlayerToPlayerIngredient\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"ingredientId\",\"playerId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"ingredientId\",\"playerId\"]}],\"isGenerated\":false},\"PlayerItem\":{\"dbName\":\"player_item\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"PlayerToPlayerItem\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"itemId\",\"playerId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"itemId\",\"playerId\"]}],\"isGenerated\":false},\"PlayerQuest\":{\"dbName\":\"player_quest\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"questId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progression\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"PlayerToPlayerQuest\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"questId\",\"playerId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"questId\",\"playerId\"]}],\"isGenerated\":false},\"PlayerReward\":{\"dbName\":\"player_reward\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rewardId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"PlayerToPlayerReward\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[[\"rewardId\",\"playerId\"]],\"uniqueIndexes\":[{\"name\":null,\"fields\":[\"rewardId\",\"playerId\"]}],\"isGenerated\":false},\"Ranking\":{\"dbName\":\"ranking\",\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"points\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"average\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"PlayerToRanking\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Secret\":{\"dbName\":\"secret\",\"fields\":[{\"name\":\"key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"OfferItem\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"offerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"offer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Offer\",\"relationName\":\"OfferToOfferItem\",\"relationFromFields\":[\"offerId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isIngredient\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"OfferBid\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"offerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"offer\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Offer\",\"relationName\":\"OfferToOfferBid\",\"relationFromFields\":[\"offerId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"userId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"user\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"OfferBidToPlayer\",\"relationFromFields\":[\"userId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Offer\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sellerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"seller\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"OfferToPlayer\",\"relationFromFields\":[\"sellerId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"endDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"DateTime\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToOffer\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"items\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OfferItem\",\"relationName\":\"OfferToOfferItem\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"total\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"bids\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"OfferBid\",\"relationName\":\"OfferToOfferBid\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"status\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"OfferStatus\",\"default\":\"ONGOING\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"Log\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Player\",\"relationName\":\"LogToPlayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToLog\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"enum\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"LogType\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"values\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"String\",\"default\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdAt\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"DinozCatch\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Dinoz\",\"relationName\":\"DinozToDinozCatch\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"monsterId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{\"OfferStatus\":{\"values\":[{\"name\":\"ONGOING\",\"dbName\":null},{\"name\":\"ENDED\",\"dbName\":null},{\"name\":\"CANCELLED\",\"dbName\":null}],\"dbName\":null},\"LogType\":{\"values\":[{\"name\":\"ItemUsed\",\"dbName\":null},{\"name\":\"ItemBought\",\"dbName\":null},{\"name\":\"GoldWon\",\"dbName\":null},{\"name\":\"GoldLost\",\"dbName\":null},{\"name\":\"Move\",\"dbName\":null},{\"name\":\"LevelUp\",\"dbName\":null},{\"name\":\"Fight\",\"dbName\":null},{\"name\":\"Death\",\"dbName\":null},{\"name\":\"Revive\",\"dbName\":null},{\"name\":\"MissionStep\",\"dbName\":null},{\"name\":\"MissionFinished\",\"dbName\":null},{\"name\":\"MissionCanceled\",\"dbName\":null},{\"name\":\"Gather\",\"dbName\":null},{\"name\":\"CreateDinoz\",\"dbName\":null},{\"name\":\"ChangeDinozOrder\",\"dbName\":null},{\"name\":\"AdminUpdateDinoz\",\"dbName\":null},{\"name\":\"AdminAddStatus\",\"dbName\":null},{\"name\":\"AdminRemoveStatus\",\"dbName\":null},{\"name\":\"AdminAddSkill\",\"dbName\":null},{\"name\":\"AdminRemoveSkill\",\"dbName\":null},{\"name\":\"AdminAddMoney\",\"dbName\":null},{\"name\":\"AdminRemoveMoney\",\"dbName\":null},{\"name\":\"AdminAddReward\",\"dbName\":null},{\"name\":\"AdminRemoveReward\",\"dbName\":null},{\"name\":\"AdminUpdatePlayer\",\"dbName\":null},{\"name\":\"AdminUpdateSecret\",\"dbName\":null}],\"dbName\":null}},\"types\":{}}")
defineDmmfProperty(exports.Prisma, config.runtimeDataModel)
config.getQueryEngineWasmModule = undefined


const { warnEnvConflicts } = require('./runtime/library')

warnEnvConflicts({
    rootEnvPath: config.relativeEnvPaths.rootEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.rootEnvPath),
    schemaEnvPath: config.relativeEnvPaths.schemaEnvPath && path.resolve(config.dirname, config.relativeEnvPaths.schemaEnvPath)
})

const PrismaClient = getPrismaClient(config)
exports.PrismaClient = PrismaClient
Object.assign(exports, Prisma)

// file annotations for bundling tools to include these files
path.join(__dirname, "query_engine-windows.dll.node");
path.join(process.cwd(), "../prisma/query_engine-windows.dll.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-3.0.x.so.node");
path.join(process.cwd(), "../prisma/libquery_engine-debian-openssl-3.0.x.so.node")

// file annotations for bundling tools to include these files
path.join(__dirname, "libquery_engine-debian-openssl-1.1.x.so.node");
path.join(process.cwd(), "../prisma/libquery_engine-debian-openssl-1.1.x.so.node")
// file annotations for bundling tools to include these files
path.join(__dirname, "schema.prisma");
path.join(process.cwd(), "../prisma/schema.prisma")
