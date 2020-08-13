import * as chalk from "chalk";
import { getUniqID, scrollToBottomOfPage, scrollToSelector } from '../common/functions';
import { config } from '../config/config';
import { User } from '../models';

export async function getFollowerList(page) : Promise<User[]> {
    return new Promise(async (res) => {
        const followers = await getModalList(page, 'followers');
        res(followers);
    })
}

export async function getFollowingList(page) : Promise<User[]> {
    return new Promise(async (res) => {
        const following = await getModalList(page, 'following');
        res(following);
    })
}

export async function getModalList(page, type:string='followers|following') : Promise<User[]> {
    return new Promise(async (resolve) => {
        console.log(chalk.yellowBright(`>>>> RETREIVING ALL ${type.toUpperCase()} <<<<`))
        //  Go to profile page
        await page.goto(`https://www.instagram.com/${config.auth.user}/`, { waitUntil: 'networkidle0' });
        //  Click on "Abonnés" or "Abonnements"
        let tag = 'followers';
        if(type !== 'followers') tag = 'following';
        await page.waitForSelector(`a[href="/${config.auth.user}/${tag}/"]`, {   timeout: 5000       });
        await page.click(`a[href="/${config.auth.user}/${tag}/"]`);
        //  Wait for modal
        await page.waitForSelector(`div[role="dialog"] h1`);
        //  Attribute id on modal
        await page.evaluate(async () => {
            const modal = document.querySelector('div[role="dialog"] h1').closest('div[role="dialog"]');
            modal.setAttribute('id', 'modal4548');
        });


        let list : User[] = [];
        let flag = true;
        let i:number = 1;
        while(flag) {
            try {
                await page.waitForSelector(`#modal4548 ul li:not([data-done])`, {   timeout: 5000       });
                //  Attribute UID on follower 4 easier manipulation
                const uid = getUniqID();
                await page.evaluate((uid) => {  const a = document.querySelector(`#modal4548 ul li:not([data-done])`).setAttribute('data-uid', uid);     }, uid);
                //  Retreive user data
                const user = await page.evaluate(uid => {
                    const a = document.querySelector(`li[data-uid="${uid}"] span>a`);
                    return {    
                        username: a.innerHTML,
                        fullname: '',
                        profileURI: a.getAttribute('href')
                    } as User;
                }, uid);
                list.push(user);
                //  Set post as "done"
                await page.evaluate((uid) => {   document.querySelector( `li[data-uid="${uid}"]`).setAttribute('data-done', 'true');     }, uid);
                //  Log
                console.log(`Retreiving ${type} n° ${i}\t${user.username}`)

                await scrollToSelector(page, `li[data-uid="${uid}"]`)
                await page.waitFor(100);
                i++;
            } catch (error) {
                //  Aucun post trouvé
                console.log(chalk.bgRed(`No more ${type}.`));
                flag = false;
            }
        }

        //  Fermer la modal
        /*
        await page.evaluate(async () => {
            const closeSVG = document.querySelector(`svg[aria-label="Fermer"]`);
            const btn = closeSVG.closest(`button`);
            await btn.click();
        })*/
        await closeUserModal(page);

        console.log(chalk.greenBright(`>>>> FOLLOWERS COUNT : ${list.length} <<<<`))

        resolve(list);
    });
}


