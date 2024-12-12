import { prisma } from '../src/prisma.js';

async function main() {
	const itinerant = await prisma.secret.upsert({
		where: { key: 'itinerant' },
		update: {},
		create: {
			key: 'itinerant',
			value: '5'
		}
	});
	// console.log(itinerant)
}
main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async e => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
