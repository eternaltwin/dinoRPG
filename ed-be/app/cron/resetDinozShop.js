'use strict';

import cron from 'cron';
import db from '../models/index.js';
const DinozShop = db.dinozShop;

const resetDinozShop = {

    // Truncate table 'tb_dinoz_shop'
    resetDinozShopAtMidnight: () => {
        const CronJob = cron.CronJob;

        const cronjob = new CronJob('0 0 0 * * *', function() {
            DinozShop.destroy({ truncate: true, restartIdentity: true })
                .then(() => {
                    console.log({ status: true });
                }, (err) => {
                    console.log('Cannot truncate table tb_dinoz_shop, err : ', err);
            });
        });

        cronjob.start();
    }
}

export default resetDinozShop;