export class Config {
	general: GeneralConfig;
	oauth: OauthConfig;
	db: DbConfig;
	jwt: JwtConfig;
	admin: AdminsConfig;
	discord: Discord;
}

class GeneralConfig {
	readonly eternalTwinPublicUri: string;
	readonly eternalTwinServerUri: string;
	readonly serverUri: string;
	readonly frontUri: string;
}

class OauthConfig {
	readonly clientId: string;
	readonly clientSecret: string;
	readonly authorizationUri: string;
	readonly tokenUri: string;
	readonly callbackUri: string;
}

class DbConfig {
	readonly host: string;
	readonly user: string;
	readonly password: string;
	readonly dbName: string;
}

class JwtConfig {
	readonly secretKey: string;
	readonly expiration: number;
}

class AdminsConfig {
	readonly biocat: string;
	readonly jahaa: string;
	readonly jolu: string;
}

class Discord {
	readonly channel: string;
	readonly token: string;
}
