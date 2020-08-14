import { getUniqID, scrollToBottomOfPage } from '../common/functions';
import * as chalk from "chalk";

export async function autoFollowTag(page, tag: string, followCount:number=100) : Promise<boolean> {
    return new Promise(async (resolve) => {
        console.log(chalk.yellowBright.inverse(`>>>>>>> AUTO FOLLOW TAG : ${tag} <<<<<<<<`))

        //  Go to tag page
        await page.goto(`https://www.instagram.com/explore/tags/${tag}/`);

        //  Dans la section "Plus récentes"
        await page.evaluate(async () => {
            const a = document.querySelectorAll('article > div');
            a[0].setAttribute('data-sectionid', 'most_featured');       //  meilleures publications
            a[1].setAttribute('data-sectionid', 'most_recent');         //  dernières publications
        });

        let i = 1;
        while(i<=followCount) {
            try {
                await page.waitForSelector(`a:not([data-done])`, {   timeout: 3000       });
                //  Attribuer au post un selecteur accessible pour le manipuler
                const uid = getUniqID();
                await page.evaluate((uid) => {   document.querySelector(`a:not([data-done])`).setAttribute('data-postuid', uid);     }, uid);
                //  Like & follow post
                const newFollow : boolean = await followAndLikePost(page, `a[data-postuid="${uid}"]`);
                await page.waitFor(400);
                //  Set post as done
                await page.evaluate((uid) => {   document.querySelector( `a[data-postuid="${uid}"]`).setAttribute('data-done', 'true');     }, uid);
                //  Log
                if(newFollow) {
                    console.log(chalk.underline.magenta(`New follow n°${i} / ${followCount}`));
                    
                    i++;
                }
            } catch (error) {
                //  Aucun post trouvé
                console.log(chalk.bgRed(`Aucun post trouvé, on scroll to bottom.`));
                await scrollToBottomOfPage(page);
                await page.waitForSelector(`svg[aria-label="Chargement..."]`);
                await page.waitFor(1200);
            }
        }
        console.log(chalk.yellowBright.inverse(`>>>>>>> AUTO FOLLOW TAG ${tag} FINISHED (+ ${followCount} follow) <<<<<<<<`))
        
        resolve(true);
    })
   
}

/** Retourne true si nouvel abonnement souscrit */
export async function followAndLikePost(page, postSelector='not_necessary') : Promise<boolean> {
    return new Promise(async (resolve) => {

        //  Display post dialog
        await openPostDialog(page, postSelector);

        //  Wait for post Modal
        await page.waitForSelector('article');
        await page.waitForSelector('header');

        await page.waitFor(600);

        //  Append attributes on buttons
        await page.evaluate(async (selec) => {

            function setFollowButtonData(attribute = 'data-btnfollow', value='true') {
                const btns : NodeListOf<Element> = document.querySelectorAll(`article[role="presentation"] button`);
                btns.forEach(btn => {
                    if(btn.innerHTML.includes(`abonner`)) btn.setAttribute(`data-btnfollow`, 'true');
                    else if(btn.innerHTML.includes(`abonné`)) btn.setAttribute(`data-btnunfollow`, 'true');
                });
            }

            function setLikeButtonData(attribute = 'data-btnlike', value = 'true') {
                const svg = document.querySelector(`article[role="presentation"] svg[aria-label="J’aime"]`);
                if(!svg) return;
                const btn = svg.closest(`button[type="button"]`);
                btn.setAttribute(attribute, value);
            }

            setFollowButtonData();
            setLikeButtonData();

        }, postSelector);

        const btnFollow = await page.$(`button[data-btnfollow]`);
        const btnLike = await page.$(`button[data-btnlike]`);
        let actionEmoji = {
            follow: '⭕',
            like: '⭕',
            comment: '⭕'
        }
        let newFollowApplied = false;
        try {
            //  Follow
            if (await page.$('button[data-btnfollow="true"]') !== null) {
                console.log("try to follow.... with a click")
                await btnFollow.click();
                await page.waitFor(150);
                await page.waitForSelector(`button[data-btnfollow]:not([disabled])`);       //  On attend que le bouton follow ne soit plus "disabled" i.e que le follow soit prit en compte
                actionEmoji.follow = '✅';
                newFollowApplied = true;
            } else actionEmoji.follow = `⚠️  already following`;
            //  Like
            if(btnLike) {
                await btnLike.click();
                await page.waitForSelector(`svg[aria-label="Je n’aime plus"]`);
                actionEmoji.like = '✅';
            } else actionEmoji.like = `⚠️  already liked`;
        } catch (error) {
            console.log(chalk.red.inverse(`Error when trying to follow/like : `), error)
        }
        
        //  Temporise to prevent 429 http error
        if(newFollowApplied)
            await page.waitFor(20000);

        await closePostDialog(page, postSelector);

        //  Log
        console.log(`Following \t\t` + chalk.underline(`FOLLOW:`) + ` ${actionEmoji.follow}\t\t\t\t` + chalk.underline(`LIKE:`) + ` ${actionEmoji.like}`);

        resolve(newFollowApplied);
    });
}

async function openPostDialog(page, postItemSelector) : Promise<boolean> {
    return new Promise(async (resolve) => {
        //  OPEN post dialog
        await page.evaluate(async (selec, mustScroll) => {
            const post = document.querySelector(selec);
            if(!post) { console.log("ERREUR POST INTROUVABLE  -  post = ", post, " selector= ", selec);  }
            //  Scroll to post
            post.parentElement.style.border = "3px solid orange";
            if(mustScroll)    post.scrollIntoView({behavior: "instant", block: "end"});  //  a desactiver si  (i%3)==0
            //  Click on post
            await post.click();
            console.log("successfully clicked on post ", selec)
        }, postItemSelector, true);

        resolve(true);
    });
}

async function closePostDialog(page, postItemSelector) : Promise<boolean> {
    return new Promise(async (res) => {
        //  close post dialog
        await page.evaluate(async (s) => {
            const post = document.querySelector(s);
            post.parentElement.style.border = "3px solid green";
            const dialog : any = document.querySelector('[role="dialog"]');
            await dialog.click();
        }, postItemSelector);

        res(true);
    });
}
