import cron from 'cron';
import { placeList } from '@drpg/core/models/place/PlaceList';
import { setSpecificSecret } from '../dao/secretDao.js';
import { LOGGER } from '../context.js';

const itinerantMerchant = () => {
	const CronJob = cron.CronJob;

	return new CronJob('0 0 * * MON', async () => {
		const availablePlace = Object.values(placeList).filter(p => p.itinerant === true);

		const random = Math.floor(Math.random() * availablePlace.length);
		const weekPlace = availablePlace[random];
		try {
			await setSpecificSecret('itinerant', weekPlace.placeId.toString());
			LOGGER.log(`Itinerant merchant is at ${weekPlace.name}`);
		} catch (err) {
			LOGGER.error(`Cannot set itinerant merchant place: ${err}`);
		}
	});
};

export { itinerantMerchant };
