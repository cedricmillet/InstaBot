import * as chalk from "chalk";
import { config } from './config/config';
const puppeteer = require('puppeteer');     //  https://devdocs.io/puppeteer/
import { autoFollowTag } from '../src/browser/explore.tags';


export class InstaBot {
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
        await page.setViewport({ width: 0, height: 0 });
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