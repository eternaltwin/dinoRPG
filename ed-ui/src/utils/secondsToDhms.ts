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

export const simplifyDisplay = (displayedTime: string) => {
	const regex = /( ?\d+)(\w)/g;

	// Remove values that are 0
	return displayedTime.replace(regex, '');
};
