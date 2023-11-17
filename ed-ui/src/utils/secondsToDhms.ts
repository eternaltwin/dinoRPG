export const secondsToDhms = (seconds: number) => {
	seconds = Number(seconds);
	const d = Math.floor(seconds / (3600 * 24));
	const h = Math.floor((seconds % (3600 * 24)) / 3600);
	const m = Math.floor((seconds % 3600) / 60);
	const s = Math.floor(seconds % 60);

	return {
		days: d,
		hours: h,
		minutes: m,
		seconds: s
	};
};
