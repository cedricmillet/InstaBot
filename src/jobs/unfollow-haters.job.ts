import { getAll } from "../models/database"
import { getFollowerList, getFollowingList, unfollowNotFollowingMeUsers, getNotFollowingUsers } from '../browser/profile'
import { logWelcomeMessage, writeTextInFile, getUserListFromFile } from '../common/functions';
import { InstaBot } from '../bot';


//  Instantiate bot
(async () => {
    console.log(">>>>>> STARTING JOB : UNFOLLOW HATERS");

    logWelcomeMessage();

    const BrowserCfg = {
        headless: false, 
        devtools: false,
        args: [`--window-size=1920,1080`]
    };
    
    const bot = new InstaBot(BrowserCfg);
    await bot.init();
    await bot.login();
    const followers = await getFollowerList(bot.page);
    await unfollowNotFollowingMeUsers(bot.page, followers, 100);
})();



getAll();