export interface Config {
	general: GeneralConfig;
	oauth: OauthConfig;
	db: DbConfig;
	jwt: JwtConfig;
	shop: ShopConfig;
	player: PlayerConfig;
}

interface GeneralConfig {
	readonly eternalTwinURI: string;
	readonly publicUri: string;
	readonly redirectURI: string;
}

interface OauthConfig {
	readonly client_id: string;
	readonly client_secret: string;
	readonly authorizationURI: string;
	readonly tokenURI: string;
	readonly callbackURI: string;
}

interface DbConfig {
	readonly host: string;
	readonly user: string;
	readonly password: string;
	readonly dbName: string;
}

interface JwtConfig {
	readonly secretKey: string;
}

interface ShopConfig {
	readonly dinozInShop: number;
	readonly buyableQuetzu: number;
}

interface PlayerConfig {
	readonly initialMoney: number;
}
