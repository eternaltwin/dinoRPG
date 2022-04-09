export interface Config {
	general: GeneralConfig;
	oauth: OauthConfig;
	db: DbConfig;
	jwt: JwtConfig;
	shop: ShopConfig;
	player: PlayerConfig;
	admin: AdminsConfig;
}

interface GeneralConfig {
	readonly eternalTwinPublicUri: string;
	readonly eternalTwinServerUri: string;
	readonly serverUri: string;
	readonly frontUri: string;
}

interface OauthConfig {
	readonly clientId: string;
	readonly clientSecret: string;
	readonly authorizationUri: string;
	readonly tokenUri: string;
	readonly callbackUri: string;
}

interface DbConfig {
	readonly host: string;
	readonly user: string;
	readonly password: string;
	readonly dbName: string;
}

interface JwtConfig {
	readonly secretKey: string;
	readonly expiration: number;
}

interface ShopConfig {
	readonly dinozInShop: number;
	readonly buyableQuetzu: number;
}

interface PlayerConfig {
	readonly initialMoney: number;
}

interface AdminsConfig {
	readonly biocat: string;
	readonly jahaa: string;
	readonly jolu: string;
}
