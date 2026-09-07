export interface PlayerOptions {
	hasPDA: boolean;
	hasPMI: boolean;
	hasPAC: boolean;
	currentDinozId?: number;
	skipFight: boolean;
	skipLevel: boolean;
	autoReequipItems: boolean;
	bypassGatheringGrid: boolean;
	archivedSiteId: number | null;
	shareArchivedData: boolean;
	displayedNotifications: number;
}
