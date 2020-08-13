import * as chalk from "chalk";

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


export function logWelcomeMessage() {
    console.log(chalk.magenta(".__                 __        ___.           __    ") );
    console.log(chalk.magenta("|__| ____   _______/  |______ \\_ |__   _____/  |_  ") );
    console.log(chalk.magenta("|  |/    \\ /  ___/\\   __\\__  \\ | __ \\ /  _ \\   __\\ ") );
    console.log(chalk.magenta("|  |   |  \\\\___ \\  |  |  / __ \\| \\_\\ ( <_> )  |   ") );
    console.log(chalk.magenta("|__|___|  /____  > |__| (____  /___  /\____/|__|   ") );
    console.log(chalk.magenta("        \\/     \\/            \\/    \\/              \t\t\t") + chalk.greenBright("by Cedric MILLET"));

}