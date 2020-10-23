const CronJob = require("cron").CronJob;
const db = require("../models");
const DinozShop = db.dinozShop;

module.exports = {

    // Truncate table 'tb_dinoz_shop'
    resetDinozShopAtMidnight: () => {
        var resetDinozShop = new CronJob('0 0 0 * * *', function() {
            DinozShop.destroy({ truncate: true, restartIdentity: true })
                .then(() => {
                    console.log({ status: true });
                }, (err) => {
                    console.log('Cannot truncate table tb_dinoz_shop, err : ', err);
                });
        });
        resetDinozShop.start();
    }

}