
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
} = require('./runtime/library')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.6.0
 * Query Engine version: e95e739751f42d8ca026f6b910f5a2dc5adeaeee
 */
Prisma.prismaVersion = {
  client: "5.6.0",
  engine: "e95e739751f42d8ca026f6b910f5a2dc5adeaeee"
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

exports.Prisma.DinozScalarFieldEnum = {
  id: 'id',
  following: 'following',
  name: 'name',
  isFrozen: 'isFrozen',
  isSacrificed: 'isSacrificed',
  raceId: 'raceId',
  level: 'level',
  missionId: 'missionId',
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
  playerId: 'playerId',
  order: 'order',
  concentrationId: 'concentrationId'
};

exports.Prisma.Dinoz_itemScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  dinozId: 'dinozId'
};

exports.Prisma.Dinoz_items_dinoz_itemScalarFieldEnum = {
  dinozId: 'dinozId',
  dinozItemId: 'dinozItemId'
};

exports.Prisma.Dinoz_missionScalarFieldEnum = {
  id: 'id',
  missionId: 'missionId',
  dinozId: 'dinozId',
  step: 'step',
  isFinished: 'isFinished',
  progress: 'progress'
};

exports.Prisma.Dinoz_skillScalarFieldEnum = {
  id: 'id',
  skillId: 'skillId',
  state: 'state',
  dinozId: 'dinozId'
};

exports.Prisma.Dinoz_skill_unlockableScalarFieldEnum = {
  id: 'id',
  skillId: 'skillId',
  dinozId: 'dinozId'
};

exports.Prisma.Dinoz_statusScalarFieldEnum = {
  id: 'id',
  statusId: 'statusId',
  dinozId: 'dinozId'
};

