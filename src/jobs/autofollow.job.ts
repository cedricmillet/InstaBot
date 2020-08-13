import { getAll } from "../models/database"
import { getFollowerList, getFollowingList, unfollowNotFollowingMeUsers, getNotFollowingUsers } from '../browser/profile'
import { logWelcomeMessage, writeTextInFile, getUserListFromFile } from '../common/functions';
import { InstaBot } from '../bot';


//  Instantiate bot
(async () => {
    console.log(">>>>>> STARTING JOB : AUTO FOLLOW TAG");

    logWelcomeMessage();

    const BrowserCfg = {
        headless: false, 
        devtools: false,
        args: [`--window-size=1920,1080`]
    };

    const tagListInput : string[] = [
        "climbing",         //12.8M
        "climb",            //3.6M
        "rockclimbing",     //4.2M
        "outdoors",         //58.3M
        "psicobloc",        //20.9k
        "psicoblock"        //1.9k
    ];
    const tagListOutput : string[] = [
        "climbing",
        "rockclimbing",
        "outdoor",
        "nature",
        "adventure",
        "bouldering",
        "mountain",
        "follow4follow"
    ];
    
    
    const bot = new InstaBot(BrowserCfg);
    await bot.init();
    await bot.login();
    await bot.autoFollowTag(`climbing`, 150);
})();



getAll();