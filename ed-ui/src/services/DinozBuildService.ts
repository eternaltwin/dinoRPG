import {
	CopyDinozBuildResponse,
	CreateDinozBuildResponse,
	GetOwnDinozBuildResponse,
	ListClanSharedBuildsResponse
} from '@drpg/core/returnTypes/DinozBuild';
import { http } from '../utils/index.js';

export const DinozBuildService = {
	async getOwn(): Promise<GetOwnDinozBuildResponse> {
		const res = await http().get(`/dinoz-build`);
		return res.data;
	},
	async createBuild(skills: number[], name: string, shareable: boolean): Promise<CreateDinozBuildResponse> {
		const res = await http().post(`/dinoz-build`, {
			skills: skills,
			name: name,
			shareable: shareable
		});
		return res.data;
	},
	async updateBuild(buildId: string, skills: number[], name: string, shareable: boolean) {
		await http().put(`/dinoz-build/${buildId}`, {
			skills: skills,
			name: name,
			shareable: shareable
		});
	},
	async deleteBuild(buildId: string) {
		await http().delete(`/dinoz-build/${buildId}`);
	},
	async listClanSharedBuilds(): Promise<ListClanSharedBuildsResponse> {
		const res = await http().get(`/dinoz-build/shared/clan`);
		return res.data;
	},
	async copySharedBuild(buildId: string): Promise<CopyDinozBuildResponse> {
		const res = await http().post(`/dinoz-build/${buildId}/copy`);
		return res.data;
	}
};