exports.Prisma.Imported_dinozScalarFieldEnum = {
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

exports.Prisma.Imported_dinoz_skillScalarFieldEnum = {
  id: 'id',
  skillId: 'skillId',
  dinozId: 'dinozId'
};

exports.Prisma.Imported_dinoz_statusScalarFieldEnum = {
  id: 'id',
  dinozId: 'dinozId',
  statusId: 'statusId'
};

exports.Prisma.Imported_playerScalarFieldEnum = {
  id: 'id',
  name: 'name',
  twinId: 'twinId',
  money: 'money',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
  playerId: 'playerId'
};

exports.Prisma.Imported_player_ingredientsScalarFieldEnum = {
  id: 'id',
  ingredientId: 'ingredientId',
  quantity: 'quantity',
  playerId: 'playerId'
};

exports.Prisma.Imported_player_itemScalarFieldEnum = {
  id: 'id',
  quantity: 'quantity',
  playerId: 'playerId',
  itemId: 'itemId'
};

exports.Prisma.Imported_player_rewardScalarFieldEnum = {
  id: 'id',
  playerId: 'playerId',
  rewardId: 'rewardId'
};

exports.Prisma.Imported_player_scenarioScalarFieldEnum = {
  id: 'id',
  questName: 'questName',
  progression: 'progression',
  playerId: 'playerId'
};

exports.Prisma.Imported_twinoid_achievementsScalarFieldEnum = {
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

exports.Prisma.Imported_twinoid_siteScalarFieldEnum = {
  id: 'id',
  siteId: 'siteId',
  npoints: 'npoints',
  points: 'points',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
  playerId: 'playerId'
};

exports.Prisma.Imported_twinoid_statsScalarFieldEnum = {
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

exports.Prisma.NpcScalarFieldEnum = {
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
  updatedDate: 'updatedDate'
};

exports.Prisma.Player_dinoz_shopScalarFieldEnum = {
  id: 'id',
  raceId: 'raceId',
  display: 'display',
  playerId: 'playerId'
};

exports.Prisma.Player_gatherScalarFieldEnum = {
  id: 'id',
  place: 'place',
  type: 'type',
  grid: 'grid',
  playerId: 'playerId'
};

exports.Prisma.Player_ingredientScalarFieldEnum = {
  id: 'id',
  ingredientId: 'ingredientId',
  quantity: 'quantity',
  playerId: 'playerId'
};

exports.Prisma.Player_itemScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  quantity: 'quantity',
  playerId: 'playerId'
};

exports.Prisma.Player_questScalarFieldEnum = {
  id: 'id',
  questId: 'questId',
  progression: 'progression',
  playerId: 'playerId'
};

exports.Prisma.Player_rewardScalarFieldEnum = {
  id: 'id',
  rewardId: 'rewardId',
  playerId: 'playerId'
};

exports.Prisma.RankingScalarFieldEnum = {
  id: 'id',
  sumPosition: 'sumPosition',
  sumPoints: 'sumPoints',
  sumPointsDisplayed: 'sumPointsDisplayed',
  averagePosition: 'averagePosition',
  averagePoints: 'averagePoints',
  averagePointsDisplayed: 'averagePointsDisplayed',
  dinozCount: 'dinozCount',
  dinozCountDisplayed: 'dinozCountDisplayed',
  playerId: 'playerId'
};

exports.Prisma.SecretScalarFieldEnum = {
  key: 'key',
  value: 'value'
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


exports.Prisma.ModelName = {
  concentration: 'concentration',
  dinoz: 'dinoz',
  dinoz_item: 'dinoz_item',
  dinoz_items_dinoz_item: 'dinoz_items_dinoz_item',
  dinoz_mission: 'dinoz_mission',
  dinoz_skill: 'dinoz_skill',
  dinoz_skill_unlockable: 'dinoz_skill_unlockable',
  dinoz_status: 'dinoz_status',
  imported_dinoz: 'imported_dinoz',
  imported_dinoz_skill: 'imported_dinoz_skill',
  imported_dinoz_status: 'imported_dinoz_status',
  imported_player: 'imported_player',
  imported_player_ingredients: 'imported_player_ingredients',
  imported_player_item: 'imported_player_item',
  imported_player_reward: 'imported_player_reward',
  imported_player_scenario: 'imported_player_scenario',
  imported_twinoid_achievements: 'imported_twinoid_achievements',
  imported_twinoid_site: 'imported_twinoid_site',
  imported_twinoid_stats: 'imported_twinoid_stats',
  migrations: 'migrations',
  news: 'news',
  npc: 'npc',
  player: 'player',
  player_dinoz_shop: 'player_dinoz_shop',
  player_gather: 'player_gather',
  player_ingredient: 'player_ingredient',
  player_item: 'player_item',
  player_quest: 'player_quest',
  player_reward: 'player_reward',
  ranking: 'ranking',
  secret: 'secret'
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
    "previewFeatures": [],
    "isCustomOutput": true
  },
  "relativeEnvPaths": {
    "rootEnvPath": null,
    "schemaEnvPath": "../ed-be/.env"
  },
  "relativePath": "../ed-be/prisma",
  "clientVersion": "5.6.0",
  "engineVersion": "e95e739751f42d8ca026f6b910f5a2dc5adeaeee",
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
  "inlineSchema": "Z2VuZXJhdG9yIGNsaWVudCB7CiAgcHJvdmlkZXIgICAgICA9ICJwcmlzbWEtY2xpZW50LWpzIgogIG91dHB1dCAgICAgICAgPSAiLi4vLi4vcHJpc21hIgogIGJpbmFyeVRhcmdldHMgPSBbIm5hdGl2ZSIsICJkZWJpYW4tb3BlbnNzbC0zLjAueCIsICJkZWJpYW4tb3BlbnNzbC0xLjEueCJdCn0KCmRhdGFzb3VyY2UgZGIgewogIHByb3ZpZGVyID0gInBvc3RncmVzcWwiCiAgdXJsICAgICAgPSBlbnYoIkRBVEFCQVNFX1VSTCIpCn0KCm1vZGVsIGNvbmNlbnRyYXRpb24gewogIGlkICAgIEludCAgICAgQGlkKG1hcDogIlBLXzhlNWQxNzgzZDQ4YmFiNjg5YjE5MWIwZDJhZiIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBkaW5veiBkaW5veltdCn0KCm1vZGVsIGRpbm96IHsKICBpZCAgICAgICAgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgICAgICAgICBAaWQobWFwOiAiUEtfMjk3Y2E3ZjU1YjU2ODUzYzIwNGQ4MzAxZmI2IikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGZvbGxvd2luZyAgICAgICAgICAgICAgSW50PwogIG5hbWUgICAgICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyCiAgaXNGcm96ZW4gICAgICAgICAgICAgICBCb29sZWFuICAgICAgICAgICAgICAgICAgQGRlZmF1bHQoZmFsc2UpCiAgaXNTYWNyaWZpY2VkICAgICAgICAgICBCb29sZWFuICAgICAgICAgICAgICAgICAgQGRlZmF1bHQoZmFsc2UpCiAgcmFjZUlkICAgICAgICAgICAgICAgICBJbnQKICBsZXZlbCAgICAgICAgICAgICAgICAgIEludAogIG1pc3Npb25JZCAgICAgICAgICAgICAgSW50PwogIG5leHRVcEVsZW1lbnRJZCAgICAgICAgSW50CiAgbmV4dFVwQWx0RWxlbWVudElkICAgICBJbnQKICBwbGFjZUlkICAgICAgICAgICAgICAgIEludAogIGNhbkNoYW5nZU5hbWUgICAgICAgICAgQm9vbGVhbgogIGRpc3BsYXkgICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyCiAgbGlmZSAgICAgICAgICAgICAgICAgICBJbnQKICBtYXhMaWZlICAgICAgICAgICAgICAgIEludAogIGV4cGVyaWVuY2UgICAgICAgICAgICAgSW50CiAgbmJyVXBGaXJlICAgICAgICAgICAgICBJbnQKICBuYnJVcFdvb2QgICAgICAgICAgICAgIEludAogIG5iclVwV2F0ZXIgICAgICAgICAgICAgSW50CiAgbmJyVXBMaWdodG5pbmcgICAgICAgICBJbnQKICBuYnJVcEFpciAgICAgICAgICAgICAgIEludAogIGNyZWF0ZWREYXRlICAgICAgICAgICAgRGF0ZVRpbWUgICAgICAgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDYpCiAgdXBkYXRlZERhdGUgICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgICAgQGRlZmF1bHQobm93KCkpIEBkYi5UaW1lc3RhbXAoNikKICBwbGF5ZXJJZCAgICAgICAgICAgICAgIEludD8KICBvcmRlciAgICAgICAgICAgICAgICAgIEludD8KICBjb25jZW50cmF0aW9uSWQgICAgICAgIEludD8KICBwbGF5ZXIgICAgICAgICAgICAgICAgIHBsYXllcj8gICAgICAgICAgICAgICAgICBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS18wNjQxMzVmMjNlY2FmMDIwN2FmOTkyNmQ3YzkiKQogIGNvbmNlbnRyYXRpb24gICAgICAgICAgY29uY2VudHJhdGlvbj8gICAgICAgICAgIEByZWxhdGlvbihmaWVsZHM6IFtjb25jZW50cmF0aW9uSWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzY5M2QxZTgzOWNiZDEzNDcxZmYzNzIxYjk5NCIpCiAgZGlub3pfaXRlbSAgICAgICAgICAgICBkaW5vel9pdGVtW10KICBkaW5vel9pdGVtc19kaW5vel9pdGVtIGRpbm96X2l0ZW1zX2Rpbm96X2l0ZW1bXQogIGRpbm96X21pc3Npb24gICAgICAgICAgZGlub3pfbWlzc2lvbltdCiAgZGlub3pfc2tpbGwgICAgICAgICAgICBkaW5vel9za2lsbFtdCiAgZGlub3pfc2tpbGxfdW5sb2NrYWJsZSBkaW5vel9za2lsbF91bmxvY2thYmxlW10KICBkaW5vel9zdGF0dXMgICAgICAgICAgIGRpbm96X3N0YXR1c1tdCiAgbnBjICAgICAgICAgICAgICAgICAgICBucGNbXQp9Cgptb2RlbCBkaW5vel9pdGVtIHsKICBpZCAgICAgICAgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgICAgICAgICBAaWQobWFwOiAiUEtfYzAyZTAxMTkwMTExNTExNjQyYTRjMzUzOGYwIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGl0ZW1JZCAgICAgICAgICAgICAgICAgSW50CiAgZGlub3pJZCAgICAgICAgICAgICAgICBJbnQ/CiAgZGlub3ogICAgICAgICAgICAgICAgICBkaW5vej8gICAgICAgICAgICAgICAgICAgQHJlbGF0aW9uKGZpZWxkczogW2Rpbm96SWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS18zNzA1NWRhNTU1MzQxOTZmMjI0OGExYjVjNmQiKQogIGRpbm96X2l0ZW1zX2Rpbm96X2l0ZW0gZGlub3pfaXRlbXNfZGlub3pfaXRlbVtdCn0KCm1vZGVsIGRpbm96X2l0ZW1zX2Rpbm96X2l0ZW0gewogIGRpbm96SWQgICAgIEludAogIGRpbm96SXRlbUlkIEludAogIGRpbm96ICAgICAgIGRpbm96ICAgICAgQHJlbGF0aW9uKGZpZWxkczogW2Rpbm96SWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgbWFwOiAiRktfNGU4MWJkNTZiNjc1MjY0YmE1ZjMwYTVmMTA5IikKICBkaW5vel9pdGVtICBkaW5vel9pdGVtIEByZWxhdGlvbihmaWVsZHM6IFtkaW5vekl0ZW1JZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBtYXA6ICJGS19lOTBmNjI3MWYxMWIzNTIyMzEyMTM5ZWYzYTkiKQoKICBAQGlkKFtkaW5veklkLCBkaW5vekl0ZW1JZF0sIG1hcDogIlBLX2U3MTYxYWQ5NzAyY2E1NzQyODBjZjFhMTYxNyIpCiAgQEBpbmRleChbZGlub3pJZF0sIG1hcDogIklEWF80ZTgxYmQ1NmI2NzUyNjRiYTVmMzBhNWYxMCIpCiAgQEBpbmRleChbZGlub3pJdGVtSWRdLCBtYXA6ICJJRFhfZTkwZjYyNzFmMTFiMzUyMjMxMjEzOWVmM2EiKQp9Cgptb2RlbCBkaW5vel9taXNzaW9uIHsKICBpZCAgICAgICAgIEludCAgICAgIEBpZChtYXA6ICJQS19kZmViMTI0NWU2OGQ3MmRiOWE2Yzk0MDJhYjciKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgbWlzc2lvbklkICBJbnQKICBkaW5veklkICAgIEludD8KICBzdGVwICAgICAgIEludAogIGlzRmluaXNoZWQgQm9vbGVhbj8KICBwcm9ncmVzcyAgIEludD8KICBkaW5veiAgICAgIGRpbm96PyAgIEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfZjQwOGRkYjY5MmFiNTUxOTgwOGYyNGZiMmI3IikKfQoKbW9kZWwgZGlub3pfc2tpbGwgewogIGlkICAgICAgSW50ICAgICBAaWQobWFwOiAiUEtfYzQxMDlmYWQ4NjI3ZGE2NzNkMzYxNGZiYzAxIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIHNraWxsSWQgSW50CiAgc3RhdGUgICBCb29sZWFuIEBkZWZhdWx0KHRydWUpCiAgZGlub3pJZCBJbnQ/CiAgZGlub3ogICBkaW5vej8gIEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfNTY2MmQwYWQ2NDNlNTU2OTZmMTBiY2JjODU4IikKfQoKbW9kZWwgZGlub3pfc2tpbGxfdW5sb2NrYWJsZSB7CiAgaWQgICAgICBJbnQgICAgQGlkKG1hcDogIlBLX2Y2MTEzMjUwNDIwN2E0Mzc5YTk2YTMyNGU5MyIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBza2lsbElkIEludAogIGRpbm96SWQgSW50PwogIGRpbm96ICAgZGlub3o/IEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfZGI2Yjk1NDc5NjkzZjNlNGI1OTQ4ODAwY2Y4IikKfQoKbW9kZWwgZGlub3pfc3RhdHVzIHsKICBpZCAgICAgICBJbnQgICAgQGlkKG1hcDogIlBLXzE0OTY1M2YxOTM0NjAzYWVkZTkzODAzYzlkZSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBzdGF0dXNJZCBJbnQKICBkaW5veklkICBJbnQ/CiAgZGlub3ogICAgZGlub3o/IEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfZWM1MjMwZmQ0YWQ2NTM3NzBlMTM1NThkZjdkIikKfQoKbW9kZWwgaW1wb3J0ZWRfZGlub3ogewogIGlkICAgICAgICAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgICAgICAgICBAaWQobWFwOiAiUEtfYWM5N2Q2YjBhZThiNTU5ODBmNWNhYWFjYjNkIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGltcG9ydGVkSWQgICAgICAgICAgICBJbnQKICBuYW1lICAgICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIKICBpc1NhY3JpZmljZWQgICAgICAgICAgQm9vbGVhbiAgICAgICAgICAgICAgICAgQGRlZmF1bHQoZmFsc2UpCiAgbGV2ZWwgICAgICAgICAgICAgICAgIEludAogIGRpc3BsYXkgICAgICAgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICBAZGIuVmFyQ2hhcgogIGxpZmUgICAgICAgICAgICAgICAgICBJbnQKICBtYXhMaWZlICAgICAgICAgICAgICAgSW50CiAgZXhwZXJpZW5jZSAgICAgICAgICAgIEludAogIG5iclVwRmlyZSAgICAgICAgICAgICBJbnQKICBuYnJVcFdvb2QgICAgICAgICAgICAgSW50CiAgbmJyVXBXYXRlciAgICAgICAgICAgIEludAogIG5iclVwTGlnaHRuaW5nICAgICAgICBJbnQKICBuYnJVcEFpciAgICAgICAgICAgICAgSW50CiAgY3JlYXRlZERhdGUgICAgICAgICAgIERhdGVUaW1lICAgICAgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDYpCiAgdXBkYXRlZERhdGUgICAgICAgICAgIERhdGVUaW1lICAgICAgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDYpCiAgcGxheWVySWQgICAgICAgICAgICAgIEludD8KICBpc0Zyb3plbiAgICAgICAgICAgICAgQm9vbGVhbgogIGltcG9ydGVkX3BsYXllciAgICAgICBpbXBvcnRlZF9wbGF5ZXI/ICAgICAgICBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS19iNTJmZTQ5NjQzNzg0MWQwYWYzNmM5Mzc3YzgiKQogIGltcG9ydGVkX2Rpbm96X3NraWxsICBpbXBvcnRlZF9kaW5vel9za2lsbFtdCiAgaW1wb3J0ZWRfZGlub3pfc3RhdHVzIGltcG9ydGVkX2Rpbm96X3N0YXR1c1tdCn0KCm1vZGVsIGltcG9ydGVkX2Rpbm96X3NraWxsIHsKICBpZCAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgQGlkKG1hcDogIlBLXzZiM2ViNWMyZDQ4MWQ4NmRlNzU0YTA3ZWNlOSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBza2lsbElkICAgICAgICBJbnQKICBkaW5veklkICAgICAgICBJbnQ/CiAgaW1wb3J0ZWRfZGlub3ogaW1wb3J0ZWRfZGlub3o/IEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfNmMyM2M3NzM4OWM0MTA5NDlmNzMxNzU4NWI1IikKfQoKbW9kZWwgaW1wb3J0ZWRfZGlub3pfc3RhdHVzIHsKICBpZCAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgQGlkKG1hcDogIlBLXzI0YjkzZmMxYWU1MWUwMDJiZDRhZmZjY2Y4OCIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBkaW5veklkICAgICAgICBJbnQ/CiAgc3RhdHVzSWQgICAgICAgSW50CiAgaW1wb3J0ZWRfZGlub3ogaW1wb3J0ZWRfZGlub3o/IEByZWxhdGlvbihmaWVsZHM6IFtkaW5veklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfZWRiMTQ3ZWRjOTZjNzgxNGU4OGQ4ZGMzNTQ0IikKfQoKbW9kZWwgaW1wb3J0ZWRfcGxheWVyIHsKICBpZCAgICAgICAgICAgICAgICAgICAgICAgICAgSW50ICAgICAgICAgICAgICAgICAgICAgICAgICAgQGlkKG1hcDogIlBLX2E3NTRiMDUwYTkzZWQzMmJhMTkwOGQ4ZmU4NCIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBuYW1lICAgICAgICAgICAgICAgICAgICAgICAgU3RyaW5nICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIKICB0d2luSWQgICAgICAgICAgICAgICAgICAgICAgSW50CiAgbW9uZXkgICAgICAgICAgICAgICAgICAgICAgIEludAogIGNyZWF0ZWREYXRlICAgICAgICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgICAgICAgICBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHVwZGF0ZWREYXRlICAgICAgICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgICAgICAgICBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHBsYXllcklkICAgICAgICAgICAgICAgICAgICBJbnQ/ICAgICAgICAgICAgICAgICAgICAgICAgICBAdW5pcXVlKG1hcDogIlJFTF85N2I0ODM0OWJlNjA3OGZhMWQwZjBlYjg3NyIpCiAgaW1wb3J0ZWRfZGlub3ogICAgICAgICAgICAgIGltcG9ydGVkX2Rpbm96W10KICBwbGF5ZXIgICAgICAgICAgICAgICAgICAgICAgcGxheWVyPyAgICAgICAgICAgICAgICAgICAgICAgQHJlbGF0aW9uKGZpZWxkczogW3BsYXllcklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfOTdiNDgzNDliZTYwNzhmYTFkMGYwZWI4Nzc4IikKICBpbXBvcnRlZF9wbGF5ZXJfaW5ncmVkaWVudHMgaW1wb3J0ZWRfcGxheWVyX2luZ3JlZGllbnRzW10KICBpbXBvcnRlZF9wbGF5ZXJfaXRlbSAgICAgICAgaW1wb3J0ZWRfcGxheWVyX2l0ZW1bXQogIGltcG9ydGVkX3BsYXllcl9yZXdhcmQgICAgICBpbXBvcnRlZF9wbGF5ZXJfcmV3YXJkW10KICBpbXBvcnRlZF9wbGF5ZXJfc2NlbmFyaW8gICAgaW1wb3J0ZWRfcGxheWVyX3NjZW5hcmlvW10KfQoKbW9kZWwgaW1wb3J0ZWRfcGxheWVyX2luZ3JlZGllbnRzIHsKICBpZCAgICAgICAgICAgICAgSW50ICAgICAgICAgICAgICBAaWQobWFwOiAiUEtfMjJmZWQ1MjQxMmUxOTUzZjc2MWEzOGNlMjdjIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGluZ3JlZGllbnRJZCAgICBJbnQKICBxdWFudGl0eSAgICAgICAgSW50CiAgcGxheWVySWQgICAgICAgIEludD8KICBpbXBvcnRlZF9wbGF5ZXIgaW1wb3J0ZWRfcGxheWVyPyBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS18xOGVhZjNlYzJlZDc1NzZiZmI2NzZjNmRhYjUiKQp9Cgptb2RlbCBpbXBvcnRlZF9wbGF5ZXJfaXRlbSB7CiAgaWQgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgQGlkKG1hcDogIlBLX2Q4NTY4NGIzN2FjM2UwNDRkMTVlYTk1ZTE2ZiIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBxdWFudGl0eSAgICAgICAgSW50CiAgcGxheWVySWQgICAgICAgIEludD8KICBpdGVtSWQgICAgICAgICAgSW50CiAgaW1wb3J0ZWRfcGxheWVyIGltcG9ydGVkX3BsYXllcj8gQHJlbGF0aW9uKGZpZWxkczogW3BsYXllcklkXSwgcmVmZXJlbmNlczogW2lkXSwgb25EZWxldGU6IENhc2NhZGUsIG9uVXBkYXRlOiBOb0FjdGlvbiwgbWFwOiAiRktfM2RmNmY5NjhhMTI5ZmUwMzExZjAxZDAwMzM4IikKfQoKbW9kZWwgaW1wb3J0ZWRfcGxheWVyX3Jld2FyZCB7CiAgaWQgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgQGlkKG1hcDogIlBLX2M2YjBjNWY5YWViNDEyZWUxMmYwMzA5ZDI5OSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBwbGF5ZXJJZCAgICAgICAgSW50PwogIHJld2FyZElkICAgICAgICBJbnQKICBpbXBvcnRlZF9wbGF5ZXIgaW1wb3J0ZWRfcGxheWVyPyBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS182M2MxMTlhYWI1ZjZkOTk5MGYyYjEwMDYyYzMiKQp9Cgptb2RlbCBpbXBvcnRlZF9wbGF5ZXJfc2NlbmFyaW8gewogIGlkICAgICAgICAgICAgICBJbnQgICAgICAgICAgICAgIEBpZChtYXA6ICJQS184NGE1MTgxYThkM2YwMjU1YmNmOWFiOTA0YzQiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgcXVlc3ROYW1lICAgICAgIFN0cmluZyAgICAgICAgICAgQGRiLlZhckNoYXIKICBwcm9ncmVzc2lvbiAgICAgSW50CiAgcGxheWVySWQgICAgICAgIEludD8KICBpbXBvcnRlZF9wbGF5ZXIgaW1wb3J0ZWRfcGxheWVyPyBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS18yNGIwZGJlNGM4NjJjMmY2NTFkODc5NWY2NWEiKQp9Cgptb2RlbCBpbXBvcnRlZF90d2lub2lkX2FjaGlldmVtZW50cyB7CiAgaWQgICAgICAgICAgSW50ICAgICAgQGlkKG1hcDogIlBLXzJmMDY4ZDk1MWY5Y2M5NzY0MjIxZTY0OTIwNiIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBzaXRlSWQgICAgICBJbnQKICBkYXRlICAgICAgICBTdHJpbmcgICBAZGIuVmFyQ2hhcgogIG5hbWVJZCAgICAgIFN0cmluZyAgIEBkYi5WYXJDaGFyCiAgY3JlYXRlZERhdGUgRGF0ZVRpbWUgQGRlZmF1bHQobm93KCkpIEBkYi5UaW1lc3RhbXAoNikKICB1cGRhdGVkRGF0ZSBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHBsYXllcklkICAgIEludD8KICByZXF1aXJlbWVudCBTdHJpbmcgICBAZGIuVmFyQ2hhcgogIHF1YW50aXR5ICAgIEludAogIHBsYXllciAgICAgIHBsYXllcj8gIEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzUwMjgyYjE2MDg3MjM1M2VkYTYyNzY0MThkMSIpCn0KCm1vZGVsIGltcG9ydGVkX3R3aW5vaWRfc2l0ZSB7CiAgaWQgICAgICAgICAgSW50ICAgICAgQGlkKG1hcDogIlBLX2M1YmJiMWMxZmY0NjY0NDJmMWViNGM0ODA3OCIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBzaXRlSWQgICAgICBJbnQKICBucG9pbnRzICAgICBJbnQKICBwb2ludHMgICAgICBJbnQKICBjcmVhdGVkRGF0ZSBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHVwZGF0ZWREYXRlIERhdGVUaW1lIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDYpCiAgcGxheWVySWQgICAgSW50PwogIHBsYXllciAgICAgIHBsYXllcj8gIEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzgwMzU2NjllYzFlN2I1YTBiMDlkNGM3NmRiNyIpCn0KCm1vZGVsIGltcG9ydGVkX3R3aW5vaWRfc3RhdHMgewogIGlkICAgICAgICAgIEludCAgICAgIEBpZChtYXA6ICJQS184YjNlMDg0YTY5MTc0NDVhMzI0ZDEyYzM4MmQiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgc2l0ZUlkICAgICAgSW50CiAgc2NvcmUgICAgICAgSW50CiAgbmFtZUlkICAgICAgU3RyaW5nICAgQGRiLlZhckNoYXIKICBjcmVhdGVkRGF0ZSBEYXRlVGltZSBAZGVmYXVsdChub3coKSkgQGRiLlRpbWVzdGFtcCg2KQogIHVwZGF0ZWREYXRlIERhdGVUaW1lIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDYpCiAgcGxheWVySWQgICAgSW50PwogIHBsYXllciAgICAgIHBsYXllcj8gIEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLX2JjZmE5NzA2ZDBmZDYyNTY5YTdlOWFlYWYyNyIpCn0KCm1vZGVsIG1pZ3JhdGlvbnMgewogIGlkICAgICAgICBJbnQgICAgQGlkKG1hcDogIlBLXzhjODJkN2Y1MjYzNDBhYjczNDI2MGVhNDZiZSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICB0aW1lc3RhbXAgQmlnSW50CiAgbmFtZSAgICAgIFN0cmluZyBAZGIuVmFyQ2hhcgp9Cgptb2RlbCBuZXdzIHsKICBpZCAgICAgICAgICAgSW50ICAgICAgQGlkKG1hcDogIlBLXzM5YTQzZGZjYjYwMDcxODBmMDRhZmYyMzU3ZSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICB0aXRsZSAgICAgICAgU3RyaW5nPyAgQGRiLlZhckNoYXIKICBpbWFnZSAgICAgICAgQnl0ZXM/CiAgZnJlbmNoVGl0bGUgIFN0cmluZz8gIEBkYi5WYXJDaGFyCiAgZnJlbmNoVGV4dCAgIFN0cmluZz8gIEBkYi5WYXJDaGFyCiAgZW5nbGlzaFRpdGxlIFN0cmluZz8gIEBkYi5WYXJDaGFyCiAgZW5nbGlzaFRleHQgIFN0cmluZz8gIEBkYi5WYXJDaGFyCiAgc3BhbmlzaFRpdGxlIFN0cmluZz8gIEBkYi5WYXJDaGFyCiAgc3BhbmlzaFRleHQgIFN0cmluZz8gIEBkYi5WYXJDaGFyCiAgZ2VybWFuVGl0bGUgIFN0cmluZz8gIEBkYi5WYXJDaGFyCiAgZ2VybWFuVGV4dCAgIFN0cmluZz8gIEBkYi5WYXJDaGFyCiAgY3JlYXRlZERhdGUgIERhdGVUaW1lIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDYpCiAgdXBkYXRlZERhdGUgIERhdGVUaW1lIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDYpCn0KCm1vZGVsIG5wYyB7CiAgaWQgICAgICBJbnQgICAgQGlkKG1hcDogIlBLX2Y4OGFjZWUwNTBiZmVhMjExMWIzOTlhYjQ5YiIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBucGNJZCAgIEludAogIHN0ZXAgICAgU3RyaW5nIEBkYi5WYXJDaGFyCiAgZGlub3pJZCBJbnQ/CiAgZGlub3ogICBkaW5vej8gQHJlbGF0aW9uKGZpZWxkczogW2Rpbm96SWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS185MGNlOGEwNzBmZWFlYTI4ZDVhMzkyOTU3NjIiKQp9Cgptb2RlbCBwbGF5ZXIgewogIGlkICAgICAgICAgICAgICAgICAgICAgICAgICAgIEludCAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQGlkKG1hcDogIlBLXzY1ZWRhZGM5NDZhN2ZhZjRiNjM4ZDVlODg4NSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBoYXNJbXBvcnRlZCAgICAgICAgICAgICAgICAgICBCb29sZWFuCiAgY3VzdG9tVGV4dCAgICAgICAgICAgICAgICAgICAgU3RyaW5nPwogIG5hbWUgICAgICAgICAgICAgICAgICAgICAgICAgIFN0cmluZyAgICAgICAgICAgICAgICAgICAgICAgICAgQGRiLlZhckNoYXIKICBldGVybmFsVHdpbklkICAgICAgICAgICAgICAgICBTdHJpbmcgICAgICAgICAgICAgICAgICAgICAgICAgIEBkYi5WYXJDaGFyCiAgbW9uZXkgICAgICAgICAgICAgICAgICAgICAgICAgSW50CiAgcXVldHp1Qm91Z2h0ICAgICAgICAgICAgICAgICAgSW50CiAgbGVhZGVyICAgICAgICAgICAgICAgICAgICAgICAgQm9vbGVhbgogIGVuZ2luZWVyICAgICAgICAgICAgICAgICAgICAgIEJvb2xlYW4KICBjb29rZXIgICAgICAgICAgICAgICAgICAgICAgICBCb29sZWFuCiAgc2hvcEtlZXBlciAgICAgICAgICAgICAgICAgICAgQm9vbGVhbgogIG1lcmNoYW50ICAgICAgICAgICAgICAgICAgICAgIEJvb2xlYW4KICBwcmllc3QgICAgICAgICAgICAgICAgICAgICAgICBCb29sZWFuCiAgdGVhY2hlciAgICAgICAgICAgICAgICAgICAgICAgQm9vbGVhbgogIGNyZWF0ZWREYXRlICAgICAgICAgICAgICAgICAgIERhdGVUaW1lICAgICAgICAgICAgICAgICAgICAgICAgQGRlZmF1bHQobm93KCkpIEBkYi5UaW1lc3RhbXAoNikKICB1cGRhdGVkRGF0ZSAgICAgICAgICAgICAgICAgICBEYXRlVGltZSAgICAgICAgICAgICAgICAgICAgICAgIEBkZWZhdWx0KG5vdygpKSBAZGIuVGltZXN0YW1wKDYpCiAgZGlub3ogICAgICAgICAgICAgICAgICAgICAgICAgZGlub3pbXQogIGltcG9ydGVkX3BsYXllciAgICAgICAgICAgICAgIGltcG9ydGVkX3BsYXllcj8KICBpbXBvcnRlZF90d2lub2lkX2FjaGlldmVtZW50cyBpbXBvcnRlZF90d2lub2lkX2FjaGlldmVtZW50c1tdCiAgaW1wb3J0ZWRfdHdpbm9pZF9zaXRlICAgICAgICAgaW1wb3J0ZWRfdHdpbm9pZF9zaXRlW10KICBpbXBvcnRlZF90d2lub2lkX3N0YXRzICAgICAgICBpbXBvcnRlZF90d2lub2lkX3N0YXRzW10KICBwbGF5ZXJfZGlub3pfc2hvcCAgICAgICAgICAgICBwbGF5ZXJfZGlub3pfc2hvcFtdCiAgcGxheWVyX2dhdGhlciAgICAgICAgICAgICAgICAgcGxheWVyX2dhdGhlcltdCiAgcGxheWVyX2luZ3JlZGllbnQgICAgICAgICAgICAgcGxheWVyX2luZ3JlZGllbnRbXQogIHBsYXllcl9pdGVtICAgICAgICAgICAgICAgICAgIHBsYXllcl9pdGVtW10KICBwbGF5ZXJfcXVlc3QgICAgICAgICAgICAgICAgICBwbGF5ZXJfcXVlc3RbXQogIHBsYXllcl9yZXdhcmQgICAgICAgICAgICAgICAgIHBsYXllcl9yZXdhcmRbXQogIHJhbmtpbmcgICAgICAgICAgICAgICAgICAgICAgIHJhbmtpbmc/Cn0KCm1vZGVsIHBsYXllcl9kaW5vel9zaG9wIHsKICBpZCAgICAgICBJbnQgICAgIEBpZChtYXA6ICJQS18wNDZkYzczMDk2MzYwZmZiM2MxY2NhN2ZlNzIiKSBAZGVmYXVsdChhdXRvaW5jcmVtZW50KCkpCiAgcmFjZUlkICAgSW50CiAgZGlzcGxheSAgU3RyaW5nICBAZGIuVmFyQ2hhcgogIHBsYXllcklkIEludD8KICBwbGF5ZXIgICBwbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLX2M3OWFiNjFhYTMyZmU2ZTgxYzAzYTdkODdkMSIpCn0KCm1vZGVsIHBsYXllcl9nYXRoZXIgewogIGlkICAgICAgIEludCAgICAgQGlkKG1hcDogIlBLX2FhZmFkMDg2N2RmOTY1NTE5NTMyMDAyMDljNyIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBwbGFjZSAgICBJbnQKICB0eXBlICAgICBJbnQKICBncmlkICAgICBJbnRbXQogIHBsYXllcklkIEludD8KICBwbGF5ZXIgICBwbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzg2ZWVkNTJmNjZmNzEyNmU0ZGM3YTk5OGNkZiIpCn0KCm1vZGVsIHBsYXllcl9pbmdyZWRpZW50IHsKICBpZCAgICAgICAgICAgSW50ICAgICBAaWQobWFwOiAiUEtfM2FlNWNhOTczMDE0NGQ3NDU2YzE2Mzg2ODY5IikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGluZ3JlZGllbnRJZCBJbnQKICBxdWFudGl0eSAgICAgSW50CiAgcGxheWVySWQgICAgIEludD8KICBwbGF5ZXIgICAgICAgcGxheWVyPyBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS19hZDE5ODM5Mjg4NmE1MmU3ZjE4NDQ3NGEwZDYiKQp9Cgptb2RlbCBwbGF5ZXJfaXRlbSB7CiAgaWQgICAgICAgSW50ICAgICBAaWQobWFwOiAiUEtfNDc0OTZkMTZjNjFmMWIwOWFmNWMyMzk5OTkzIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIGl0ZW1JZCAgIEludAogIHF1YW50aXR5IEludAogIHBsYXllcklkIEludD8KICBwbGF5ZXIgICBwbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzIxNTM1ZmNiOTNmODYxM2ZkODkzYjc0YjA4YiIpCn0KCm1vZGVsIHBsYXllcl9xdWVzdCB7CiAgaWQgICAgICAgICAgSW50ICAgICBAaWQobWFwOiAiUEtfOGNiNGNjOWI0MjM4MDdjNTExZjI0YzBmYWEzIikgQGRlZmF1bHQoYXV0b2luY3JlbWVudCgpKQogIHF1ZXN0SWQgICAgIEludAogIHByb2dyZXNzaW9uIEludAogIHBsYXllcklkICAgIEludD8KICBwbGF5ZXIgICAgICBwbGF5ZXI/IEByZWxhdGlvbihmaWVsZHM6IFtwbGF5ZXJJZF0sIHJlZmVyZW5jZXM6IFtpZF0sIG9uRGVsZXRlOiBDYXNjYWRlLCBvblVwZGF0ZTogTm9BY3Rpb24sIG1hcDogIkZLXzFiNWIwNDFmYWIzMzYyYzg0NWMxNDJjYTNiMCIpCn0KCm1vZGVsIHBsYXllcl9yZXdhcmQgewogIGlkICAgICAgIEludCAgICAgQGlkKG1hcDogIlBLXzY2MDI3NTNlY2VmNDkyMGYxOTdkZTkxMDU5OSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICByZXdhcmRJZCBJbnQKICBwbGF5ZXJJZCBJbnQ/CiAgcGxheWVyICAgcGxheWVyPyBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS185Y2YxNDJiM2E2ZmEzZTBmYWVjN2Y4ZGViZmIiKQp9Cgptb2RlbCByYW5raW5nIHsKICBpZCAgICAgICAgICAgICAgICAgICAgIEludCAgICAgQGlkKG1hcDogIlBLX2JmODJiOGYyNzFlNTAyMzJlNmEzZmNiMDlhOSIpIEBkZWZhdWx0KGF1dG9pbmNyZW1lbnQoKSkKICBzdW1Qb3NpdGlvbiAgICAgICAgICAgIEludCAgICAgQGRlZmF1bHQoMCkKICBzdW1Qb2ludHMgICAgICAgICAgICAgIEludCAgICAgQGRlZmF1bHQoMCkKICBzdW1Qb2ludHNEaXNwbGF5ZWQgICAgIEludCAgICAgQGRlZmF1bHQoMCkKICBhdmVyYWdlUG9zaXRpb24gICAgICAgIEludCAgICAgQGRlZmF1bHQoMCkKICBhdmVyYWdlUG9pbnRzICAgICAgICAgIEludCAgICAgQGRlZmF1bHQoMCkKICBhdmVyYWdlUG9pbnRzRGlzcGxheWVkIEludCAgICAgQGRlZmF1bHQoMCkKICBkaW5vekNvdW50ICAgICAgICAgICAgIEludCAgICAgQGRlZmF1bHQoMCkKICBkaW5vekNvdW50RGlzcGxheWVkICAgIEludCAgICAgQGRlZmF1bHQoMCkKICBwbGF5ZXJJZCAgICAgICAgICAgICAgIEludD8gICAgQHVuaXF1ZShtYXA6ICJSRUxfM2FjOTYxOTZkMGEzODUxOTg5YmU4YzUyYTkiKQogIHBsYXllciAgICAgICAgICAgICAgICAgcGxheWVyPyBAcmVsYXRpb24oZmllbGRzOiBbcGxheWVySWRdLCByZWZlcmVuY2VzOiBbaWRdLCBvbkRlbGV0ZTogQ2FzY2FkZSwgb25VcGRhdGU6IE5vQWN0aW9uLCBtYXA6ICJGS18zYWM5NjE5NmQwYTM4NTE5ODliZThjNTJhOWEiKQp9Cgptb2RlbCBzZWNyZXQgewogIGtleSAgIFN0cmluZyBAaWQgQGRiLlZhckNoYXIKICB2YWx1ZSBTdHJpbmcgQGRiLlZhckNoYXIKfQo=",
  "inlineSchemaHash": "3e7074990bd65b28814c2554997721752e475cd25c4ab773ce827ef87ff6dbf4"
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

config.runtimeDataModel = JSON.parse("{\"models\":{\"concentration\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz\",\"relationName\":\"concentrationTodinoz\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dinoz\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"following\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFrozen\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isSacrificed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"raceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"missionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nextUpElementId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nextUpAltElementId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"placeId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"canChangeName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"display\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"life\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxLife\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"experience\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpFire\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpWood\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpWater\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpLightning\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpAir\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"order\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"concentrationId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"dinozToplayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"concentration\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"concentration\",\"relationName\":\"concentrationTodinoz\",\"relationFromFields\":[\"concentrationId\"],\"relationToFields\":[\"id\"],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz_item\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz_item\",\"relationName\":\"dinozTodinoz_item\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz_items_dinoz_item\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz_items_dinoz_item\",\"relationName\":\"dinozTodinoz_items_dinoz_item\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz_mission\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz_mission\",\"relationName\":\"dinozTodinoz_mission\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz_skill\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz_skill\",\"relationName\":\"dinozTodinoz_skill\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz_skill_unlockable\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz_skill_unlockable\",\"relationName\":\"dinozTodinoz_skill_unlockable\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz_status\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz_status\",\"relationName\":\"dinozTodinoz_status\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"npc\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"npc\",\"relationName\":\"dinozTonpc\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dinoz_item\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz\",\"relationName\":\"dinozTodinoz_item\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz_items_dinoz_item\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz_items_dinoz_item\",\"relationName\":\"dinoz_itemTodinoz_items_dinoz_item\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dinoz_items_dinoz_item\":{\"dbName\":null,\"fields\":[{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozItemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz\",\"relationName\":\"dinozTodinoz_items_dinoz_item\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz_item\",\"kind\":\"object\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz_item\",\"relationName\":\"dinoz_itemTodinoz_items_dinoz_item\",\"relationFromFields\":[\"dinozItemId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":{\"name\":null,\"fields\":[\"dinozId\",\"dinozItemId\"]},\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dinoz_mission\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"missionId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"step\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFinished\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progress\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz\",\"relationName\":\"dinozTodinoz_mission\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dinoz_skill\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skillId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"state\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":true,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz\",\"relationName\":\"dinozTodinoz_skill\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dinoz_skill_unlockable\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skillId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz\",\"relationName\":\"dinozTodinoz_skill_unlockable\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"dinoz_status\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statusId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz\",\"relationName\":\"dinozTodinoz_status\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_dinoz\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"importedId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isSacrificed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Boolean\",\"default\":false,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"level\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"display\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"life\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"maxLife\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"experience\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpFire\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpWood\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpWater\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpLightning\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nbrUpAir\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"isFrozen\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player\",\"relationName\":\"imported_dinozToimported_player\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz_skill\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_dinoz_skill\",\"relationName\":\"imported_dinozToimported_dinoz_skill\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz_status\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_dinoz_status\",\"relationName\":\"imported_dinozToimported_dinoz_status\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_dinoz_skill\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"skillId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_dinoz\",\"relationName\":\"imported_dinozToimported_dinoz_skill\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_dinoz_status\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"statusId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_dinoz\",\"relationName\":\"imported_dinozToimported_dinoz_status\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_player\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"twinId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"money\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_dinoz\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_dinoz\",\"relationName\":\"imported_dinozToimported_player\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"imported_playerToplayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player_ingredients\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player_ingredients\",\"relationName\":\"imported_playerToimported_player_ingredients\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player_item\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player_item\",\"relationName\":\"imported_playerToimported_player_item\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player_reward\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player_reward\",\"relationName\":\"imported_playerToimported_player_reward\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player_scenario\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player_scenario\",\"relationName\":\"imported_playerToimported_player_scenario\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_player_ingredients\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ingredientId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player\",\"relationName\":\"imported_playerToimported_player_ingredients\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_player_item\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player\",\"relationName\":\"imported_playerToimported_player_item\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_player_reward\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rewardId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player\",\"relationName\":\"imported_playerToimported_player_reward\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_player_scenario\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"questName\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progression\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player\",\"relationName\":\"imported_playerToimported_player_scenario\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_twinoid_achievements\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"siteId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"date\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nameId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"requirement\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"imported_twinoid_achievementsToplayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_twinoid_site\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"siteId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"npoints\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"points\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"imported_twinoid_siteToplayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"imported_twinoid_stats\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"siteId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"score\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"nameId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"imported_twinoid_statsToplayer\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"migrations\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"timestamp\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"BigInt\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"news\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"title\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"image\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Bytes\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frenchTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"frenchText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"englishTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"englishText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spanishTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"spanishText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"germanTitle\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"germanText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"npc\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"npcId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"step\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz\",\"relationName\":\"dinozTonpc\",\"relationFromFields\":[\"dinozId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"player\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"hasImported\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"customText\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"name\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"eternalTwinId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"money\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quetzuBought\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"leader\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"engineer\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"cooker\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"shopKeeper\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"merchant\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"priest\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"teacher\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Boolean\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"createdDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"updatedDate\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"DateTime\",\"default\":{\"name\":\"now\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinoz\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"dinoz\",\"relationName\":\"dinozToplayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_player\",\"relationName\":\"imported_playerToplayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_twinoid_achievements\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_twinoid_achievements\",\"relationName\":\"imported_twinoid_achievementsToplayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_twinoid_site\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_twinoid_site\",\"relationName\":\"imported_twinoid_siteToplayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"imported_twinoid_stats\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"imported_twinoid_stats\",\"relationName\":\"imported_twinoid_statsToplayer\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player_dinoz_shop\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player_dinoz_shop\",\"relationName\":\"playerToplayer_dinoz_shop\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player_gather\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player_gather\",\"relationName\":\"playerToplayer_gather\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player_ingredient\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player_ingredient\",\"relationName\":\"playerToplayer_ingredient\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player_item\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player_item\",\"relationName\":\"playerToplayer_item\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player_quest\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player_quest\",\"relationName\":\"playerToplayer_quest\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player_reward\",\"kind\":\"object\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player_reward\",\"relationName\":\"playerToplayer_reward\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ranking\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"ranking\",\"relationName\":\"playerToranking\",\"relationFromFields\":[],\"relationToFields\":[],\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"player_dinoz_shop\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"raceId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"display\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"playerToplayer_dinoz_shop\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"player_gather\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"place\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"type\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"grid\",\"kind\":\"scalar\",\"isList\":true,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"playerToplayer_gather\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"player_ingredient\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"ingredientId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"playerToplayer_ingredient\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"player_item\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"itemId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"quantity\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"playerToplayer_item\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"player_quest\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"questId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"progression\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"playerToplayer_quest\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"player_reward\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"rewardId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"playerToplayer_reward\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"ranking\":{\"dbName\":null,\"fields\":[{\"name\":\"id\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":{\"name\":\"autoincrement\",\"args\":[]},\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sumPosition\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sumPoints\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"sumPointsDisplayed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"averagePosition\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"averagePoints\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"averagePointsDisplayed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozCount\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"dinozCountDisplayed\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":true,\"type\":\"Int\",\"default\":0,\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"playerId\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":false,\"isUnique\":true,\"isId\":false,\"isReadOnly\":true,\"hasDefaultValue\":false,\"type\":\"Int\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"player\",\"kind\":\"object\",\"isList\":false,\"isRequired\":false,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"player\",\"relationName\":\"playerToranking\",\"relationFromFields\":[\"playerId\"],\"relationToFields\":[\"id\"],\"relationOnDelete\":\"Cascade\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false},\"secret\":{\"dbName\":null,\"fields\":[{\"name\":\"key\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":true,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false},{\"name\":\"value\",\"kind\":\"scalar\",\"isList\":false,\"isRequired\":true,\"isUnique\":false,\"isId\":false,\"isReadOnly\":false,\"hasDefaultValue\":false,\"type\":\"String\",\"isGenerated\":false,\"isUpdatedAt\":false}],\"primaryKey\":null,\"uniqueFields\":[],\"uniqueIndexes\":[],\"isGenerated\":false}},\"enums\":{},\"types\":{}}")
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
