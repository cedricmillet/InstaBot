import { getAll } from "./models/database"
import { getFollowerList, getFollowingList, unfollowNotFollowingMeUsers, getNotFollowingUsers } from '../src/browser/profile'
import { logWelcomeMessage, writeTextInFile, getUserListFromFile } from '../src/common/functions';
import { InstaBot } from './bot';


//  Instantiate bot
(async () => {

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
    
    //await bot.autoFollowTag(`climbing`, 100);

    const followers = await getFollowerList(bot.page);
    await unfollowNotFollowingMeUsers(bot.page, followers, 100);

    /*
    const followers = await getFollowerList(bot.page);
    const following = await getFollowingList(bot.page);
    const diff = getNotFollowingUsers(followers, following);
    writeTextInFile('not-following-me.txt', JSON.stringify(diff));
    writeTextInFile('following.txt', JSON.stringify(following));
    writeTextInFile('followers.txt', JSON.stringify(followers));
    console.log(`followers: ${followers.length} - following: ${following.length} - diff = ${following.length-followers.length}`)
    console.log("utilisateurs qui ne me suivent pas : ", diff.length)
    */
})();



getAll();