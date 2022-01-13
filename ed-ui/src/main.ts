import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { createI18n } from 'vue-i18n';
import { messages, defaultLocale } from '@/i18n';
import './css/main.scss';
import { plugin as VueTippy } from 'vue-tippy';
import { mixin } from './mixin/mixin';

const i18n = createI18n({
	messages,
	locale: defaultLocale,
	fallbackLocale: defaultLocale
});

const vueTippyProps = {
	directive: 'tippy',
	component: 'Tippy',
	defaultProps: {
		placement: 'bottom-start',
		followCursor: true,
		allowHTML: true,
		inlinePositioning: true,
		duration: [50, 50],
		hideOnClick: false
	}
};

createApp(App)
	.use(store)
	.use(router)
	.use(i18n)
	.mixin(mixin)
	.use(VueTippy, vueTippyProps)
	.mount('#app');
