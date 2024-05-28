import cron from 'cron';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { MapZone } from '@drpg/core/models/enums/MapZone';
import { setSpecificSecret } from '../dao/secretDao.js';
import { LOGGER } from '../context.js';

const itinerantMerchant = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 * * MON', async () => {
		const availablePlace = Object.values(placeList)
			.filter(p => p.map === MapZone.ILES || p.map === MapZone.DINOLAND || p.map === MapZone.GTOUTCHAUD)
			.filter(p => p.alias === undefined);

		const random = Math.round(Math.random() * availablePlace.length);
		const weekPlace = availablePlace[random];
		try {
			await setSpecificSecret('itinerant', weekPlace.placeId.toString());
			LOGGER.log(`Itinerant merchant is at ${weekPlace.name}`);
		} catch (err) {
			console.error(`Cannot heal resting dinoz: ${err}`);
		}
	});
};

export { itinerantMerchant };
