import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import { createI18n } from 'vue-i18n';
import { messages, defaultLocale } from '@/i18n';

const i18n = createI18n({
	messages,
	locale: defaultLocale,
	fallbackLocale: defaultLocale
});

createApp(App)
	.use(store)
	.use(router)
	.use(i18n)
	.mount('#app');
