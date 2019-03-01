import LZString from './lz-string.min.js';
import { DraftRecord, ActiveDraft, ActiveRecord } from './types';

var main = async function(){
    let getting : Promise<Array<DraftRecord>> = browser.storage.sync.get('drafts');
    // Note: I have no idea what this will do when mincount hasn't yet been set.
    let mincount : Promise<number> = browser.storage.sync.get('mincount');
    let active : number;

    async function receiveDraft(message: ActiveDraft, sender, responder) {
        let cmp : String = LZString.compressToUTF16(message.draft);
        let drafts = await getting;
        if (message.fresh) {
            //If the draft already exists, set that slot as active;
            //otherwise, create a new draft and set the new slot as active.
            active = drafts.findIndex((rec) => (rec.cmpDraft === cmp));
            let exists = (active !== -1);
            active = exists ? active : drafts.length;

            if (!exists) 
                drafts.push({
                    cmpDraft: cmp,
                    lastModified: new Date(),
                    lastDomain: message.lastDomain
                });

            return new Promise(resolve => active);
        } else {
            //Modified (not fresh) draft; automatically overwrites (!)
            // the active draft. Make sure content.ts doesn't fail-deadly
            // here!
            drafts[active] = {
                cmpDraft: cmp,
                lastModified: new Date(),
                lastDomain: message.lastDomain
            };

            return new Promise(resolve => active);
        }
    }

    browser.runtime.onMessage.addListener(receiveDraft);

    if (await mincount )
}

main();



