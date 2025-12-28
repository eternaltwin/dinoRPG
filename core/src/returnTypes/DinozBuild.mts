import { DinozBuild } from '@drpg/prisma';

export type GetOwnDinozBuildResponse = DinozBuild[];
export type CreateDinozBuildResponse = Pick<DinozBuild, 'id'>;
export type UpdateDinozBuildResponse = never;
export type DeleteDinozBuildResponse = never;
export type ListClanSharedBuildsResponse = DinozBuild[];
export type CopyDinozBuildResponse = Pick<DinozBuild, 'id'>;
export type AssignDinozBuildResponse = never;
