import {
	CopyDinozBuildResponse,
	CreateDinozBuildResponse,
	DeleteDinozBuildResponse,
	GetOwnDinozBuildResponse,
	ListClanSharedBuildsResponse,
	UpdateDinozBuildResponse
} from '@drpg/core/returnTypes/DinozBuild';
import { http } from '../utils/index.js';

export const DinozBuildService = {
	async getOwn() {
		return http()
			.get(`/dinoz-build`)
			.then(res => Promise.resolve<GetOwnDinozBuildResponse>(res.data))
			.catch(err => Promise.reject(err));
	},
	async createBuild(skills: number[], name: string, shareable: boolean) {
		return http()
			.post(`/dinoz-build`, {
				skills: skills,
				name: name,
				shareable: shareable
			})
			.then(res => Promise.resolve<CreateDinozBuildResponse>(res.data))
			.catch(err => Promise.reject(err));
	},
	async updateBuild(buildId: string, skills: number[], name: string, shareable: boolean) {
		return http()
			.put(`/dinoz-build/${buildId}`, {
				skills: skills,
				name: name,
				shareable: shareable
			})
			.then(res => Promise.resolve<UpdateDinozBuildResponse>(res.data))
			.catch(err => Promise.reject(err));
	},
	async deleteBuild(buildId: string) {
		return http()
			.delete(`/dinoz-build/${buildId}`)
			.then(res => Promise.resolve<DeleteDinozBuildResponse>(res.data))
			.catch(err => Promise.reject(err));
	},
	async listClanSharedBuilds() {
		return http()
			.get(`/dinoz-build/shared/clan`)
			.then(res => Promise.resolve<ListClanSharedBuildsResponse>(res.data))
			.catch(err => Promise.reject(err));
	},
	async copySharedBuild(buildId: string) {
		return http()
			.post(`/dinoz-build/${buildId}/copy`)
			.then(res => Promise.resolve<CopyDinozBuildResponse>(res.data))
			.catch(err => Promise.reject(err));
	}
};
