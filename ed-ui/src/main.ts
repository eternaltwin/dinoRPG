import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { localStore, sessionStore } from './store';
import { createI18n } from 'vue-i18n';
import { messages, defaultLocale, LocalesEnum } from '@/i18n';
import './css/main.scss';
import { plugin as VueTippy } from 'vue-tippy';
import { mixin } from './mixin/mixin';

const i18n = createI18n({
	messages,
	locale: localStore.getters.getLanguage || LocalesEnum.FR,
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
	.use(sessionStore)
	.use(localStore)
	.use(router)
	.use(i18n)
	.mixin(mixin)
	.use(VueTippy, vueTippyProps)
	.mount('#app');
