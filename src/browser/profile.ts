import * as chalk from "chalk";
import { getUniqID, scrollToBottomOfPage, scrollToSelector } from '../common/functions';
import { config } from '../config/config';

export interface Follower {
    username ?: string;
    fullname ?: string;
    profileURI ?: string;
}

export async function getFollowerList(page) : Promise<Follower[]> {
    return new Promise(async (resolve) => {
        console.log(chalk.yellowBright(`>>>> RETREIVING ALL FOLLOWERS <<<<`))
        //  Go to profile page
        await page.goto(`https://www.instagram.com/${config.auth.user}/`, { waitUntil: 'networkidle0' });
        //  Click on "Abonnés"
        await page.waitForSelector(`a[href="/${config.auth.user}/followers/"]`, {   timeout: 5000       });
        await page.click(`a[href="/${config.auth.user}/followers/"]`);
        //  Wait for modal
        await page.waitForSelector(`div[role="dialog"] h1`);
        
        async function setFollowersListDataAttributes() {
            await page.evaluate(async () => {
                const modal = document.querySelector('div[role="dialog"] h1').closest('div[role="dialog"]');
                //const ul = modal.querySelector('ul');
                modal.setAttribute('id', 'followersmodal');
                //ul.setAttribute('id', 'followerlist');
            });
        }
        await setFollowersListDataAttributes();

        let followers : Follower[] = [];
        let flag = true;
        let i:number = 1;
        while(flag) {
            try {
                await page.waitForSelector(`#followersmodal ul li:not([data-done])`, {   timeout: 3000       });
                //  Attribuer au post un selecteur accessible pour le manipuler
                const uid = getUniqID();
                
                await page.evaluate((uid) => {  const a = document.querySelector(`#followersmodal ul li:not([data-done])`).setAttribute('data-uid', uid);     }, uid);
                //  Retreive follower data
                const follower = await page.evaluate(uid => {
                    const a = document.querySelector(`li[data-uid="${uid}"] span>a`);
                    return {    
                        username: a.innerHTML,
                        fullname: '',
                        profileURI: a.getAttribute('href')
                    } as Follower;
                }, uid);
                followers.push(follower);
                //  Set post as done
                await page.evaluate((uid) => {   document.querySelector( `li[data-uid="${uid}"]`).setAttribute('data-done', 'true');     }, uid);
                //  Log
                console.log(`Recup follower n°${i}\t${follower.username}`)

                await scrollToSelector(page, `li[data-uid="${uid}"]`)
                await page.waitFor(300);
                i++;
            } catch (error) {
                //  Aucun post trouvé
                console.log(chalk.bgRed(`No more follower.`));
                flag = false;
            }
        }

        //  Fermer la modal
        await page.evaluate(async () => {
            const closeSVG = document.querySelector(`svg[aria-label="Fermer"]`);
            const btn = closeSVG.closest(`button`);
            await btn.click();
        })

        console.log(chalk.greenBright(`>>>> FOLLOWERS COUNT : ${followers.length} <<<<`))

        resolve(followers);
    });
}