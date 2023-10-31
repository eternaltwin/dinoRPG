export interface ImportResponse {
	status: 'deleted' | 'imported';
	server: 'fr' | 'en' | 'es';
	dinozCount: number;
	demonCount: number;
	twinoAccountName: string;
	twinoAccountID: number;
}
