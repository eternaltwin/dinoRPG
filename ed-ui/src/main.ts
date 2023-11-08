import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import { localStore } from './store/index.js';
import { createI18n } from 'vue-i18n';
import { messages, defaultLocale, LocalesEnum } from './i18n/index.js';
import './css/main.scss';
import { plugin as VueTippy } from 'vue-tippy';
import { mixin } from './mixin/mixin.js';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const vueTippyProps = {
	directive: 'tippy',
	component: 'Tippy',
	defaultProps: {
		placement: 'bottom-start',
		followCursor: true,
		allowHTML: true,
		inlinePositioning: true,
		duration: [50, 50],
		hideOnClick: false,
		offset: [10, 20]
	}
};

createApp(App)
	.use(createPinia().use(piniaPluginPersistedstate))
	.use(router)
	.use(
		createI18n({
			messages,
			locale: localStore().getLanguage || LocalesEnum.FR,
			fallbackLocale: defaultLocale
		})
	)
	.mixin(mixin)
	.use(VueTippy, vueTippyProps)
	.mount('#app');
