import { http } from '../utils/index.js';

export const TestingService = {
	async createTestUsers(): Promise<void> {
		await http().post(`/testing/test-users`);
	},
	async createTestDinoz(): Promise<void> {
		await http().post(`/testing/test-dinoz`);
	},
	async registerTestUsersToDojo(numPlayers: number): Promise<void> {
		await http().post(`/testing/dojo/register-test-players`, { numPlayers: numPlayers });
	},
	async registerTestUsersToFBTournament(numPlayers: number): Promise<void> {
		await http().post(`/testing/fb/register-test-players`, { numPlayers: numPlayers });
	}
};
