
var cron = require('node-cron');

cron.schedule('* * * * *', function(e) {
    button.click();
    console.log('running a task every 5 minutes');
  });