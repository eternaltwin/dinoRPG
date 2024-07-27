import { Player } from '@drpg/prisma';
import { t } from 'i18next';

const translate = (key: string, user?: Pick<Player, 'lang'> | null, options?: Record<string, unknown>) =>
	t(key, { lng: user?.lang, ...options });

export default translate;
