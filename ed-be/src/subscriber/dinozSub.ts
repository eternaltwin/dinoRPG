/*
import { EventSubscriber, InsertEvent, EntitySubscriberInterface, UpdateEvent } from 'typeorm';
import { Dinoz, Ranking } from '../entity/index.js';

// This should probably be redone using prisma.$on

@EventSubscriber()
export class DinozSubscriber implements EntitySubscriberInterface<Dinoz> {
	dinoz: Dinoz;

	listenTo() {
		return Dinoz;
	}

	afterLoad(entity: Dinoz) {
		this.dinoz = entity;
	}

	//There shouldn't have insert except for dinoz buy
	async beforeInsert(event: InsertEvent<any>) {
		const dinoz = event.entity as Partial<Dinoz>;
		if (dinoz.level && dinoz.player) {
			const rank = dinoz.player.rank as Ranking;
			rank.dinozCount++;
			rank.sumPoints += dinoz.level;
			rank.averagePoints = Math.round(rank.sumPoints / rank.dinozCount);
			event.manager.save(rank);
		}
	}

	async beforeUpdate(event: UpdateEvent<any>) {
		const dinoz = event.entity as Partial<Dinoz>;
		const updateDinoz: Partial<Dinoz> | null = await event.manager.findOne(Dinoz, {
			where: {
				id: dinoz.id
			},
			select: {
				player: {
					id: true
				}
			},
			//Add relation when add specific subscribers event for the dinoz update
			relations: ['player', 'player.rank']
		});
		// Level up
		if (dinoz.level && updateDinoz && updateDinoz.player && updateDinoz.level) {
			const rank = updateDinoz.player.rank as Ranking;
			rank.sumPoints += updateDinoz.level - dinoz.level;
			rank.averagePoints = Math.round(rank.sumPoints / rank.dinozCount);
			event.manager.save(rank);
		}
	}
}
*/
