export interface PlayerOptions {
	hasPDA: boolean;
	hasPMI: boolean;
	hasPAC: boolean;
	currentDinozId?: number;
	skipFight: boolean;
	skipLevel: boolean;
	archivedSiteId: number | null;
	shareArchivedData: boolean;
}
