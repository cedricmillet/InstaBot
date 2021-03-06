import * as chalk from "chalk";
import { User } from '../models';
const fs = require('fs')

/**
 * Generate and return uniqID
 * @param len uniqID's length
 */
export function getUniqID(len = 5) {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 10;
    var randomstring = '';
    for (var x=0;x<string_length;x++) {
        var letterOrNumber = Math.floor(Math.random() * 2);
        if (letterOrNumber == 0) {
            var newNum = Math.floor(Math.random() * 9);
            randomstring += newNum;
        } else {
            var rnum = Math.floor(Math.random() * chars.length);
            randomstring += chars.substring(rnum,rnum+1);
        }
    }
    return randomstring;
}


export async function scrollToBottomOfPage(page) : Promise<boolean> {
    return new Promise(async () => {
        await page.evaluate(() => {
            const footer = document.querySelector(`footer`);
            footer.scrollIntoView();
        });
    });
}

export async function scrollToSelector(page, selector) : Promise<boolean> {
    return new Promise(async (res) => {
        await page.evaluate((selector) => {
            const e = document.querySelector(selector);
            if(e) e.scrollIntoView();
            else console.log("scroll to bottom of selector, element introuvable = ", selector)
        }, selector);
        res(true);
    });
}


export function logWelcomeMessage() {
    console.log(chalk.magenta(".__                 __        ___.           __    ") );
    console.log(chalk.magenta("|__| ____   _______/  |______ \\_ |__   _____/  |_  ") );
    console.log(chalk.magenta("|  |/    \\ /  ___/\\   __\\__  \\ | __ \\ /  _ \\   __\\ ") );
    console.log(chalk.magenta("|  |   |  \\\\___ \\  |  |  / __ \\| \\_\\ ( <_> )  |   ") );
    console.log(chalk.magenta("|__|___|  /____  > |__| (____  /___  /\____/|__|   ") );
    console.log(chalk.magenta("        \\/     \\/            \\/    \\/              \t\t\t") + chalk.greenBright("by Cedric MILLET"));

}


export function writeTextInFile(fileName:string = 'text.txt', fileContent:string="ABC") {
    fs.writeFile(fileName, fileContent, function (err) {
    if (err) return console.log(err);
        console.log('Ecriture dans le fichier : ', fileName);
    });
}

export function getUserListFromFile(fileName:string) : Promise<User[]> {
    return new Promise((res) => {
        fs.readFile(fileName, function (err, data) {
        if (err) throw err;
            res(JSON.parse(data));
        });
    });
}