import LZString from './lz-string.min.js';
import { DraftRecord, ActiveDraft, ActiveRecord } from './types';

var main = async function(){
    let getting : Promise<Array<DraftRecord>> = browser.storage.sync.get('drafts');
    // Note: I have no idea what this will do when mincount hasn't yet been set.
    let mincount : Promise<number> = browser.storage.sync.get('mincount');

    async function receiveDraft(message: ActiveDraft, sender, responder) {
        //Compression logic is totally wrong, fix it when the other end is done
        let cmp : String = LZString.compressToUTF16(message.oldDraft);
        //Consider the case of two drafts in the same thread. 
        //If you switch between them -- delete everything in the post
        //and replace with a different draft -- this logic would overwrite
        //the first draft with the second.
        //Similarly if you delete everything in the post and copy in
        //an unrelated long post.

        //Solution: recognize "deleting everything" as a new, fresh draft.
        let drafts = await getting;
        if (!message.slot) { // if (message.slot is undefined) {
            //If the draft already exists, set that slot as active;
            //otherwise, create a new draft and set the new slot as active.
            const exists = (drafts.findIndex((rec) => (rec.cmpDraft === cmp)) !== -1);

            if (!exists) 
                drafts.push({
                    cmpDraft: cmp,
                    lastModified: new Date(),
                    lastDomain: message.lastDomain
                });

            return new Promise(resolve => active);
        } else {
            //Modified (not fresh) draft; automatically overwrites the
            //indicated slot.
            drafts[message.slot] = {
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



