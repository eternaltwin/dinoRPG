"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import db from '../sequelize';
// Truncate table 'tb_dinoz_shop'
/*const resetDinozShopAtMidnight = (): void => {
    const CronJob = cron.CronJob;

    const cronjob: cron.CronJob = new CronJob('0 0 0 * * *', function() {
        db.dinozShop.destroy({ truncate: true, restartIdentity: true })
            .then(() => {
                console.log({ status: true });
            }).catch(err => {
                console.log('Cannot truncate table tb_dinoz_shop, err : ', err);
        });
    });

    cronjob.start();
}*/
//export { resetDinozShopAtMidnight };
//# sourceMappingURL=resetDinozShop.js.map