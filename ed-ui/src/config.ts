const environment = 'dev';

import configDev from '@/config/dev.json';
import configProd from '@/config/prod.json';

const configToExport = environment === 'dev' ? configDev : configProd;

export default configToExport;