export async function unfollowNotFollowingMeUsers(page, followersList:User[]=[], timeInterval:number=1000) : Promise<User[]> {
    return new Promise(async (resolve) => {
        console.log(chalk.yellowBright(`>>>> RESEARCH NOT FOLLOW USERS<<<<`))

        //  Si aucune liste de followers n'est fournit, on la récupère
        if(followersList.length==0) followersList = await getFollowerList(page);

        
        //  Go to profile page
        await page.goto(`https://www.instagram.com/${config.auth.user}/`, { waitUntil: 'networkidle0' });
        //  Click on "Abonnements"
        await page.waitForSelector(`a[href="/${config.auth.user}/following/"]`, {   timeout: 5000       });
        await page.click(`a[href="/${config.auth.user}/following/"]`);
        //  Wait for modal
        await page.waitForSelector(`div[role="dialog"] h1`);
        //  Attribute id on modal
        await page.evaluate(async () => {
            const modal = document.querySelector('div[role="dialog"] h1').closest('div[role="dialog"]');
            modal.setAttribute('id', 'modal4549');
        });


        let list : User[] = [];
        let flag = true;
        let i=1;
        while(flag) {
            try {
                await page.waitForSelector(`#modal4549 ul li:not([data-done])`, {   timeout: 5000       });
                //  Attribute UID on follower 4 easier manipulation
                const uid = getUniqID();
                await page.evaluate((uid) => {  const a = document.querySelector(`#modal4549 ul li:not([data-done])`).setAttribute('data-uid', uid);     }, uid);
                //  Retreive user data
                const user = await page.evaluate(uid => {
                    const a = document.querySelector(`li[data-uid="${uid}"] span>a`);
                    return {    
                        username: a.innerHTML,
                        fullname: '',
                        profileURI: a.getAttribute('href')
                    } as User;
                }, uid);
                

                const userIsFollowingMe = followersList.find((follower) => { return follower.username == user.username; });
                if(!userIsFollowingMe) {
                    list.push(user);    //  push de la liste des méchants
                    await setElementBackgroundColor(page, `li[data-uid="${uid}"]`, '#dc3545');
                    const success = await unfollowUser(page, `li[data-uid="${uid}"] button[type="button"]`);
                    console.log('⭕\t\t', chalk.redBright(`${user.username}\t\t`), success ? chalk.yellow('SUCCESSFULY UNFOLLOWED'): 'ERROR WHEN TRYING TO UNFOLLOW');
                    await page.waitFor(timeInterval);    
                    //  wait to prevent 429 errors
                    i++;
                    if(i%17==0) {
                        const delaytInMinuts = 8;
                        console.log(chalk.underline(`Afin de prevenir des erreurs HTTP 429, interruption de ${delaytInMinuts} min.`));
                        
                        for(let a=1;a<=delaytInMinuts;a++) {
                            await page.waitFor(1000*60);
                            console.log(chalk.grey(`${delaytInMinuts-a} min(s) restante(s).`));
                        }
                    }
                } else {
                    console.log('✅\t\t', chalk.greenBright(`${user.username}`));
                    await setElementBackgroundColor(page, `li[data-uid="${uid}"]`, '#28a745');
                }

                //  Set post as "done"
                await page.evaluate((uid) => {   document.querySelector( `li[data-uid="${uid}"]`).setAttribute('data-done', 'true');     }, uid);

                await scrollToSelector(page, `li[data-uid="${uid}"]`)
                await page.waitFor(100);
                
            } catch (error) {
                //  Aucun post trouvé
                console.log(chalk.bgRed(`No more following.`));
                flag = false;
            }
        }

        //  Fermer la modal
        /*
        await page.evaluate(async () => {
            const closeSVG = document.querySelector(`svg[aria-label="Fermer"]`);
            const btn = closeSVG.closest(`button`);
            await btn.click();
        })*/
        await closeUserModal(page);

        console.log(chalk.bgYellowBright(`>>>> NOT FOLLOWING COUNT : ${list.length} <<<<`))

        resolve(list);
    });
}


export function unfollowUser(page, unfollowBtnSelector) : Promise<boolean> {
    return new Promise(async (resolve) => {
        try {
            await page.evaluate((unfollowBtnSelector) => {
                const btn = document.querySelector(unfollowBtnSelector);
                if(btn) {
                    console.log("unfollow user.")
                    btn.click();    //unfollow now !
                    
                } else console.log("Unfollow button unreachable !")
            }, unfollowBtnSelector);

            
            
            //wait for [role="dialog"]
            await waitForUnfollowModal(page);
    
            await page.evaluate(async() => {
                const btns = document.querySelectorAll(`div[role="dialog"] button`);
                btns.forEach(async btn => {
                    if(btn.innerHTML == 'Se désabonner') {
                        await (<any>btn).click();
                        return;
                    }
                });
            });
    
            //  attente que l'unfollow soit prit en compte
            await page.waitFor(60);
            await page.waitForSelector(`${unfollowBtnSelector}:not([disabled])`, {   timeout: 15000       });
            
            resolve(true);
        } catch (error) {
            console.log('une erreur est survenue dans unfollowUser() : ', error);
            resolve(false);
        }
    });
}


export function getNotFollowingUsers(followers:User[], following:User[]) : User[] {
    let list : User[] = [];
    following.forEach(iFollowThisGuy => {
        const a = followers.find((f) => { return f.username === iFollowThisGuy.username });
        if(!a) list.push(iFollowThisGuy);
    });
    return list;
}

export function closeUserModal(page) : Promise<boolean> {
    return new Promise(async (res) => {
        //  Fermer la modal
        await page.evaluate(async () => {
            const closeSVG = document.querySelector(`svg[aria-label="Fermer"]`);
            const btn = closeSVG.closest(`button`);
            await btn.click();
        })
        res(true);
    });
}

function waitForUnfollowModal(page) : Promise<boolean> {
    return new Promise(async (res) => {
        await page.waitForFunction(
            () => {
                let flag = false;
                const btns = document.querySelectorAll(`div[role="dialog"] button`);
                btns.forEach(btn => {
                    if(btn.innerHTML == 'Se désabonner') {
                        flag = true;
                        return;
                    }
                });
                return flag;
            },
            {}        
        );
        res(true);
    });
}


export function setElementBackgroundColor(page, elementSelector:string, color:string='red') : Promise<boolean> {
    return new Promise(async (res) => {
        await page.evaluate((elementSelector, bgColor) => {
            const li : HTMLElement= document.querySelector(elementSelector);
            if(li) li.style.backgroundColor = bgColor;
        }, elementSelector, color);
        res(true);
    });
}
