import { LogType } from '@drpg/prisma';
import { Request } from 'express';
import { getLogList, getLogListAll, getLogListByDate } from '../dao/logDao.js';

const getAllLogs = async () => {
	return getLogListAll();
};

const getLogs = async (req: Request) => {
	const page = req.params.page ? +req.params.page : 1;
	const type = req.params.type === 'null' ? undefined : (req.params.type as LogType);
	const playerId = req.params.playerId === 'null' ? undefined : req.params.playerId;
	const dinozId = req.params.dinozId === 'null' ? undefined : +req.params.dinozId;
	return await getLogList(page, type, playerId, dinozId);
};

const getLogsByDate = async (req: Request) => {
	const type = req.params.type === 'null' ? undefined : (req.params.type as LogType | undefined);
	const fromDate = req.params.fromDate === 'null' ? undefined : new Date(req.params.fromDate);

	const now = new Date();
	const diffDays = calculateDateDifference(fromDate, now);

	// Retrieve the logs from the database
	const logs = await getLogListByDate(type, fromDate);

	// Group the logs by period (day or hour)
	const totalsByPeriod = calculateTotalsByPeriod(logs, diffDays);

	return totalsByPeriod;
};

// Calculate the difference in days
const calculateDateDifference = (fromDate: Date | undefined, toDate: Date): number => {
	if (!fromDate) return 0;
	const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Conversion du temps en jours
};

// Group the logs by period (day or hour)
const calculateTotalsByPeriod = (logs: any[], diffDays: number): Record<string, number> => {
	const totalsByPeriod: Record<string, number> = {};
	logs.forEach(log => {
		const logDate = new Date(log.createdAt);
		const period = formatPeriod(logDate, diffDays);
		if (!totalsByPeriod[period]) {
			totalsByPeriod[period] = 0;
		}
		totalsByPeriod[period] += getLogTypeTotal(log.type, log.values);
	});
	return totalsByPeriod;
};

// Format the period based on the difference in days (day or hour)
const formatPeriod = (logDate: Date, diffDays: number): string => {
	if (diffDays > 1) {
		// If the difference is greater than 1 day, group by day
		return logDate.toLocaleDateString();
	}

	// If it's the same day, group by hour
	const formattedDate = logDate.toLocaleDateString();
	const formattedHour = logDate.getHours().toString().padStart(2, '0') + ':00';
	return `${formattedDate} ${formattedHour}`;
};

// Function to retrieve the values based on the log type
const getLogTypeTotal = (type: LogType, values: any[]): number => {
	switch (type) {
		case 'GoldWon':
		case 'GoldLost':
		case 'XPEarned':
		case 'HPLost':
			return Number(values[0]);
		case 'ItemBought':
		case 'IngredientSold':
			return Number(values[1]);
		default:
			return 1;
	}
};

export { getAllLogs, getLogs, getLogsByDate };
