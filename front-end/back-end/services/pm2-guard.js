'use strict';

const later = require('later');
//const logger = require('./logger')('guard');
const pm2 = require('pm2');

const schedule = later.parse.recur().every(10).second();

// set local timezone
later.date.localTime();

later.setInterval(pm2guard, schedule);

function pm2guard() {
  pm2.list((err, processDescriptionList) => {
    if(err) {
      //logger.error(err);
      console.log(err);
      return;
    } 
    processDescriptionList.forEach(item => {
      if(item.monit.cpu > 90) {
        pm2.restart(item.pm_id, _err => {
          if(_err) {
            //logger.error(_err);
            console.log(_err);
          } else {
            //logger.info(`pm2 restart ${item.pm_id} success!`);
            console.log(`pm2 restart ${item.pm_id} success!`);
          }
        });
      }
    })
  });
}
