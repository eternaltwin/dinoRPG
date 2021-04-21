import { DinozRace } from '../models';

const getRacesDetailsRequest = (
	raceArray: Array<string>
): Promise<Array<DinozRace>> => {
	return DinozRace.findAll({
		where: { name: raceArray },
	});
};

export { getRacesDetailsRequest };
