export interface JwtTrial {
	exp: number;
	iat: number;
	isAdmin: boolean;
	playerId: string | number;
}
