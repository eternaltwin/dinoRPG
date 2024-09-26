/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		extend: {
			backgroundImage: {
				'left-homepage': "url('./src/assets/background/bg_ciel.webp')",
				'center-homepage-large': "url('./src/assets/background/sky_headerbg_02.webp')",
				'center-homepage-small': "url('./src/assets/background/sky_headerbg.webp')",
				'right-homepage': "url('./src/assets/background/bg_ciel.webp')"
			}
		}
	},
	plugins: [],
	purge: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}']
};
