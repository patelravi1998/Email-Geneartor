import cron from 'node-cron';
import UserService from "../services/UserService";


// Every day at 9:00 AM

cron.schedule('0 9 * * *', async () => {
    console.log('⏰ Running daily subscription email job at 09:00 AM IST');
    if(process.env.NODE_ENV==="PRODUCTION"){
        await UserService.sendEmailSubscription();
    }
  }, {
    timezone: 'Asia/Kolkata'
});
  


