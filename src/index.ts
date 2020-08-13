const puppeteer = require('puppeteer');     //  https://devdocs.io/puppeteer/
import { config } from './config/config';
import * as chalk from "chalk";
import { getAll } from "./models/database"
import { autoFollowTag } from '../src/browser/explore.tags';
import { getFollowerList } from '../src/browser/profile'
import { logWelcomeMessage } from '../src/common/functions';

class InstaBot {
    browserCfg;
    page;

    constructor(browserCfg) {
        this.browserCfg = browserCfg;
    }

    async init() {
        this.page = await this.createBrowser();
    }

    /**
     * Création du navigateur
     */
    async createBrowser() : Promise<any> {
        console.log(chalk.blue.inverse("Starting web client instance..."));
        const browser = await puppeteer.launch(this.browserCfg);
        const page = await browser.newPage();
        return new Promise((res) => {
            res(page)
        });
    }

    /**
     * Se rendre su la page login & se connecter
     */
    async login() : Promise<boolean> {
        return new Promise(async (res) => {
            
            await this.page.goto(config.auth.url);
            await this.page.waitForSelector('input[name="username"]');
            const inputs = {
                user: await this.page.$('input[name="username"]'),
                pass: await this.page.$('input[name="password"]'),
                submit: await this.page.$('button[type="submit"]')
            }
    
            await inputs.user.type(config.auth.user, { delay: 100 });
            await inputs.pass.type(config.auth.pass, { delay: 100 });
            
            inputs.submit.click({waitUntil: 'domcontentloaded'});
            console.log(chalk.green.inverse("Authentification........."), "✅");
            await this.page.waitFor(3000)

            res(true);
        });
    }

    /**
     * Follow all users of tag's page
     * @param tag 
     */
    async autoFollowTag(tag: string, followCount:number=100) {
        await autoFollowTag(this.page, tag, followCount);
    }


}


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
    let followers = await getFollowerList(bot.page);

})();



getAll();