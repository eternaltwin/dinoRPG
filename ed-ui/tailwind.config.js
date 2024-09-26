/** @type {import('tailwindcss').Config} */
export default {
	content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
	theme: {
		extend: {
			fontFamily: {
				berlin: ['Berlin Sans FB Demi', 'sans-serif'],
				impact: ['Impact', 'sans-serif'],
				verdana: ['Verdana', 'sans-serif']
			}
		}
	},
	plugins: []
};
